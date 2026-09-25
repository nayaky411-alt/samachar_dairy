<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadedVideo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'uploaded_videos';

    protected $fillable = [
        'uuid',
        'title',
        'slug',
        'description',
        'caption',
        'source_type',
        'file_path',
        'file_url',
        'thumbnail_path',
        'thumbnail_url',
        'original_filename',
        'mime_type',
        'file_size',
        'duration',
        'width',
        'height',
        'category_id',
        'district_id',
        'city_id',
        'uploaded_by',
        'status',
        'approval_status',
        'rejection_reason',
        'approved_by',
        'approved_at',
        'published_at',
        'views_count',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'views_count' => 'integer',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'file_url',
        'thumbnail_url',
    ];

    public function getFileUrlAttribute(): ?string
    {
        $path = $this->attributes['file_path'] ?? null;
        if (!$path) {
            return $this->attributes['file_url'] ?? null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        $path = $this->attributes['thumbnail_path'] ?? null;
        if (!$path) {
            return $this->attributes['thumbnail_url'] ?? null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function views(): HasMany
    {
        return $this->hasMany(VideoView::class, 'video_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->orderByDesc('published_at');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending_review')
            ->orderByDesc('created_at');
    }
}
