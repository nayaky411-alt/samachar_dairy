<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'slug',
        'designation',
        'bio',
        'profile_image',
        'phone',
        'social_links',
        'status',
        'wordpress_user_id',
        'import_source',
        'is_imported',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'social_links' => 'array',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'uploaded_by');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function isChannelHead(): bool
    {
        return $this->role === 'channel_head' || $this->roles()->where('name', 'channel_head')->exists();
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff' || $this->roles()->where('name', 'staff')->exists();
    }

    public function canPublish(): bool
    {
        return $this->isChannelHead();
    }

    public function canApprove(): bool
    {
        return $this->isChannelHead();
    }
}
