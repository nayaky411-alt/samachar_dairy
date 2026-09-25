<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Article;
use App\Models\BreakingNews;
use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\HomepageSection;
use App\Models\InstagramReel;
use App\Models\PhotoGallery;
use App\Models\AdminNotification;
use App\Models\ContactMessage;
use App\Models\Setting;
use App\Models\Topic;
use App\Models\UploadedVideo;
use App\Models\User;
use App\Models\VideoView;
use App\Models\YouTubeVideo;
use App\Services\AnalyticsService;
use App\Services\GeoService;
use App\Services\MarketDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function homepage(MarketDataService $marketService): JsonResponse
    {
        $sections = HomepageSection::active()->get();
        $data = [];

        // Breaking News
        $breakingNews = BreakingNews::active()->take(5)->get();

        // Hero Articles
        $heroArticles = Article::published()
            ->with(['category', 'city', 'district', 'author'])
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->take(5)
            ->get();

        // Gujarat News
        $gujaratNews = Article::published()
            ->whereNotNull('district_id')
            ->with(['category', 'city', 'district', 'author'])
            ->orderByDesc('published_at')
            ->take(6)
            ->get();

        // Latest News
        $latestNews = Article::published()
            ->with(['category', 'city', 'author'])
            ->orderByDesc('published_at')
            ->take(8)
            ->get();

        // Business News
        $businessCategory = Category::where('slug', 'business')->first();
        $businessNews = $businessCategory ? Article::published()
            ->where('category_id', $businessCategory->id)
            ->with(['category', 'author'])
            ->orderByDesc('published_at')
            ->take(4)
            ->get() : [];

        // Sports News
        $sportsCategory = Category::where('slug', 'sports')->first();
        $sportsNews = $sportsCategory ? Article::published()
            ->where('category_id', $sportsCategory->id)
            ->with(['category', 'author'])
            ->orderByDesc('published_at')
            ->take(4)
            ->get() : [];

        // Videos
        $videos = YouTubeVideo::published()->take(4)->get();

        // Reels & Short Videos (Combined Uploaded & Instagram Reels)
        $reels = $this->getCombinedReels(10);

        // Galleries
        $galleries = PhotoGallery::published()->with('images')->take(4)->get();

        // Market Data
        $marketOverview = $marketService->getMarketOverview();

        // Uploaded Videos (Field & Local Video Reports)
        $uploadedVideos = UploadedVideo::published()
            ->with(['category', 'district', 'city', 'author'])
            ->take(8)
            ->get();

        // Advertisements
        $ads = [
            'header_banner' => Advertisement::byPlacement('desktop_banner')->first(),
            'sidebar_banner' => Advertisement::byPlacement('sidebar')->first(),
            'mobile_banner' => Advertisement::byPlacement('mobile_banner')->first(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'sections' => $sections,
                'breaking_news' => $breakingNews,
                'hero' => $heroArticles,
                'gujarat_news' => $gujaratNews,
                'latest_news' => $latestNews,
                'business_news' => $businessNews,
                'sports_news' => $sportsNews,
                'videos' => $videos,
                'uploaded_videos' => $uploadedVideos,
                'reels' => $reels,
                'galleries' => $galleries,
                'market' => $marketOverview,
                'advertisements' => $ads,
            ],
        ]);
    }

    public function news(Request $request): JsonResponse
    {
        $query = Article::published()->with(['category', 'city', 'district', 'author']);

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->query('category'))->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        if ($request->filled('district')) {
            $district = District::where('slug', $request->query('district'))->first();
            if ($district) {
                $query->where('district_id', $district->id);
            }
        }

        if ($request->filled('city')) {
            $city = City::where('slug', $request->query('city'))->first();
            if ($city) {
                $query->where('city_id', $city->id);
            }
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->query('tag'));
            });
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $perPage = min((int)$request->query('per_page', 12), 50);
        $articles = $query->orderByDesc('published_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function article(string $slug, AnalyticsService $analytics): JsonResponse
    {
        $article = Article::published()
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)
                  ->orWhere('id', is_numeric($slug) ? (int)$slug : 0);
            })
            ->with(['category', 'subcategory', 'district', 'city', 'author', 'tags', 'relatedArticles.category'])
            ->firstOrFail();

        // Increment view count
        try {
            $analytics->recordEvent(request(), 'view', 'article', $article->id);
            $article->increment('views_count');
        } catch (\Throwable) {}

        // Clean WordPress shortcodes and format content HTML
        if (!empty($article->content)) {
            $article->content = $this->cleanArticleContent($article->content);
        }

        // Fetch more from same category
        $relatedFromCategory = Article::published()
            ->where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->with(['category', 'city', 'district', 'author'])
            ->orderByDesc('published_at')
            ->take(4)
            ->get();

        // Fetch more from same city/district if present
        $relatedFromLocation = $article->district_id ? Article::published()
            ->where('district_id', $article->district_id)
            ->where('id', '!=', $article->id)
            ->with(['category', 'city', 'district', 'author'])
            ->orderByDesc('published_at')
            ->take(4)
            ->get() : [];

        return response()->json([
            'success' => true,
            'data' => [
                'article' => $article,
                'related_from_category' => $relatedFromCategory,
                'related_from_location' => $relatedFromLocation,
            ],
        ]);
    }

    /**
     * Clean WordPress shortcodes, embed codes, and sanitize article content.
     */
    protected function cleanArticleContent(?string $content): string
    {
        if (empty($content)) {
            return '';
        }

        // 1. Convert WordPress [video src="..."] shortcodes to HTML5 video tag
        $content = preg_replace_callback('/\[video[^\]]*src=["\']([^"\']+)["\'][^\]]*\]/i', function ($matches) {
            $videoUrl = htmlspecialchars($matches[1], ENT_QUOTES, 'UTF-8');
            return '<div class="my-6 rounded-2xl overflow-hidden bg-black shadow-md"><video controls class="w-full max-h-[480px]" preload="metadata"><source src="' . $videoUrl . '" type="video/mp4">Your browser does not support HTML5 video.</video></div>';
        }, $content);

        // 2. Convert WordPress [caption ...]<img ... /> Caption text[/caption]
        $content = preg_replace_callback('/\[caption[^\]]*\](.*?)\[\/caption\]/is', function ($matches) {
            $inner = $matches[1];
            if (preg_match('/<img[^>]+>/i', $inner, $imgMatch)) {
                $img = $imgMatch[0];
                $captionText = trim(strip_tags(str_replace($img, '', $inner)));
                return '<figure class="my-6 text-center"><div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 inline-block max-w-full">' . $img . '</div>' . ($captionText ? '<figcaption class="text-xs text-slate-500 mt-2 font-medium italic">' . htmlspecialchars($captionText) . '</figcaption>' : '') . '</figure>';
            }
            return $inner;
        }, $content);

        // 3. Convert Youtube embed shortcodes [embed]https://www.youtube.com/watch?v=...[/embed]
        $content = preg_replace_callback('/\[embed\]\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)[^\s<]*)\s*\[\/embed\]/i', function ($matches) {
            $videoId = $matches[2];
            return '<div class="my-6 relative aspect-video rounded-2xl overflow-hidden shadow-md"><iframe src="https://www.youtube.com/embed/' . $videoId . '" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe></div>';
        }, $content);

        // 4. Remove unhandled remaining shortcodes [shortcode ...]
        $content = preg_replace('/\[\/?([a-zA-Z0-9_-]+)[^\]]*\]/', '', $content);

        return $content;
    }

    public function breakingNews(): JsonResponse
    {
        $breaking = BreakingNews::active()->take(10)->get();

        return response()->json([
            'success' => true,
            'data' => $breaking,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::active()->withCount(['articles' => function ($q) {
            $q->published();
        }])->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function category(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $articles = Article::published()
            ->where('category_id', $category->id)
            ->with(['city', 'district', 'author'])
            ->orderByDesc('published_at')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'articles' => $articles->items(),
            ],
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function districts(GeoService $geoService): JsonResponse
    {
        $districts = $geoService->getDistrictsWithCounts();

        return response()->json([
            'success' => true,
            'data' => $districts,
        ]);
    }

    public function districtNews(string $slug, GeoService $geoService): JsonResponse
    {
        $result = $geoService->getDistrictNews($slug);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function cities(): JsonResponse
    {
        $cities = City::active()->with('district')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $cities,
        ]);
    }

    public function cityNews(string $slug): JsonResponse
    {
        $city = City::where('slug', $slug)->with('district')->firstOrFail();
        $articles = Article::published()
            ->where('city_id', $city->id)
            ->with(['category', 'author'])
            ->orderByDesc('published_at')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => [
                'city' => $city,
                'articles' => $articles->items(),
            ],
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function market(MarketDataService $marketService): JsonResponse
    {
        $overview = $marketService->getMarketOverview();

        return response()->json([
            'success' => true,
            'data' => $overview,
        ]);
    }

    public function marketIndices(MarketDataService $marketService): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $marketService->getIndices(),
        ]);
    }

    public function marketGainers(MarketDataService $marketService): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $marketService->getTopGainers(),
        ]);
    }

    public function marketLosers(MarketDataService $marketService): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $marketService->getTopLosers(),
        ]);
    }

    public function marketStatus(MarketDataService $marketService): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $marketService->getMarketStatus(),
        ]);
    }

    public function reels(Request $request): JsonResponse
    {
        $limit = min(50, max(1, (int) $request->query('per_page', 24)));
        $items = $this->getCombinedReels($limit);

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'total' => count($items),
            ],
        ]);
    }

    /**
     * Retrieve combined published reels and short videos (Uploaded & Instagram).
     */
    protected function getCombinedReels(int $limit = 12): array
    {
        $uploaded = UploadedVideo::published()
            ->with(['category', 'district', 'city', 'author'])
            ->orderByDesc('published_at')
            ->take($limit)
            ->get()
            ->map(function ($video) {
                return [
                    'id' => 'uv_' . $video->id,
                    'raw_id' => $video->id,
                    'source_type' => 'uploaded',
                    'title' => $video->title,
                    'slug' => $video->slug,
                    'caption' => $video->caption ?? $video->description,
                    'description' => $video->description,
                    'file_url' => $video->file_url,
                    'thumbnail_url' => $video->thumbnail_url ?: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=600&q=80',
                    'duration' => $video->duration,
                    'width' => $video->width,
                    'height' => $video->height,
                    'category' => $video->category,
                    'district' => $video->district,
                    'city' => $video->city,
                    'author' => $video->author ? [
                        'id' => $video->author->id,
                        'name' => $video->author->name,
                        'role' => $video->author->role,
                    ] : null,
                    'views_count' => $video->views_count ?? 0,
                    'published_at' => $video->published_at ? $video->published_at->toISOString() : null,
                    'created_at' => $video->created_at ? $video->created_at->toISOString() : null,
                ];
            });

        $insta = InstagramReel::published()
            ->with(['category', 'district', 'city', 'author'])
            ->orderByDesc('published_at')
            ->take($limit)
            ->get()
            ->map(function ($reel) {
                return [
                    'id' => 'ir_' . $reel->id,
                    'raw_id' => $reel->id,
                    'source_type' => 'instagram',
                    'title' => $reel->title,
                    'slug' => null,
                    'caption' => $reel->caption,
                    'description' => $reel->caption,
                    'instagram_url' => $reel->instagram_url,
                    'file_url' => $reel->media_url,
                    'thumbnail_url' => $reel->thumbnail_url ?: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=600&q=80',
                    'duration' => null,
                    'width' => null,
                    'height' => null,
                    'category' => $reel->category,
                    'district' => $reel->district,
                    'city' => $reel->city,
                    'author' => $reel->author ? [
                        'id' => $reel->author->id,
                        'name' => $reel->author->name,
                        'role' => $reel->author->role,
                    ] : null,
                    'views_count' => $reel->views_count ?? 0,
                    'published_at' => $reel->published_at ? $reel->published_at->toISOString() : null,
                    'created_at' => $reel->created_at ? $reel->created_at->toISOString() : null,
                ];
            });

        return $uploaded->concat($insta)
            ->sortByDesc(function ($item) {
                return $item['published_at'] ?? $item['created_at'];
            })
            ->values()
            ->take($limit)
            ->all();
    }

    public function youtube(): JsonResponse
    {
        $videos = YouTubeVideo::published()->with(['category', 'city', 'author'])->paginate(12);

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

    public function galleries(): JsonResponse
    {
        $galleries = PhotoGallery::published()->with(['images', 'category', 'author'])->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $galleries->items(),
            'meta' => [
                'current_page' => $galleries->currentPage(),
                'last_page' => $galleries->lastPage(),
                'total' => $galleries->total(),
            ],
        ]);
    }

    public function gallery(string $slug): JsonResponse
    {
        $gallery = PhotoGallery::published()
            ->where('slug', $slug)
            ->with(['images', 'category', 'district', 'city', 'author'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $gallery,
        ]);
    }

    public function author(string $slug): JsonResponse
    {
        $author = User::where('slug', $slug)->firstOrFail();
        $articles = Article::published()
            ->where('author_id', $author->id)
            ->with(['category', 'city'])
            ->orderByDesc('published_at')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => [
                'author' => [
                    'id' => $author->id,
                    'name' => $author->name,
                    'slug' => $author->slug,
                    'designation' => $author->designation,
                    'bio' => $author->bio,
                    'profile_image' => $author->profile_image,
                    'social_links' => $author->social_links,
                ],
                'articles' => $articles->items(),
            ],
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $q = $request->query('q', '');
        if (empty(trim($q))) {
            return response()->json([
                'success' => true,
                'data' => [],
                'meta' => ['total' => 0],
            ]);
        }

        $query = Article::published()->with(['category', 'city', 'author']);

        $query->where(function ($sub) use ($q) {
            $sub->where('title', 'like', "%{$q}%")
                ->orWhere('subtitle', 'like', "%{$q}%")
                ->orWhere('short_description', 'like', "%{$q}%")
                ->orWhere('content', 'like', "%{$q}%");
        });

        if ($request->filled('category')) {
            $query->where('category_id', $request->query('category'));
        }

        if ($request->filled('city')) {
            $query->where('city_id', $request->query('city'));
        }

        $results = $query->orderByDesc('published_at')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'total' => $results->total(),
            ],
        ]);
    }

    public function settings(): JsonResponse
    {
        $settings = Setting::where('is_public', true)->get()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function track(Request $request, AnalyticsService $analytics): JsonResponse
    {
        $validated = $request->validate([
            'event_type' => 'required|in:view,share,click',
            'entity_type' => 'required|in:article,reel,video,gallery',
            'entity_id' => 'required|integer',
        ]);

        $analytics->recordEvent($request, $validated['event_type'], $validated['entity_type'], (int)$validated['entity_id']);

        return response()->json([
            'success' => true,
            'message' => 'Event recorded',
        ]);
    }

    /**
     * Public list of published uploaded videos with filters.
     */
    public function videos(Request $request): JsonResponse
    {
        $query = UploadedVideo::published()
            ->with(['category', 'district', 'city', 'author']);

        if ($request->filled('category')) {
            $catSlug = $request->query('category');
            $query->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        if ($request->filled('district')) {
            $distSlug = $request->query('district');
            $query->whereHas('district', function ($q) use ($distSlug) {
                $q->where('slug', $distSlug);
            });
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($sub) use ($s) {
                $sub->where('title', 'like', "%{$s}%")
                    ->orWhere('caption', 'like', "%{$s}%");
            });
        }

        $perPage = (int) $request->query('per_page', 12);
        $videos = $query->paginate($perPage);

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
     * Public video detail page.
     */
    public function videoDetail(Request $request, string $slug): JsonResponse
    {
        $video = UploadedVideo::published()
            ->with(['category', 'district', 'city', 'author'])
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)
                    ->orWhere('id', is_numeric($slug) ? (int)$slug : 0);
            })
            ->firstOrFail();

        // Increment view count
        $video->increment('views_count');

        // Log view
        try {
            VideoView::create([
                'video_id' => $video->id,
                'ip_address' => $request->ip(),
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
            ]);
        } catch (\Throwable) {}

        // Related videos
        $relatedVideos = UploadedVideo::published()
            ->where('id', '!=', $video->id)
            ->when($video->category_id, function ($q) use ($video) {
                $q->where('category_id', $video->category_id);
            })
            ->with(['category', 'district', 'city', 'author'])
            ->take(4)
            ->get();

        if ($relatedVideos->count() < 4) {
            $fallback = UploadedVideo::published()
                ->where('id', '!=', $video->id)
                ->whereNotIn('id', $relatedVideos->pluck('id'))
                ->with(['category', 'district', 'city', 'author'])
                ->take(4 - $relatedVideos->count())
                ->get();
            $relatedVideos = $relatedVideos->concat($fallback);
        }

        // Related news
        $relatedArticles = Article::published()
            ->when($video->category_id, function ($q) use ($video) {
                $q->where('category_id', $video->category_id);
            })
            ->with(['category', 'city', 'district'])
            ->take(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'video' => $video,
                'related_videos' => $relatedVideos,
                'related_articles' => $relatedArticles,
            ],
        ]);
    }

    /**
     * Track video view counter.
     */
    public function trackVideoView(Request $request, string $slug): JsonResponse
    {
        $video = UploadedVideo::published()
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)
                    ->orWhere('id', is_numeric($slug) ? (int)$slug : 0);
            })
            ->first();

        if ($video) {
            $video->increment('views_count');
            try {
                VideoView::create([
                    'video_id' => $video->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => substr((string)$request->userAgent(), 0, 500),
                ]);
            } catch (\Throwable) {}
        }

        return response()->json([
            'success' => true,
            'views_count' => $video ? $video->views_count : 0,
        ]);
    }

    /**
     * Video upload configuration (max size, allowed mimes).
     */
    public function videoConfig(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'max_upload_mb' => config('media.max_video_upload_mb', 100),
                'allowed_mimes' => config('media.allowed_video_mimes', ['video/mp4', 'video/webm', 'video/quicktime']),
                'allowed_extensions' => config('media.allowed_video_extensions', ['mp4', 'webm', 'mov']),
            ],
        ]);
    }

    /**
     * Submit contact form message.
     */
    public function submitContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'phone' => 'nullable|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'new',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string)$request->userAgent(), 0, 500),
        ]);

        // Notify Channel Head
        try {
            $channelHead = User::where('role', 'channel_head')->first();
            if ($channelHead) {
                AdminNotification::create([
                    'user_id' => $channelHead->id,
                    'type' => 'contact_message',
                    'title' => 'નવો સંપર્ક સંદેશ (New Message)',
                    'message' => "{$validated['name']} તરફથી સંપર્ક ફોર્મ દ્વારા નવો સંદેશ પ્રાપ્ત થયો છે: '{$validated['subject']}'",
                    'data' => [
                        'message_id' => $message->id,
                        'email' => $validated['email'],
                        'subject' => $validated['subject'],
                    ],
                ]);
            }
        } catch (\Throwable) {}

        return response()->json([
            'success' => true,
            'message' => 'આપનો સંદેશ સફળતાપૂર્વક મોકલાઈ ગયો છે. અમારી સંપાદકીય ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે.',
            'data' => [
                'id' => $message->id,
            ],
        ], 201);
    }
}
