<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use Laravel\Sanctum\Sanctum;

class ArticleWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_complete_article_editorial_lifecycle(): void
    {
        $staff = User::where('role', 'staff')->first() ?? User::factory()->create(['role' => 'staff', 'status' => 'active']);
        $channelHead = User::where('role', 'channel_head')->first();
        $category = Category::first();

        // 1. Staff creates draft article
        Sanctum::actingAs($staff);
        $createRes = $this->postJson('/api/v1/staff/articles', [
            'title' => 'અમદાવાદ સાબરમતી નદી પર નવી રિવર ક્રુઝ સર્વિસ શરૂ થશે',
            'content' => '<p>અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન દ્વારા નવી ઇલેક્ટ્રિક ક્રુઝ સેવા શરૂ કરવાની જાહેરાત કરાઈ છે.</p>',
            'category_id' => $category->id,
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('success', true);

        $articleId = $createRes->json('data.id');
        $slug = $createRes->json('data.slug');

        // 2. Verify draft does NOT appear in public API
        $publicRes = $this->getJson('/api/v1/news');
        $publicArticles = collect($publicRes->json('data'));
        $this->assertFalse($publicArticles->contains('id', $articleId));

        // 3. Staff submits article for approval
        $submitRes = $this->postJson("/api/v1/staff/articles/{$articleId}/submit");

        $submitRes->assertStatus(200)
            ->assertJsonPath('data.status', 'pending_review');

        // 4. Staff receives 403 Forbidden if trying to approve
        $unauthRes = $this->postJson("/api/v1/admin/articles/{$articleId}/approve");
        $unauthRes->assertStatus(403);

        // 5. Channel Head rejects article with mandatory reason
        Sanctum::actingAs($channelHead);
        $rejectRes = $this->postJson("/api/v1/admin/articles/{$articleId}/reject", [
            'reason' => 'કૃપા કરીને ક્રુઝના ટિકિટ દર અને સત્તાવાર તારીખ ઉમેરો.',
        ]);

        $rejectRes->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'કૃપા કરીને ક્રુઝના ટિકિટ દર અને સત્તાવાર તારીખ ઉમેરો.');

        // 6. Staff updates article and resubmits
        Sanctum::actingAs($staff);
        $updateRes = $this->putJson("/api/v1/staff/articles/{$articleId}", [
            'content' => '<p>અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન દ્વારા ટિકિટ દર ₹૨૫૦ નક્કી કરાયા છે અને સેવા ૧૫ ઓક્ટોબરથી શરૂ થશે.</p>',
        ]);
        $updateRes->assertStatus(200);

        $resubmitRes = $this->postJson("/api/v1/staff/articles/{$articleId}/submit");
        $resubmitRes->assertStatus(200)
            ->assertJsonPath('data.status', 'pending_review');

        // 7. Channel Head approves and publishes article
        Sanctum::actingAs($channelHead);
        $approveRes = $this->postJson("/api/v1/admin/articles/{$articleId}/approve");
        $approveRes->assertStatus(200);

        $publishRes = $this->postJson("/api/v1/admin/articles/{$articleId}/publish");
        $publishRes->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        // 8. Verify published article is now visible in public API
        $publicArticleRes = $this->getJson("/api/v1/news/{$slug}");
        $publicArticleRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.article.id', $articleId);
    }

    public function test_scheduled_articles_auto_publish_via_command(): void
    {
        $channelHead = User::where('role', 'channel_head')->first();
        $channelHeadToken = $channelHead->createToken('head-token')->plainTextToken;
        $category = Category::first();

        // Create scheduled article set in past
        $article = Article::create([
            'title' => 'શેડ્યૂલ કરેલા સમાચાર જે આપોઆપ પ્રકાશિત થવા જોઈએ',
            'slug' => 'scheduled-auto-publish-article-test',
            'content' => '<p>આ લેખ આપમેળે પ્રકાશિત થશે.</p>',
            'category_id' => $category->id,
            'author_id' => $channelHead->id,
            'status' => 'scheduled',
            'scheduled_at' => now()->subMinute(),
        ]);

        $this->artisan('news:publish-scheduled')
            ->assertSuccessful();

        $this->assertEquals('published', $article->fresh()->status);
    }
}
