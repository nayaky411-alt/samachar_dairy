<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\UploadedVideo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVideoController extends Controller
{
    /**
     * Get pending videos for Channel Head approval queue.
     */
    public function pending(Request $request): JsonResponse
    {
        $videos = UploadedVideo::pending()
            ->with(['author', 'category', 'district', 'city'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $videos,
            'count' => $videos->count(),
        ]);
    }

    /**
     * List all uploaded videos (all statuses) with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = UploadedVideo::with(['author', 'category', 'district', 'city', 'approvedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $q = $request->query('search');
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('caption', 'like', "%{$q}%")
                    ->orWhere('original_filename', 'like', "%{$q}%");
            });
        }

        $videos = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $videos->items(),
            'meta' => [
                'current_page' => $videos->currentPage(),
                'last_page' => $videos->lastPage(),
                'total' => $videos->total(),
            ],
        ]);
    }

    /**
     * Get single video with complete metadata for Channel Head player.
     */
    public function show(int $id): JsonResponse
    {
        $video = UploadedVideo::with(['author', 'category', 'district', 'city', 'approvedBy'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $video,
        ]);
    }

    /**
     * Approve and publish video to public website.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $video = UploadedVideo::findOrFail($id);

        $video->update([
            'status' => 'published',
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        // Send notification to author
        if ($video->uploaded_by) {
            AdminNotification::create([
                'user_id' => $video->uploaded_by,
                'type' => 'video_approved',
                'title' => 'વિડિયો મંજૂર થયો છે',
                'message' => "તમારો વિડિયો '{$video->title}' મુખ્ય સંપાદક દ્વારા મંજૂર કરાયો છે અને વેબસાઇટ પર લાઈવ થઈ ગયો છે.",
                'data' => [
                    'video_id' => $video->id,
                    'slug' => $video->slug,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો સફળતાપૂર્વક મંજૂર કરવામાં આવ્યો છે અને વેબસાઇટ પર લાઈવ થયો છે (Video approved and published live).',
            'data' => $video->fresh(['author', 'category', 'district', 'city']),
        ]);
    }

    /**
     * Reject or request changes with a mandatory reason.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:5|max:1000',
        ]);

        $video = UploadedVideo::findOrFail($id);
        $reason = $request->input('reason');

        $video->update([
            'status' => 'rejected',
            'approval_status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        // Send notification to author with the mandatory feedback
        if ($video->uploaded_by) {
            AdminNotification::create([
                'user_id' => $video->uploaded_by,
                'type' => 'video_rejected',
                'title' => 'વિડિયોમાં સુધારા સૂચવવામાં આવ્યા છે',
                'message' => "મુખ્ય સંપાદક દ્વારા તમારા વિડિયો '{$video->title}' માં સુધારા માંગવામાં આવ્યા છે. કારણ: {$reason}",
                'data' => [
                    'video_id' => $video->id,
                    'reason' => $reason,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો રિજેક્ટ કરવામાં આવ્યો છે અને સંવાદદાતાને કારણ સાથે સૂચના મોકલવામાં આવી છે.',
            'data' => $video,
        ]);
    }

    /**
     * Publish video directly.
     */
    public function publish(Request $request, int $id): JsonResponse
    {
        return $this->approve($request, $id);
    }

    /**
     * Archive video.
     */
    public function archive(Request $request, int $id): JsonResponse
    {
        $video = UploadedVideo::findOrFail($id);

        $video->update([
            'status' => 'archived',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો સફળતાપૂર્વક આર્કાઇવ કરવામાં આવ્યો છે.',
            'data' => $video,
        ]);
    }

    /**
     * Delete video.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $video = UploadedVideo::findOrFail($id);
        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો ડિલીટ કરવામાં આવ્યો છે.',
        ]);
    }
}
