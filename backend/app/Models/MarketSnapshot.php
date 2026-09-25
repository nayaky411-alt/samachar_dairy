<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketSnapshot extends Model
{
    protected $fillable = [
        'symbol',
        'name',
        'exchange',
        'price',
        'previous_close',
        'change',
        'change_percent',
        'volume',
        'market_status',
        'provider',
        'provider_timestamp',
        'data_payload',
        'is_demo',
        'fetched_at',
    ];

    protected $casts = [
        'price' => 'float',
        'previous_close' => 'float',
        'change' => 'float',
        'change_percent' => 'float',
        'volume' => 'integer',
        'data_payload' => 'array',
        'is_demo' => 'boolean',
        'provider_timestamp' => 'datetime',
        'fetched_at' => 'datetime',
    ];
}
