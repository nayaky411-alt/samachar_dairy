<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketIndex extends Model
{
    protected $fillable = [
        'symbol',
        'name',
        'current_value',
        'change_value',
        'change_percent',
        'day_high',
        'day_low',
        'market_status',
        'provider',
        'is_delayed',
        'is_active',
        'last_synced_at',
    ];

    protected $casts = [
        'current_value' => 'float',
        'change_value' => 'float',
        'change_percent' => 'float',
        'day_high' => 'float',
        'day_low' => 'float',
        'is_delayed' => 'boolean',
        'is_active' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
