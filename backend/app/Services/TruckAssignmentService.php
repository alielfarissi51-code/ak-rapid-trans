<?php

namespace App\Services;

use App\Channels\AdminNotificationChannel;
use App\Models\AdminNotification;
use App\Models\Camion;
use App\Models\Commande;
use App\Models\User;
use App\Notifications\TruckAssignedNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class TruckAssignmentService
{
    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Score all candidate trucks and return the best one for this commande.
     *
     * Scoring criteria (higher = better):
     *   +2  – truck's base location matches the departure city
     *   0–2 – capacity score, normalised relative to the candidate pool
     *
     * Ties are broken by raw capacity (heavier truck wins).
     *
     * This method performs NO database writes — it can be called safely
     * inside an existing transaction.
     */
    public function selectBestTruck(Commande $commande, Collection $candidates): ?Camion
    {
        if ($candidates->isEmpty()) {
            return null;
        }

        $departure   = strtolower(trim($commande->lieu_depart));
        $maxCapacity = max(1, $candidates->max('capacite'));

        return $candidates
            ->map(fn (Camion $camion) => [
                'camion' => $camion,
                // Composite sort key: score dominates, capacity breaks ties
                'rank'   => $this->score($camion, $departure, $maxCapacity) * 100_000
                            + $camion->capacite,
            ])
            ->sortByDesc('rank')
            ->first()['camion'];
    }

    /**
     * Find and assign the best available truck to an existing commande.
     *
     * Runs inside its own transaction with a SELECT … FOR UPDATE lock so
     * concurrent requests cannot grab the same truck simultaneously.
     * The notification is dispatched AFTER the transaction commits so that a
     * rollback never produces a phantom notification record.
     *
     * Returns the assigned Camion, or null when no truck is available.
     */
    public function assign(Commande $commande): ?Camion
    {
        $camion = DB::transaction(function () use ($commande) {
            $candidates = Camion::where('statut', 'disponible')
                ->lockForUpdate()
                ->get();

            $camion = $this->selectBestTruck($commande, $candidates);

            if (! $camion) {
                return null;
            }

            $camion->update(['statut' => 'occupe']);
            $commande->update(['camion_id' => $camion->id]);

            return $camion->fresh();
        });

        if ($camion) {
            // Load the user relation needed for the notification message, then notify.
            $this->notifyAssignment($commande->load('user'), $camion);
        }

        return $camion;
    }

    /**
     * Dispatch a TruckAssignedNotification to all admin users via the Laravel
     * notification pipeline.
     *
     * The custom AdminNotificationChannel uses firstOrCreate on (commande_id, type)
     * so this is idempotent — one DB record is written regardless of how many
     * admin accounts exist or how many times this is called.
     *
     * Returns the created-or-found AdminNotification record.
     */
    public function notifyAssignment(Commande $commande, Camion $camion): ?AdminNotification
    {
        $notification = new TruckAssignedNotification($commande, $camion);

        $admins = User::where('role', 'admin')->get();

        if ($admins->isNotEmpty()) {
            // Dispatch through Laravel's pipeline — the channel deduplicates.
            Notification::send($admins, $notification);
        } else {
            // No admin users exist yet: invoke the channel directly so the
            // admin_notifications record is still written.
            app(AdminNotificationChannel::class)->send(new \stdClass(), $notification);
        }

        return AdminNotification::where('commande_id', $commande->id)
            ->where('type', TruckAssignedNotification::TYPE)
            ->latest()
            ->first();
    }

    /**
     * Release the truck assigned to this commande back to "disponible".
     *
     * Only transitions trucks that are currently "occupe" — avoids
     * accidentally un-setting a maintenance or other admin-managed status.
     *
     * Safe to call inside an existing transaction.
     */
    public function release(Commande $commande): void
    {
        if (! $commande->camion_id) {
            return;
        }

        Camion::where('id', $commande->camion_id)
            ->where('statut', 'occupe')
            ->update(['statut' => 'disponible']);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Compute a score for one truck candidate.
     *
     * @param  Camion  $camion
     * @param  string  $departure    Lower-cased departure city from the commande
     * @param  int     $maxCapacity  Highest capacity in the candidate pool (for normalisation)
     */
    private function score(Camion $camion, string $departure, int $maxCapacity): int
    {
        $score = 0;

        // City-proximity bonus: +2 when the truck's base location matches the departure city.
        // We do a bidirectional substring check to handle partial names
        // (e.g. "Casablanca" in "Casablanca-Centre").
        if ($camion->localisation) {
            $location = strtolower(trim((string) $camion->localisation));

            if ($location !== '' && $departure !== '' && (
                str_contains($location, $departure) ||
                str_contains($departure, $location)
            )) {
                $score += 2;
            }
        }

        // Capacity score: 0–2 points, normalised against the best truck in the pool.
        // A truck at max capacity gets +2; a truck at half capacity gets +1.
        $score += (int) round(($camion->capacite / $maxCapacity) * 2);

        return $score;
    }
}
