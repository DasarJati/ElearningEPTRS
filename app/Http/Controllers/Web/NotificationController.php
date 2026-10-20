<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = $request->user()->notifications()
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => 'admin_message',
                'sender' => $notification->data['sender'] ?? 'Admin PTRS',
                'title' => $notification->data['title'] ?? '',
                'message' => $notification->data['message'] ?? '',
                'image' => $notification->data['image'] ?? null,
                'created_at' => $notification->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'items' => $messages,
        ]);
    }

    public function markRead(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['string', 'uuid'],
        ]);

        $request->user()->unreadNotifications()
            ->whereIn('id', $data['ids'])
            ->update(['read_at' => now()]);

        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }
}
