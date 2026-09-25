<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketSymbol extends Model
{
    protected $fillable = [
        'symbol',
        'name',
        'display_name',
        'exchange',
        'instrument_type', // index, stock, etf
        'type',
        'is_active',
        'sort_order',
        'current_value',
        'change_value',
        'change_percent',
        'volume',
        'provider',
        'last_synced_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'current_value' => 'float',
        'change_value' => 'float',
        'change_percent' => 'float',
        'volume' => 'integer',
        'last_synced_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeIndices($query)
    {
        return $query->where('instrument_type', 'index');
    }

    public function scopeStocks($query)
    {
        return $query->where('instrument_type', 'stock');
    }

    public function scopeGainers($query)
    {
        return $query->where('type', 'gainer')->orderByDesc('change_percent');
    }

    public function scopeLosers($query)
    {
        return $query->where('type', 'loser')->orderBy('change_percent');
    }

    public function scopePopular($query)
    {
        return $query->where('type', 'popular')->orderByDesc('volume');
    }
}
