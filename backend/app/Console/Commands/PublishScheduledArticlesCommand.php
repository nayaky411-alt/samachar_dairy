<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Article;
use Illuminate\Console\Command;

class PublishScheduledArticlesCommand extends Command
{
    protected $signature = 'news:publish-scheduled';
    protected $description = 'Automatically publish articles whose scheduled time has arrived';

    public function handle(): int
    {
        $articles = Article::where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        $count = $articles->count();

        foreach ($articles as $article) {
            $article->update([
                'status' => 'published',
                'published_at' => $article->scheduled_at ?? now(),
            ]);

            ActivityLog::create([
                'user_id' => $article->editor_id ?? $article->author_id,
                'action' => 'auto_publish_scheduled',
                'entity_type' => 'Article',
                'entity_id' => $article->id,
                'description' => "Scheduled article '{$article->title}' was automatically published by system scheduler.",
                'created_at' => now(),
            ]);

            $this->info("Published article ID {$article->id}: '{$article->title}'");
        }

        $this->info("Completed. {$count} scheduled article(s) published.");
        return Command::SUCCESS;
    }
}
