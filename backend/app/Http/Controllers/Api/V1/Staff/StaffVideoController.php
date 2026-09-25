<?php

namespace App\Http\Controllers\Api\V1\Staff;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\UploadedVideo;
use App\Models\User;
use App\Services\VideoStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StaffVideoController extends Controller
{
    protected VideoStorageService $storage;

    public function __construct(VideoStorageService $storage)
    {
        $this->storage = $storage;
    }

    /**
     * List current user's uploaded videos.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = UploadedVideo::where('uploaded_by', $user->id)
            ->with(['category', 'district', 'city']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $videos = $query->orderByDesc('updated_at')->paginate(15);

        $counts = [
            'draft' => UploadedVideo::where('uploaded_by', $user->id)->where('status', 'draft')->count(),
            'pending' => UploadedVideo::where('uploaded_by', $user->id)->where('status', 'pending_review')->count(),
            'published' => UploadedVideo::where('uploaded_by', $user->id)->where('status', 'published')->count(),
            'rejected' => UploadedVideo::where('uploaded_by', $user->id)->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $videos->items(),
            'counts' => $counts,
            'meta' => [
                'current_page' => $videos->currentPage(),
                'last_page' => $videos->lastPage(),
                'total' => $videos->total(),
            ],
        ]);
    }

    /**
     * Upload and store a new video file.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'caption' => 'nullable|string',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'district_id' => 'nullable|exists:districts,id',
            'city_id' => 'nullable|exists:cities,id',
            'video' => 'required|file',
            'thumbnail' => 'nullable', // can be uploaded file or base64 string
            'duration' => 'nullable|string|max:50',
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
            'status' => 'nullable|in:draft,pending_review,published',
        ]);

        $user = $request->user();

        // 1. Store video file safely in storage/app/public/videos/
        $videoMeta = $this->storage->storeVideoFile($request->file('video'));

        // 2. Store thumbnail (uploaded image or canvas-generated data URL)
        $thumbnailPath = $this->storage->storeThumbnail($request->file('thumbnail') ?? $request->input('thumbnail'));

        // 3. Register in Media Library
        $this->storage->registerInMediaLibrary($videoMeta['file_path'], $request->file('video'), $user, $validated['title']);

        $status = $validated['status'] ?? 'pending_review';
        $approvalStatus = 'pending';
        $approvedBy = null;
        $approvedAt = null;
        $publishedAt = null;

        // If Channel Head uploads and requests publishing, make it live immediately
        if ($user->isChannelHead() && ($status === 'published' || $request->boolean('publish_immediately') || $request->input('publish_immediately') == '1')) {
            $status = 'published';
            $approvalStatus = 'approved';
            $approvedBy = $user->id;
            $approvedAt = now();
            $publishedAt = now();
        } else {
            if ($status === 'published') {
                $status = 'pending_review';
            }
        }

        $slug = Str::slug($validated['title']);
        if (empty($slug)) {
            $slug = 'video-' . substr($videoMeta['uuid'], 0, 8);
        }
        $slug .= '-' . time();

        $video = UploadedVideo::create([
            'uuid' => $videoMeta['uuid'],
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'caption' => $validated['caption'] ?? null,
            'source_type' => 'uploaded',
            'file_path' => $videoMeta['file_path'],
            'thumbnail_path' => $thumbnailPath,
            'original_filename' => $videoMeta['original_filename'],
            'mime_type' => $videoMeta['mime_type'],
            'file_size' => $videoMeta['file_size'],
            'duration' => $validated['duration'] ?? null,
            'width' => $validated['width'] ?? null,
            'height' => $validated['height'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'district_id' => $validated['district_id'] ?? null,
            'city_id' => $validated['city_id'] ?? null,
            'uploaded_by' => $user->id,
            'status' => $status,
            'approval_status' => $approvalStatus,
            'approved_by' => $approvedBy,
            'approved_at' => $approvedAt,
            'published_at' => $publishedAt,
        ]);

        // If submitted for review immediately, notify Channel Head
        if ($status === 'pending_review') {
            $channelHeads = User::where('role', 'channel_head')->get();
            foreach ($channelHeads as $ch) {
                AdminNotification::create([
                    'user_id' => $ch->id,
                    'type' => 'video_submitted',
                    'title' => 'નવો વિડિયો મંજૂરી માટે રજૂ થયો',
                    'message' => "પત્રકાર '{$user->name}' દ્વારા વિડિયો '{$video->title}' મંજૂરી માટે રજૂ કરાયો છે.",
                    'data' => [
                        'video_id' => $video->id,
                        'source_type' => 'uploaded',
                    ],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => $status === 'published'
                ? 'વિડિયો સફળતાપૂર્વક અપલોડ થઈ ગયો છે અને શોર્ટ વિડીયો & રીલ્સ વિભાગમાં લાઈવ થઈ ગયો છે (Video published live).'
                : ($status === 'pending_review'
                    ? 'વિડિયો સફળતાપૂર્વક અપલોડ થઈ ગયો છે અને ચેનલ હેડની મંજૂરી માટે મોકલાયો છે (Video submitted for approval).'
                    : 'વિડિયો ડ્રાફ્ટ તરીકે સાચવવામાં આવ્યો છે (Draft saved).'),
            'data' => $video->fresh(['category', 'district', 'city']),
        ], 201);
    }

    /**
     * Show single video details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $video = UploadedVideo::where('uploaded_by', $request->user()->id)
            ->with(['category', 'district', 'city'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $video,
        ]);
    }

    /**
     * Update video metadata or replace file.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $video = UploadedVideo::where('uploaded_by', $request->user()->id)->findOrFail($id);

        if (!in_array($video->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'ચકાસણી હેઠળ અથવા પ્રકાશિત થયેલ વિડિયોમાં સીધો ફેરફાર કરી શકાતો નથી (Cannot edit pending or published video).',
            ], 422);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:500',
            'caption' => 'nullable|string',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'district_id' => 'nullable|exists:districts,id',
            'city_id' => 'nullable|exists:cities,id',
            'video' => 'nullable|file',
            'thumbnail' => 'nullable',
            'duration' => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('video')) {
            $newMeta = $this->storage->storeVideoFile($request->file('video'));
            // Delete old file
            $this->storage->deleteFiles($video->file_path, null);
            $video->file_path = $newMeta['file_path'];
            $video->original_filename = $newMeta['original_filename'];
            $video->mime_type = $newMeta['mime_type'];
            $video->file_size = $newMeta['file_size'];
        }

        if ($request->hasFile('thumbnail') || $request->filled('thumbnail')) {
            $newThumb = $this->storage->storeThumbnail($request->file('thumbnail') ?? $request->input('thumbnail'));
            if ($newThumb) {
                $this->storage->deleteFiles(null, $video->thumbnail_path);
                $video->thumbnail_path = $newThumb;
            }
        }

        if (isset($validated['title'])) {
            $video->title = $validated['title'];
        }
        if (array_key_exists('caption', $validated)) {
            $video->caption = $validated['caption'];
        }
        if (array_key_exists('description', $validated)) {
            $video->description = $validated['description'];
        }
        if (array_key_exists('category_id', $validated)) {
            $video->category_id = $validated['category_id'];
        }
        if (array_key_exists('district_id', $validated)) {
            $video->district_id = $validated['district_id'];
        }
        if (array_key_exists('city_id', $validated)) {
            $video->city_id = $validated['city_id'];
        }
        if (array_key_exists('duration', $validated)) {
            $video->duration = $validated['duration'];
        }

        $video->save();

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો વિગતો સફળતાપૂર્વક અપડેટ થઈ ગઈ છે (Updated).',
            'data' => $video->fresh(['category', 'district', 'city']),
        ]);
    }

    /**
     * Submit draft or rejected video for review.
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        $video = UploadedVideo::where('uploaded_by', $request->user()->id)->findOrFail($id);

        $video->update([
            'status' => 'pending_review',
            'approval_status' => 'pending',
            'rejection_reason' => null,
        ]);

        // Notify Channel Head
        $channelHeads = User::where('role', 'channel_head')->get();
        foreach ($channelHeads as $ch) {
            AdminNotification::create([
                'user_id' => $ch->id,
                'type' => 'video_submitted',
                'title' => 'વિડિયો પુનઃ ચકાસણી માટે રજૂ થયો',
                'message' => "પત્રકાર '{$request->user()->name}' દ્વારા વિડિયો '{$video->title}' મંજૂરી માટે ફરી મોકલાયો છે.",
                'data' => ['video_id' => $video->id],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો સફળતાપૂર્વક મુખ્ય સંપાદકને ચકાસણી માટે મોકલાયો છે.',
            'data' => $video,
        ]);
    }

    /**
     * Delete video.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $video = UploadedVideo::where('uploaded_by', $request->user()->id)->findOrFail($id);

        if ($video->status === 'published') {
            return response()->json([
                'success' => false,
                'message' => 'પ્રકાશિત થયેલ વિડિયો ડિલીટ કરવા માટે ચેનલ હેડની મંજૂરી જરૂરી છે.',
            ], 403);
        }

        $this->storage->deleteFiles($video->file_path, $video->thumbnail_path);
        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'વિડિયો સફળતાપૂર્વક ડિલીટ કરાયો છે.',
        ]);
    }
}
