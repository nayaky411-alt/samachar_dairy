<?php

namespace App\Http\Controllers\Api\V1\Staff;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Services\EditorialWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    protected EditorialWorkflowService $workflow;

    public function __construct(EditorialWorkflowService $workflow)
    {
        $this->workflow = $workflow;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Article::where('author_id', $user->id)
            ->with(['category', 'city', 'district']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $articles = $query->orderByDesc('updated_at')->paginate(15);

        // Counts summary for staff dashboard
        $counts = [
            'draft' => Article::where('author_id', $user->id)->where('status', 'draft')->count(),
            'pending' => Article::where('author_id', $user->id)->where('status', 'pending_review')->count(),
            'approved' => Article::where('author_id', $user->id)->where('status', 'approved')->count(),
            'published' => Article::where('author_id', $user->id)->where('status', 'published')->count(),
            'rejected' => Article::where('author_id', $user->id)->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $articles->items(),
            'counts' => $counts,
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'short_description' => 'nullable|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'district_id' => 'nullable|exists:districts,id',
            'city_id' => 'nullable|exists:cities,id',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:1000',
            'content_type' => 'nullable|string|max:50',
            'featured_image' => 'nullable|string|max:1000',
            'featured_image_caption' => 'nullable|string|max:255',
            'featured_image_credit' => 'nullable|string|max:255',
            'reading_time' => 'nullable|integer|min:1',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $article = $this->workflow->createDraft($request->user(), $validated);

        if (!empty($validated['tag_ids'])) {
            $article->tags()->sync($validated['tag_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Draft saved successfully',
            'data' => $article->fresh(['category', 'district', 'city', 'tags']),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $article = Article::where('author_id', $user->id)
            ->with(['category', 'subcategory', 'district', 'city', 'tags', 'revisions'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $article,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $article = Article::where('author_id', $user->id)->findOrFail($id);

        if (!in_array($article->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit an article that is under review or published. Please request Channel Head assistance.',
            ], 422);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'short_description' => 'nullable|string',
            'content' => 'sometimes|required|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'district_id' => 'nullable|exists:districts,id',
            'city_id' => 'nullable|exists:cities,id',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:1000',
            'content_type' => 'nullable|string|max:50',
            'featured_image' => 'nullable|string|max:1000',
            'featured_image_caption' => 'nullable|string|max:255',
            'featured_image_credit' => 'nullable|string|max:255',
            'reading_time' => 'nullable|integer|min:1',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $article->update($validated);

        if (isset($validated['tag_ids'])) {
            $article->tags()->sync($validated['tag_ids']);
        }

        // Auto revision logging
        $this->workflow->createRevision($article, $user, 'Draft update by author');

        return response()->json([
            'success' => true,
            'message' => 'Article updated successfully',
            'data' => $article->fresh(['category', 'district', 'city', 'tags']),
        ]);
    }

    public function submit(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $article = Article::where('author_id', $user->id)->findOrFail($id);

        $submitted = $this->workflow->submitForApproval($article, $user);

        return response()->json([
            'success' => true,
            'message' => 'Article submitted to Channel Head for approval',
            'data' => $submitted,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $article = Article::where('author_id', $user->id)->findOrFail($id);

        if ($article->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only drafts can be deleted by staff.',
            ], 422);
        }

        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Draft deleted successfully',
        ]);
    }
}
