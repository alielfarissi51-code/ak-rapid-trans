<?php

namespace App\Channels;

use App\Models\AdminNotification;
use Illuminate\Notifications\Notification;

class AdminNotificationChannel
{
    /**
     * Deliver a notification to the admin_notifications table.
     *
     * The notification class must implement toAdminDatabase().
     * We use firstOrCreate on (commande_id, type) so the channel is safe to
     * call multiple times (e.g. once per admin user) without creating duplicates —
     * admin_notifications is a shared feed, not per-user.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toAdminDatabase')) {
            return;
        }

        $data = $notification->toAdminDatabase($notifiable);

        // Pull the match keys out of the payload; everything else is defaults.
        $match    = array_filter([
            'commande_id' => $data['commande_id'] ?? null,
            'type'        => $data['type'] ?? 'truck_assigned',
        ]);
        $defaults = array_diff_key($data, $match);

        AdminNotification::firstOrCreate($match, $defaults);
    }
}
