<?php

namespace App\Services;

use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class VideoStorageService
{
    protected string $disk = 'public';

    public function __construct()
    {
        // Ensure standard video directories exist on public disk
        Storage::disk($this->disk)->makeDirectory('videos');
        Storage::disk($this->disk)->makeDirectory('videos/thumbnails');
        Storage::disk($this->disk)->makeDirectory('videos/temp');
    }

    /**
     * Store an uploaded video file with a safe UUID filename.
     */
    public function storeVideoFile(UploadedFile $file): array
    {
        $maxBytes = config('media.max_video_upload_mb', 100) * 1024 * 1024;
        if ($file->getSize() > $maxBytes) {
            $mb = config('media.max_video_upload_mb', 100);
            throw ValidationException::withMessages([
                'video' => "વિડિયો ફાઇલનું કદ {$mb} MB કરતાં વધુ ન હોવું જોઈએ (File size exceeds limit of {$mb} MB).",
            ]);
        }

        $mime = $file->getMimeType();
        $allowedMimes = config('media.allowed_video_mimes', ['video/mp4', 'video/webm', 'video/quicktime']);
        $ext = strtolower($file->getClientOriginalExtension());
        $allowedExts = config('media.allowed_video_extensions', ['mp4', 'webm', 'mov']);

        if (!in_array($mime, $allowedMimes) && !in_array($ext, $allowedExts)) {
            throw ValidationException::withMessages([
                'video' => 'અમાન્ય ફાઇલ પ્રકાર. માત્ર MP4, WebM અથવા MOV ફાઇલ અપલોડ કરો (Invalid video format).',
            ]);
        }

        // Generate safe unique filename
        $uuid = (string) Str::uuid();
        $safeFilename = 'reel_' . substr($uuid, 0, 12) . '.' . ($ext ?: 'mp4');
        $folder = 'videos/' . date('Y/m');

        $path = $file->storeAs($folder, $safeFilename, $this->disk);

        return [
            'uuid' => $uuid,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $mime,
            'file_size' => $file->getSize(),
        ];
    }

    /**
     * Store custom thumbnail file or auto-captured base64 image.
     */
    public function storeThumbnail(UploadedFile|string|null $thumbnail): ?string
    {
        if (!$thumbnail) {
            return null;
        }

        // If it's an UploadedFile
        if ($thumbnail instanceof UploadedFile) {
            $ext = strtolower($thumbnail->getClientOriginalExtension()) ?: 'jpg';
            $name = 'thumb_' . Str::random(16) . '.' . $ext;
            return $thumbnail->storeAs('videos/thumbnails', $name, $this->disk);
        }

        // If it's a base64 data URL from HTML5 canvas frame extraction
        if (is_string($thumbnail) && Str::startsWith($thumbnail, 'data:image/')) {
            if (preg_match('/^data:image\/(\w+);base64,/', $thumbnail, $type)) {
                $data = substr($thumbnail, strpos($thumbnail, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, webp
                if (!in_array($type, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $type = 'jpg';
                }
                $data = base64_decode($data);
                if ($data !== false) {
                    $name = 'videos/thumbnails/thumb_' . Str::random(16) . '.' . $type;
                    Storage::disk($this->disk)->put($name, $data);
                    return $name;
                }
            }
        }

        // If it's already a relative path or external URL
        if (is_string($thumbnail)) {
            return $thumbnail;
        }

        return null;
    }

    /**
     * Register in media library table so admins can see it in media manager.
     */
    public function registerInMediaLibrary(string $filePath, UploadedFile $file, User $user, ?string $alt = null): ?Media
    {
        try {
            return Media::create([
                'filename' => basename($filePath),
                'original_name' => $file->getClientOriginalName(),
                'disk' => $this->disk,
                'path' => $filePath,
                'url' => Storage::disk($this->disk)->url($filePath),
                'mime_type' => $file->getMimeType(),
                'type' => 'video',
                'size' => $file->getSize(),
                'alt_text' => $alt,
                'uploaded_by' => $user->id,
            ]);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Delete files from storage.
     */
    public function deleteFiles(?string $filePath, ?string $thumbnailPath): void
    {
        if ($filePath && Storage::disk($this->disk)->exists($filePath)) {
            Storage::disk($this->disk)->delete($filePath);
        }
        if ($thumbnailPath && Storage::disk($this->disk)->exists($thumbnailPath)) {
            Storage::disk($this->disk)->delete($thumbnailPath);
        }
    }
}
