<?php

namespace App\Services;

use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MediaUploadService
{
    protected array $allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/quicktime',
    ];

    public function upload(UploadedFile $file, User $user, array $meta = []): Media
    {
        $mime = $file->getMimeType();

        if (!in_array($mime, $this->allowedMimes)) {
            throw ValidationException::withMessages([
                'file' => 'Unsupported file format. Allowed formats: JPG, PNG, WEBP, GIF, MP4.',
            ]);
        }

        $type = str_starts_with($mime, 'video/') ? 'video' : 'image';
        $extension = $file->getClientOriginalExtension();
        $safeName = Str::random(24) . '.' . $extension;
        $folder = 'uploads/' . date('Y/m');

        $path = $file->storeAs($folder, $safeName, 'public');

        $width = null;
        $height = null;

        if ($type === 'image' && function_exists('getimagesize')) {
            $imageInfo = @getimagesize($file->getRealPath());
            if ($imageInfo) {
                $width = $imageInfo[0];
                $height = $imageInfo[1];
            }
        }

        return Media::create([
            'filename' => $safeName,
            'original_name' => $file->getClientOriginalName(),
            'disk' => 'public',
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'mime_type' => $mime,
            'type' => $type,
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'alt_text' => $meta['alt_text'] ?? null,
            'caption' => $meta['caption'] ?? null,
            'credit' => $meta['credit'] ?? null,
            'source' => $meta['source'] ?? null,
            'uploaded_by' => $user->id,
        ]);
    }
}
