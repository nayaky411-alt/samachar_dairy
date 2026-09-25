<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreakingNews extends Model
{
    protected $fillable = [
        'headline',
        'link_url',
        'article_id',
        'priority',
        'is_pinned',
        'status',
        'start_time',
        'end_time',
        'created_by',
        'published_by',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('start_time')->orWhere('start_time', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_time')->orWhere('end_time', '>=', now());
            })
            ->orderByDesc('is_pinned')
            ->orderByDesc('priority')
            ->orderByDesc('created_at');
    }
}
