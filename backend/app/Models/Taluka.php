<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Taluka extends Model
{
    protected $fillable = ['district_id', 'name', 'name_gu', 'slug'];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
