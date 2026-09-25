<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoView extends Model
{
    protected $table = 'video_views';

    protected $fillable = [
        'video_id',
        'ip_address',
        'user_agent',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(UploadedVideo::class, 'video_id');
    }
}
