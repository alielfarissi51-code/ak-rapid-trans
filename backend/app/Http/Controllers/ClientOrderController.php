<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\Camion;
use App\Models\Client;
use App\Models\Commande;
use App\Services\TruckAssignmentService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientOrderController extends Controller
{
    public function __construct(private readonly TruckAssignmentService $trucks) {}

    public function summary(Request $request)
    {
        $clientId = (int) $request->user()->id;

        try {
            $summary = DB::select('CALL sp_client_commandes_status_summary(?)', [$clientId]);
        } catch (\Throwable) {
            $summary = Commande::query()
                ->selectRaw('statut, COUNT(*) AS total, COALESCE(SUM(prix), 0) AS total_amount')
                ->where('user_id', $clientId)
                ->groupBy('statut')
                ->orderByDesc('total')
                ->get();
        }

        return response()->json(['data' => $summary]);
    }

    public function index(Request $request)
    {
        $orders = Commande::with(['client', 'camion'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    /**
     * Create a new commande and automatically assign the best available truck.
     *
     * The truck selection and order creation run inside a single transaction
     * with a SELECT … FOR UPDATE lock on disponible trucks, so two concurrent
     * requests cannot grab the same truck.
     *
     * Returns 422 if no truck is currently available.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lieu_depart'    => ['required', 'string', 'max:255'],
            'lieu_arrivee'   => ['required', 'string', 'max:255'],
            'date_transport' => ['required', 'date'],
            'prix'           => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->user();

        $client = Client::query()->firstOrCreate(
            ['email' => $user->email],
            ['nom' => $user->name, 'telephone' => '-', 'adresse' => null]
        );

        [$commande, $camion] = DB::transaction(function () use ($validated, $client, $user) {
            // Lock all disponible trucks to prevent concurrent double-assignment.
            $candidates = Camion::where('statut', 'disponible')
                ->lockForUpdate()
                ->get();

            if ($candidates->isEmpty()) {
                // Throw inside the transaction — Laravel rolls back and returns the response.
                throw new HttpResponseException(
                    response()->json([
                        'message' => 'Aucun camion disponible pour le moment. Veuillez réessayer plus tard.',
                    ], 422)
                );
            }

            // Create the order (no camion_id yet — assigned below).
            $commande = Commande::create([
                'user_id'        => $user->id,
                'client_id'      => $client->id,
                'camion_id'      => null,
                'lieu_depart'    => $validated['lieu_depart'],
                'lieu_arrivee'   => $validated['lieu_arrivee'],
                'date_transport' => $validated['date_transport'],
                'prix'           => $validated['prix'] ?? null,
                'statut'         => 'en_attente',
                'verified'       => false,
            ]);

            // Notify admin of the new order (type = new_order).
            AdminNotification::firstOrCreate(
                ['commande_id' => $commande->id, 'type' => 'new_order'],
                [
                    'client_name' => $user->name,
                    'title'       => 'Nouvelle commande',
                    'message'     => 'Un client a créé une nouvelle commande.',
                    'is_read'     => false,
                ]
            );

            // Select the best truck using AI-like scoring and assign it.
            $camion = $this->trucks->selectBestTruck($commande, $candidates);
            $camion->update(['statut' => 'occupe']);
            $commande->update(['camion_id' => $camion->id]);

            return [$commande->load(['client', 'camion']), $camion->fresh()];
        });

        // Dispatch the truck-assignment notification AFTER the transaction so
        // a rollback cannot produce a phantom notification record.
        $assignmentNotification = $this->trucks->notifyAssignment(
            $commande->load('user'),
            $camion
        );

        return response()->json([
            'commande'     => $commande,
            'camion'       => $camion,
            'notification' => $assignmentNotification,
            'message'      => "Commande créée. Camion {$camion->matricule} assigné automatiquement.",
        ], 201);
    }

    public function show(Request $request, Commande $commande)
    {
        if ((int) $commande->user_id !== (int) $request->user()->id) {
            abort(403, 'Access denied.');
        }

        return response()->json($commande->load(['client', 'camion']));
    }
}
