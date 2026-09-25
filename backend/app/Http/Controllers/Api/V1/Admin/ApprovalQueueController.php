<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\InstagramReel;
use App\Models\PhotoGallery;
use App\Models\YouTubeVideo;
use App\Models\UploadedVideo;
use App\Models\User;
use App\Models\AdminNotification;
use App\Services\EditorialWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalQueueController extends Controller
{
    protected EditorialWorkflowService $workflow;

    public function __construct(EditorialWorkflowService $workflow)
    {
        $this->workflow = $workflow;
    }

    public function index(Request $request): JsonResponse
    {
        $type = $request->query('type', 'all');

        $pendingArticles = Article::where('status', 'pending_review')
            ->with(['author', 'category', 'city', 'district'])
            ->orderByDesc('updated_at')
            ->get();

        $pendingReels = InstagramReel::where('status', 'pending_review')
            ->with(['author', 'category', 'city'])
            ->orderByDesc('created_at')
            ->get();

        $pendingVideos = YouTubeVideo::where('status', 'pending_review')
            ->with(['author', 'category', 'city'])
            ->orderByDesc('created_at')
            ->get();

        $pendingGalleries = PhotoGallery::where('status', 'pending_review')
            ->with(['author', 'category', 'images'])
            ->orderByDesc('created_at')
            ->get();

        $pendingUploadedVideos = UploadedVideo::pending()
            ->with(['author', 'category', 'district', 'city'])
            ->get();

        $totalCount = $pendingArticles->count() 
            + $pendingReels->count() 
            + $pendingVideos->count() 
            + $pendingGalleries->count() 
            + $pendingUploadedVideos->count();

        return response()->json([
            'success' => true,
            'data' => [
                'articles' => $pendingArticles,
                'reels' => $pendingReels,
                'videos' => $pendingVideos,
                'galleries' => $pendingGalleries,
                'uploaded_videos' => $pendingUploadedVideos,
                'counts' => [
                    'articles' => $pendingArticles->count(),
                    'reels' => $pendingReels->count(),
                    'videos' => $pendingVideos->count(),
                    'galleries' => $pendingGalleries->count(),
                    'uploaded_videos' => $pendingUploadedVideos->count(),
                    'total' => $totalCount,
                ],
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $article = Article::with(['category', 'subcategory', 'district', 'city', 'author', 'tags', 'revisions.user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $article,
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $approved = $this->workflow->approveArticle($article, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Article approved successfully',
            'data' => $approved,
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:5|max:1000',
        ]);

        $article = Article::findOrFail($id);
        $rejected = $this->workflow->rejectArticle($article, $request->user(), $request->input('reason'));

        return response()->json([
            'success' => true,
            'message' => 'Article rejected and returned to author with feedback',
            'data' => $rejected,
        ]);
    }

    public function publish(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $published = $this->workflow->publishArticle($article, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Article published to live website',
            'data' => $published,
        ]);
    }

    public function schedule(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'scheduled_at' => 'required|date|after:now',
        ]);

        $article = Article::findOrFail($id);
        $scheduled = $this->workflow->scheduleArticle($article, $request->user(), $request->input('scheduled_at'));

        return response()->json([
            'success' => true,
            'message' => 'Article scheduled successfully for ' . $request->input('scheduled_at'),
            'data' => $scheduled,
        ]);
    }

    public function unpublish(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->update([
            'status' => 'draft',
            'published_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Article unpublished and returned to draft',
            'data' => $article,
        ]);
    }

    public function archive(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->update(['status' => 'archived']);

        return response()->json([
            'success' => true,
            'message' => 'Article archived',
            'data' => $article,
        ]);
    }

    public function approveReel(Request $request, int $id): JsonResponse
    {
        $reel = InstagramReel::findOrFail($id);
        $reel->update([
            'status' => 'published',
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Instagram Reel approved and published',
            'data' => $reel,
        ]);
    }

    public function rejectReel(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);
        $reel = InstagramReel::findOrFail($id);
        $reel->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Instagram Reel rejected',
            'data' => $reel,
        ]);
    }

    public function approveVideo(Request $request, int $id): JsonResponse
    {
        $video = YouTubeVideo::findOrFail($id);
        $video->update([
            'status' => 'published',
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'YouTube video approved and published',
            'data' => $video,
        ]);
    }

    public function rejectVideo(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);
        $video = YouTubeVideo::findOrFail($id);
        $video->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'YouTube video rejected',
            'data' => $video,
        ]);
    }

    public function approveGallery(Request $request, int $id): JsonResponse
    {
        $gallery = PhotoGallery::findOrFail($id);
        $gallery->update([
            'status' => 'published',
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Photo gallery approved and published',
            'data' => $gallery,
        ]);
    }

    public function rejectGallery(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);
        $gallery = PhotoGallery::findOrFail($id);
        $gallery->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Photo gallery rejected',
            'data' => $gallery,
        ]);
    }

    public function approveUploadedVideo(Request $request, int $id): JsonResponse
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

        if ($video->uploaded_by) {
            AdminNotification::create([
                'user_id' => $video->uploaded_by,
                'type' => 'video_approved',
                'title' => 'વિડિયો મંજૂર થયો છે',
                'message' => "તમારો વિડિયો '{$video->title}' મુખ્ય સંપાદક દ્વારા મંજૂર કરાયો છે અને વેબસાઇટ પર લાઈવ થયો છે.",
                'data' => ['video_id' => $video->id],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો સફળતાપૂર્વક મંજૂર અને પ્રકાશિત કરવામાં આવ્યો છે (Approved & Published).',
            'data' => $video->fresh(['author', 'category', 'district', 'city']),
        ]);
    }

    public function rejectUploadedVideo(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string|min:5|max:1000']);
        $video = UploadedVideo::findOrFail($id);
        $reason = $request->input('reason');

        $video->update([
            'status' => 'rejected',
            'approval_status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        if ($video->uploaded_by) {
            AdminNotification::create([
                'user_id' => $video->uploaded_by,
                'type' => 'video_rejected',
                'title' => 'વિડિયોમાં સુધારા સૂચવવામાં આવ્યા છે',
                'message' => "મુખ્ય સંપાદક દ્વારા તમારા વિડિયો '{$video->title}' માં સુધારા માંગવામાં આવ્યા છે. કારણ: {$reason}",
                'data' => ['video_id' => $video->id, 'reason' => $reason],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો રિજેક્ટ કરવામાં આવ્યો છે અને સંવાદદાતાને કારણ સાથે સૂચના મોકલવામાં આવી છે.',
            'data' => $video,
        ]);
    }
}
