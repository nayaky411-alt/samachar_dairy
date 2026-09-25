<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\AnalyticsEvent;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AnalyticsService
{
    public function recordEvent(Request $request, string $eventType, string $entityType, int $entityId): void
    {
        $ipHash = hash('sha256', $request->ip() . config('app.key'));
        
        $device = 'desktop';
        $agent = strtolower($request->userAgent() ?? '');
        if (str_contains($agent, 'mobile') || str_contains($agent, 'android') || str_contains($agent, 'iphone')) {
            $device = 'mobile';
        } elseif (str_contains($agent, 'tablet') || str_contains($agent, 'ipad')) {
            $device = 'tablet';
        }

        AnalyticsEvent::create([
            'event_type' => $eventType,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'device_type' => $device,
            'referrer' => Str::limit($request->header('referer'), 500),
            'ip_hash' => $ipHash,
            'created_at' => now(),
        ]);

        if ($entityType === 'article') {
            if ($eventType === 'view') {
                Article::where('id', $entityId)->increment('views_count');
            } elseif ($eventType === 'share') {
                Article::where('id', $entityId)->increment('shares_count');
            }
        }
    }

    public function getTrendingArticles(int $limit = 5)
    {
        return Article::published()
            ->orderByDesc('views_count')
            ->orderByDesc('published_at')
            ->take($limit)
            ->get();
    }
}
