<?php

namespace App\Http\Controllers\Api\V1\Staff;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\InstagramReel;
use App\Models\PhotoGallery;
use App\Models\User;
use App\Models\YouTubeVideo;
use App\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StaffMediaController extends Controller
{
    protected MediaUploadService $uploader;

    public function __construct(MediaUploadService $uploader)
    {
        $this->uploader = $uploader;
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:51200', // up to 50MB
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:255',
            'credit' => 'nullable|string|max:255',
        ]);

        $media = $this->uploader->upload($request->file('file'), $request->user(), [
            'alt_text' => $request->input('alt_text'),
            'caption' => $request->input('caption'),
            'credit' => $request->input('credit'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => [
                'id' => $media->id,
                'url' => $media->full_url,
                'filename' => $media->filename,
                'type' => $media->type,
                'size' => $media->size,
                'width' => $media->width,
                'height' => $media->height,
            ],
        ], 201);
    }

    public function submitReel(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'caption' => 'nullable|string',
            'instagram_url' => 'required|url|max:1000',
            'thumbnail_url' => 'nullable|string|max:1000',
            'media_url' => 'nullable|string|max:1000',
            'category_id' => 'nullable|exists:categories,id',
            'district_id' => 'nullable|exists:districts,id',
            'city_id' => 'nullable|exists:cities,id',
            'status' => 'nullable|string|in:draft,pending_review,published',
            'publish_immediately' => 'nullable',
        ]);

        $user = $request->user();
        $isChannelHead = $user->isChannelHead();
        $reqStatus = $request->input('status', 'pending_review');

        if ($isChannelHead && ($reqStatus === 'published' || $request->boolean('publish_immediately') || $request->input('publish_immediately') == '1')) {
            $status = 'published';
            $validated['published_at'] = now();
        } else {
            $status = 'pending_review';
        }

        $validated['author_id'] = $user->id;
        $validated['status'] = $status;

        $reel = InstagramReel::create($validated);

        // Notify Channel Head only if submitted for review by staff
        if ($status === 'pending_review') {
            $channelHeads = User::where('role', 'channel_head')->get();
            foreach ($channelHeads as $ch) {
                AdminNotification::create([
                    'user_id' => $ch->id,
                    'type' => 'reel_submitted',
                    'title' => 'નવી રીલ મંજૂરી માટે રજૂ થઈ',
                    'message' => "પત્રકાર '{$user->name}' દ્વારા ઇન્સ્ટાગ્રામ રીલ '{$reel->title}' રજૂ કરાઈ છે.",
                    'data' => ['reel_id' => $reel->id],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'ઇન્સ્ટાગ્રામ રીલ મુખ્ય સંપાદકની મંજૂરી માટે મોકલાઈ ગઈ છે.',
                'data' => $reel,
            ], 201);
        }

        return response()->json([
            'success' => true,
            'message' => 'ઇન્સ્ટાગ્રામ રીલ સીધી લાઈવ પબ્લિશ થઈ ગઈ છે અને હોમપેજ પર દેખાશે!',
            'data' => $reel,
        ], 201);
    }

    public function submitVideo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'description' => 'nullable|string',
            'youtube_url' => 'required|url|max:1000',
            'thumbnail_url' => 'nullable|string|max:1000',
            'duration' => 'nullable|string|max:30',
            'category_id' => 'nullable|exists:categories,id',
            'district_id' => 'nullable|exists:districts,id',
            'city_id' => 'nullable|exists:cities,id',
        ]);

        // Extract video ID from youtube URL
        $videoId = $this->extractYoutubeId($validated['youtube_url']);
        if (!$videoId) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid YouTube URL. Please provide a valid YouTube video link.',
            ], 422);
        }

        $validated['video_id'] = $videoId;
        if (empty($validated['thumbnail_url'])) {
            $validated['thumbnail_url'] = "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";
        }

        $validated['author_id'] = $request->user()->id;
        $validated['status'] = 'pending_review';

        $video = YouTubeVideo::create($validated);

        // Notify Channel Head
        $channelHeads = User::where('role', 'channel_head')->get();
        foreach ($channelHeads as $ch) {
            AdminNotification::create([
                'user_id' => $ch->id,
                'type' => 'video_submitted',
                'title' => 'નવો વિડીયો મંજૂરી માટે રજૂ થયો',
                'message' => "પત્રકાર '{$request->user()->name}' દ્વારા યૂટ્યુબ વિડીયો '{$video->title}' રજૂ કરાયો છે.",
                'data' => ['video_id' => $video->id],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'YouTube video submitted for Channel Head review',
            'data' => $video,
        ], 201);
    }

    public function submitGallery(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'description' => 'nullable|string',
            'cover_image' => 'required|string|max:1000',
            'category_id' => 'nullable|exists:categories,id',
            'district_id' => 'nullable|exists:districts,id',
            'city_id' => 'nullable|exists:cities,id',
            'images' => 'required|array|min:1',
            'images.*.image_url' => 'required|string',
            'images.*.caption' => 'nullable|string',
            'images.*.credit' => 'nullable|string',
        ]);

        $gallery = PhotoGallery::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . time(),
            'description' => $validated['description'] ?? null,
            'cover_image' => $validated['cover_image'],
            'category_id' => $validated['category_id'] ?? null,
            'district_id' => $validated['district_id'] ?? null,
            'city_id' => $validated['city_id'] ?? null,
            'author_id' => $request->user()->id,
            'status' => 'pending_review',
        ]);

        foreach ($validated['images'] as $idx => $img) {
            $gallery->images()->create([
                'image_url' => $img['image_url'],
                'caption' => $img['caption'] ?? null,
                'credit' => $img['credit'] ?? null,
                'sort_order' => $idx + 1,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Photo gallery submitted for Channel Head review',
            'data' => $gallery->fresh('images'),
        ], 201);
    }

    protected function extractYoutubeId(string $url): ?string
    {
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
