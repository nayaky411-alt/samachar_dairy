<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Video Upload Configuration
    |--------------------------------------------------------------------------
    */
    'max_video_upload_mb' => (int) env('MAX_VIDEO_UPLOAD_MB', 100),

    'allowed_video_mimes' => [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
    ],

    'allowed_video_extensions' => [
        'mp4',
        'webm',
        'mov',
        'avi',
        'mkv',
    ],

    'allowed_thumbnail_mimes' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],

    'allowed_thumbnail_extensions' => [
        'jpg',
        'jpeg',
        'png',
        'webp',
    ],
];
