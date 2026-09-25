<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryImage extends Model
{
    protected $fillable = [
        'gallery_id',
        'image_url',
        'caption',
        'credit',
        'alt_text',
        'sort_order',
    ];

    public function gallery(): BelongsTo
    {
        return $this->belongsTo(PhotoGallery::class, 'gallery_id');
    }
}
