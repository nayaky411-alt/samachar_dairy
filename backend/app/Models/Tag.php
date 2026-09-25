<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name', 'name_gu', 'slug', 'is_trending', 'wordpress_term_id', 'import_source', 'is_imported'];

    protected $casts = [
        'is_trending' => 'boolean',
    ];

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class);
    }
}
