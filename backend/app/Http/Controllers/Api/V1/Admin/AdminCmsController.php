<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Advertisement;
use App\Models\Article;
use App\Models\BreakingNews;
use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\HomepageSection;
use App\Models\InstagramReel;
use App\Models\PhotoGallery;
use App\Models\Setting;
use App\Models\User;
use App\Models\YouTubeVideo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminCmsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_articles' => Article::count(),
            'published_articles' => Article::where('status', 'published')->count(),
            'pending_approval' => Article::where('status', 'pending_review')->count(),
            'draft_articles' => Article::where('status', 'draft')->count(),
            'rejected_articles' => Article::where('status', 'rejected')->count(),
            'scheduled_articles' => Article::where('status', 'scheduled')->count(),
            'total_views' => Article::sum('views_count'),
            'total_shares' => Article::sum('shares_count'),
            'staff_count' => User::where('role', 'staff')->count(),
            'breaking_news_count' => BreakingNews::active()->count(),
            'reels_count' => InstagramReel::count(),
            'videos_count' => YouTubeVideo::count(),
            'galleries_count' => PhotoGallery::count(),
        ];

        // Recent articles for quick view
        $recentArticles = Article::with(['author', 'category'])
            ->orderByDesc('updated_at')
            ->take(6)
            ->get();

        // Top read articles today
        $topArticles = Article::published()
            ->orderByDesc('views_count')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_articles' => $recentArticles,
                'top_articles' => $topArticles,
            ],
        ]);
    }

    // ALL ARTICLES IN CMS
    public function articles(Request $request): JsonResponse
    {
        $query = Article::with(['author', 'category', 'city', 'district']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('author_id')) {
            $query->where('author_id', $request->query('author_id'));
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where('title', 'like', "%{$s}%");
        }

        $articles = $query->orderByDesc('updated_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    // BREAKING NEWS CRUD
    public function breakingNews(): JsonResponse
    {
        $items = BreakingNews::with('creator')->orderByDesc('is_pinned')->orderByDesc('priority')->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $items]);
    }

    public function storeBreakingNews(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'headline' => 'required|string|max:1000',
            'link_url' => 'nullable|url|max:1000',
            'priority' => 'nullable|integer|min:1|max:10',
            'is_pinned' => 'nullable|boolean',
            'status' => 'required|in:published,draft,expired',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['published_by'] = $request->user()->id;

        $item = BreakingNews::create($validated);
        return response()->json(['success' => true, 'message' => 'Breaking news created', 'data' => $item], 201);
    }

    public function updateBreakingNews(Request $request, int $id): JsonResponse
    {
        $item = BreakingNews::findOrFail($id);
        $validated = $request->validate([
            'headline' => 'sometimes|required|string|max:1000',
            'link_url' => 'nullable|url|max:1000',
            'priority' => 'nullable|integer|min:1|max:10',
            'is_pinned' => 'nullable|boolean',
            'status' => 'sometimes|required|in:published,draft,expired',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
        ]);

        $item->update($validated);
        return response()->json(['success' => true, 'message' => 'Breaking news updated', 'data' => $item]);
    }

    public function deleteBreakingNews(int $id): JsonResponse
    {
        BreakingNews::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Breaking news deleted']);
    }

    // CATEGORIES CRUD
    public function categories(): JsonResponse
    {
        $categories = Category::withCount('articles')->orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'name_gu' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100|unique:categories,slug',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'show_in_menu' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);
        return response()->json(['success' => true, 'message' => 'Category created', 'data' => $category], 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'name_gu' => 'sometimes|required|string|max:100',
            'slug' => "sometimes|required|string|max:100|unique:categories,slug,{$id}",
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'show_in_menu' => 'nullable|boolean',
        ]);

        $category->update($validated);
        return response()->json(['success' => true, 'message' => 'Category updated', 'data' => $category]);
    }

    public function deleteCategory(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Category deleted']);
    }

    // HOMEPAGE SECTIONS MANAGEMENT
    public function homepageSections(): JsonResponse
    {
        $sections = HomepageSection::orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $sections]);
    }

    public function updateHomepageOrder(Request $request): JsonResponse
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:homepage_sections,id',
            'sections.*.sort_order' => 'required|integer',
            'sections.*.is_active' => 'required|boolean',
        ]);

        foreach ($request->input('sections') as $sec) {
            HomepageSection::where('id', $sec['id'])->update([
                'sort_order' => $sec['sort_order'],
                'is_active' => $sec['is_active'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Homepage sections order updated successfully',
            'data' => HomepageSection::orderBy('sort_order')->get(),
        ]);
    }

    // ADVERTISEMENTS CRUD
    public function advertisements(): JsonResponse
    {
        $ads = Advertisement::orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $ads]);
    }

    public function storeAdvertisement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'placement' => 'required|in:desktop_banner,mobile_banner,sidebar,article_inline,homepage',
            'image_url' => 'nullable|string|max:1000',
            'destination_url' => 'nullable|url|max:1000',
            'code_html' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,expired',
        ]);

        $ad = Advertisement::create($validated);
        return response()->json(['success' => true, 'message' => 'Advertisement created', 'data' => $ad], 201);
    }

    public function updateAdvertisement(Request $request, int $id): JsonResponse
    {
        $ad = Advertisement::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'placement' => 'sometimes|required|in:desktop_banner,mobile_banner,sidebar,article_inline,homepage',
            'image_url' => 'nullable|string|max:1000',
            'destination_url' => 'nullable|url|max:1000',
            'code_html' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'sometimes|required|in:active,inactive,expired',
        ]);

        $ad->update($validated);
        return response()->json(['success' => true, 'message' => 'Advertisement updated', 'data' => $ad]);
    }

    public function deleteAdvertisement(int $id): JsonResponse
    {
        Advertisement::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Advertisement deleted']);
    }

    // USERS / STAFF MANAGEMENT
    public function users(): JsonResponse
    {
        $users = User::withCount('articles')->orderBy('role')->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:staff,channel_head',
            'designation' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['slug'] = Str::slug($validated['name']) . '-' . time();
        $validated['status'] = 'active';

        $user = User::create($validated);
        return response()->json(['success' => true, 'message' => 'User created successfully', 'data' => $user], 201);
    }

    public function toggleUserStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isChannelHead()) {
            return response()->json([
                'success' => false,
                'message' => 'The Channel Head administrator account cannot be deactivated.',
            ], 403);
        }

        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "User status updated to {$newStatus}",
            'data' => $user,
        ]);
    }

    // ANALYTICS
    public function analytics(): JsonResponse
    {
        $topCategories = Category::withCount(['articles' => function ($q) {
            $q->published();
        }])->orderByDesc('articles_count')->take(6)->get();

        $topCities = City::withCount(['articles' => function ($q) {
            $q->published();
        }])->orderByDesc('articles_count')->take(6)->get();

        $topAuthors = User::where('role', 'staff')
            ->withCount(['articles' => function ($q) {
                $q->published();
            }])->orderByDesc('articles_count')->take(5)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'top_categories' => $topCategories,
                'top_cities' => $topCities,
                'top_authors' => $topAuthors,
            ],
        ]);
    }

    // AUDIT LOGS
    public function activityLogs(): JsonResponse
    {
        $logs = ActivityLog::with('user')->orderByDesc('created_at')->paginate(25);
        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    // SETTINGS
    public function settings(): JsonResponse
    {
        $settings = Setting::all();
        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $settings = $request->input('settings', []);
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => (string)$value]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => Setting::all(),
        ]);
    }
}
