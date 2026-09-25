<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'district_id',
        'taluka_id',
        'name',
        'name_gu',
        'slug',
        'is_major',
        'is_active',
    ];

    protected $casts = [
        'is_major' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function taluka(): BelongsTo
    {
        return $this->belongsTo(Taluka::class);
    }

    public function localAreas(): HasMany
    {
        return $this->hasMany(LocalArea::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeMajor($query)
    {
        return $query->where('is_major', true);
    }
}
