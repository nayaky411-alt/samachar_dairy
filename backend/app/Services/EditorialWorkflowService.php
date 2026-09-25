<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\AdminNotification;
use App\Models\Article;
use App\Models\ArticleRevision;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EditorialWorkflowService
{
    public function createDraft(User $user, array $data): Article
    {
        $data['author_id'] = $user->id;
        $data['status'] = 'draft';
        $data['approval_status'] = 'draft';

        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['title']);
        }

        $article = Article::create($data);

        $this->logActivity($user, 'create_draft', 'Article', $article->id, "Created draft article: '{$article->title}'");

        return $article;
    }

    public function submitForApproval(Article $article, User $user): Article
    {
        if ($article->author_id !== $user->id && !$user->isChannelHead()) {
            throw ValidationException::withMessages(['article' => 'You can only submit your own drafts.']);
        }

        $article->update([
            'status' => 'pending_review',
            'approval_status' => 'pending',
            'rejection_reason' => null,
        ]);

        $this->logActivity($user, 'submit_for_approval', 'Article', $article->id, "Submitted article for review: '{$article->title}'");

        // Notify Channel Head
        $channelHeads = User::where('role', 'channel_head')->get();
        foreach ($channelHeads as $ch) {
            AdminNotification::create([
                'user_id' => $ch->id,
                'type' => 'article_submitted',
                'title' => 'નવો લેખ સમીક્ષા માટે રજૂ થયો',
                'message' => "પત્રકાર '{$user->name}' દ્વારા લેખ '{$article->title}' મંજૂરી માટે રજૂ કરાયો છે.",
                'data' => ['article_id' => $article->id, 'author' => $user->name],
            ]);
        }

        return $article->fresh(['author', 'category', 'district', 'city']);
    }

    public function approveArticle(Article $article, User $channelHead): Article
    {
        if (!$channelHead->isChannelHead()) {
            throw ValidationException::withMessages(['authorization' => 'Only Channel Head can approve articles.']);
        }

        $article->update([
            'status' => 'approved',
            'approval_status' => 'approved',
            'editor_id' => $channelHead->id,
            'rejection_reason' => null,
        ]);

        $this->logActivity($channelHead, 'approve_article', 'Article', $article->id, "Approved article: '{$article->title}'");

        // Notify author
        AdminNotification::create([
            'user_id' => $article->author_id,
            'type' => 'article_approved',
            'title' => 'લેખ મંજૂર કરવામાં આવ્યો છે',
            'message' => "તમારો લેખ '{$article->title}' મુખ્ય સંપાદક દ્વારા મંજૂર થયો છે.",
            'data' => ['article_id' => $article->id],
        ]);

        return $article->fresh(['author', 'category', 'district', 'city']);
    }

    public function rejectArticle(Article $article, User $channelHead, string $reason): Article
    {
        if (!$channelHead->isChannelHead()) {
            throw ValidationException::withMessages(['authorization' => 'Only Channel Head can reject articles.']);
        }

        if (empty(trim($reason))) {
            throw ValidationException::withMessages(['rejection_reason' => 'A rejection reason is mandatory.']);
        }

        $article->update([
            'status' => 'rejected',
            'approval_status' => 'rejected',
            'rejection_reason' => $reason,
            'editor_id' => $channelHead->id,
        ]);

        $this->logActivity($channelHead, 'reject_article', 'Article', $article->id, "Rejected article: '{$article->title}' - Reason: {$reason}");

        // Notify author
        AdminNotification::create([
            'user_id' => $article->author_id,
            'type' => 'article_rejected',
            'title' => 'લેખમાં સુધારાની જરૂર છે (Rejected / Changes Requested)',
            'message' => "લેખ '{$article->title}' નકારવામાં આવ્યો છે. કારણ: {$reason}",
            'data' => ['article_id' => $article->id, 'reason' => $reason],
        ]);

        return $article->fresh(['author', 'category', 'district', 'city']);
    }

    public function publishArticle(Article $article, User $channelHead): Article
    {
        if (!$channelHead->isChannelHead()) {
            throw ValidationException::withMessages(['authorization' => 'Only Channel Head can publish articles.']);
        }

        $article->update([
            'status' => 'published',
            'approval_status' => 'approved',
            'editor_id' => $channelHead->id,
            'published_at' => now(),
            'rejection_reason' => null,
        ]);

        $this->logActivity($channelHead, 'publish_article', 'Article', $article->id, "Published article: '{$article->title}'");

        return $article->fresh(['author', 'category', 'district', 'city']);
    }

    public function scheduleArticle(Article $article, User $channelHead, string $scheduledAt): Article
    {
        if (!$channelHead->isChannelHead()) {
            throw ValidationException::withMessages(['authorization' => 'Only Channel Head can schedule articles.']);
        }

        $article->update([
            'status' => 'scheduled',
            'approval_status' => 'approved',
            'editor_id' => $channelHead->id,
            'scheduled_at' => $scheduledAt,
            'published_at' => null,
        ]);

        $this->logActivity($channelHead, 'schedule_article', 'Article', $article->id, "Scheduled article: '{$article->title}' for {$scheduledAt}");

        return $article->fresh(['author', 'category', 'district', 'city']);
    }

    public function createRevision(Article $article, User $user, string $summary = ''): ArticleRevision
    {
        $latestRevision = $article->revisions()->first();
        $nextVersion = $latestRevision ? $latestRevision->version_number + 1 : 1;

        return ArticleRevision::create([
            'article_id' => $article->id,
            'version_number' => $nextVersion,
            'changed_by' => $user->id,
            'old_content' => $latestRevision ? $latestRevision->new_content : $article->content,
            'new_content' => $article->content,
            'change_summary' => $summary ?: "Updated by {$user->name}",
        ]);
    }

    protected function generateUniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        if (empty($base)) {
            $base = 'news-' . time();
        }

        $slug = $base;
        $counter = 1;

        while (Article::where('slug', $slug)->exists()) {
            $slug = "{$base}-" . $counter;
            $counter++;
        }

        return $slug;
    }

    protected function logActivity(User $user, string $action, string $entityType, int $entityId, string $description): void
    {
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);
    }
}
