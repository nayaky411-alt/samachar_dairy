<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        $val = $setting->value;
        if (is_string($val) && (str_starts_with($val, '{') || str_starts_with($val, '['))) {
            $decoded = json_decode($val, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }

        return $val;
    }

    public static function set(string $key, mixed $value, ?string $description = null): static
    {
        $payload = [
            'value' => is_array($value) ? json_encode($value) : (string) $value,
        ];
        if ($description !== null) {
            $payload['description'] = $description;
        }

        return static::updateOrCreate(['key' => $key], $payload);
    }
}
