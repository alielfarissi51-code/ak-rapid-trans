<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;

class AdminNotificationController extends Controller
{
    public function getUnread()
    {
        $notifications = AdminNotification::query()
            ->where('is_read', false)
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'data' => $notifications,
            'unread_count' => $notifications->count(),
        ]);
    }

    public function markAsRead(int $id)
    {
        $notification = AdminNotification::findOrFail($id);

        if (! $notification->is_read) {
            $notification->update(['is_read' => true]);
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'data' => $notification->fresh(),
        ]);
    }

    public function markAllAsRead()
    {
        AdminNotification::query()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }
}
