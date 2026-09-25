<?php

namespace App\Console\Commands;

use App\Models\BreakingNews;
use Illuminate\Console\Command;

class ExpireBreakingNewsCommand extends Command
{
    protected $signature = 'news:expire-breaking';
    protected $description = 'Automatically expire breaking news items that have passed their end time';

    public function handle(): int
    {
        $expired = BreakingNews::where('status', 'published')
            ->whereNotNull('end_time')
            ->where('end_time', '<', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$expired} breaking news item(s).");
        return Command::SUCCESS;
    }
}
