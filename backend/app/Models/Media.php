<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'filename',
        'original_name',
        'disk',
        'path',
        'url',
        'mime_type',
        'type',
        'size',
        'width',
        'height',
        'duration',
        'alt_text',
        'caption',
        'credit',
        'source',
        'uploaded_by',
        'wordpress_attachment_id',
        'original_url',
        'import_source',
        'is_imported',
    ];

    protected $appends = ['full_url'];

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFullUrlAttribute(): string
    {
        if ($this->url && (str_starts_with($this->url, 'http://') || str_starts_with($this->url, 'https://'))) {
            return $this->url;
        }

        if ($this->path) {
            return Storage::disk($this->disk ?? 'public')->url($this->path);
        }

        return $this->url ?? '';
    }
}
