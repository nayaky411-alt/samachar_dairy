<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'market' => [
        'provider' => env('MARKET_DATA_PROVIDER', env('MARKET_PROVIDER', 'rest')),
        'url' => env('MARKET_API_URL'),
        'key' => env('MARKET_API_KEY'),
        'secret' => env('MARKET_API_SECRET'),
        'timeout' => (int) env('MARKET_API_TIMEOUT', 6),
        'cache_ttl' => (int) env('MARKET_CACHE_TTL', 60),
        'refresh_interval' => (int) env('MARKET_REFRESH_INTERVAL', 30),
        'stale_threshold' => (int) env('MARKET_STALE_THRESHOLD', 300),
        'demo_mode' => filter_var(env('MARKET_DEMO_MODE', false), FILTER_VALIDATE_BOOLEAN),
        'delayed_minutes' => (int) env('MARKET_DELAYED_MINUTES', 15),
    ],

];
