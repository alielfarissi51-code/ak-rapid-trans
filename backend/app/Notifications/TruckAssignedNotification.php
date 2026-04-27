<?php

namespace App\Notifications;

use App\Channels\AdminNotificationChannel;
use App\Models\Camion;
use App\Models\Commande;
use Illuminate\Notifications\Notification;

class TruckAssignedNotification extends Notification
{
    public const TYPE = 'truck_assigned';

    public function __construct(
        public readonly Commande $commande,
        public readonly Camion $camion,
    ) {}

    // -----------------------------------------------------------------------
    // Laravel Notification contract
    // -----------------------------------------------------------------------

    /**
     * Deliver through the custom admin-notification database channel.
     */
    public function via(object $notifiable): array
    {
        return [AdminNotificationChannel::class];
    }

    /**
     * Data written to the admin_notifications table.
     * Called by AdminNotificationChannel::send().
     */
    public function toAdminDatabase(object $notifiable): array
    {
        return [
            'commande_id' => $this->commande->id,
            'client_name' => $this->commande->user?->name,
            'title'       => 'Nouvelle affectation de camion',
            'message'     => self::formatMessage($this->camion, $this->commande),
            'type'        => self::TYPE,
            'is_read'     => false,
        ];
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Compose the human-readable assignment message.
     *
     * Example:
     *   "Le camion AB-123-CD (Renault) a été affecté à la commande #42
     *    de Casablanca vers Rabat."
     */
    public static function formatMessage(Camion $camion, Commande $commande): string
    {
        return sprintf(
            'Le camion %s (%s) a été affecté à la commande #%d de %s vers %s.',
            $camion->matricule,
            $camion->marque,
            $commande->id,
            $commande->lieu_depart,
            $commande->lieu_arrivee,
        );
    }
}
