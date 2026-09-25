<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactMessageController extends Controller
{
    /**
     * List contact messages with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query();

        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'total' => $messages->total(),
                'per_page' => $messages->perPage(),
            ],
        ]);
    }

    /**
     * Return count summary for message inbox badges.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'new' => ContactMessage::where('status', 'new')->count(),
                'read' => ContactMessage::where('status', 'read')->count(),
                'replied' => ContactMessage::where('status', 'replied')->count(),
                'archived' => ContactMessage::where('status', 'archived')->count(),
                'total' => ContactMessage::count(),
            ],
        ]);
    }

    /**
     * Show single message details and mark as read if new.
     */
    public function show(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);

        if ($message->status === 'new') {
            $message->update([
                'status' => 'read',
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    /**
     * Update message status (read, replied, archived, new) or admin notes.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:new,read,replied,archived',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $message = ContactMessage::findOrFail($id);
        $newStatus = $request->input('status');

        $updates = [
            'status' => $newStatus,
        ];

        if ($request->has('admin_notes')) {
            $updates['admin_notes'] = $request->input('admin_notes');
        }

        if ($newStatus === 'read' && !$message->read_at) {
            $updates['read_at'] = now();
        }

        if ($newStatus === 'replied' && !$message->replied_at) {
            $updates['replied_at'] = now();
        }

        $message->update($updates);

        return response()->json([
            'success' => true,
            'message' => 'સંદેશાની સ્થિતિ સફળતાપૂર્વક અપડેટ થઈ.',
            'data' => $message,
        ]);
    }

    /**
     * Soft delete message.
     */
    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'સંદેશો સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો છે.',
        ]);
    }
}
