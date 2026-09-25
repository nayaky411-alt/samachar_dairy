<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    protected $fillable = [
        'section_key',
        'title',
        'title_gu',
        'subtitle',
        'sort_order',
        'is_active',
        'card_limit',
        'custom_config',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'custom_config' => 'array',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
