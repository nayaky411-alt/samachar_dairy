<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocalArea extends Model
{
    protected $fillable = ['city_id', 'name', 'name_gu', 'slug', 'pincode'];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
