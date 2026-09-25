<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uploaded_videos', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('title', 500);
            $table->string('slug', 600)->unique();
            $table->text('description')->nullable();
            $table->text('caption')->nullable();
            $table->string('source_type', 30)->default('uploaded'); // 'uploaded' or 'instagram'

            // Storage paths and public URLs
            $table->string('file_path', 1000);
            $table->string('file_url', 1000)->nullable();
            $table->string('thumbnail_path', 1000)->nullable();
            $table->string('thumbnail_url', 1000)->nullable();

            // File metadata
            $table->string('original_filename', 255)->nullable();
            $table->string('mime_type', 100)->default('video/mp4');
            $table->unsignedBigInteger('file_size')->default(0); // in bytes
            $table->string('duration', 50)->nullable(); // e.g. "00:45" or in seconds
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();

            // Taxonomies & Relationships
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();

            // Workflow and approvals
            $table->string('status', 30)->default('draft')->index(); // draft, pending_review, approved, published, rejected, archived
            $table->string('approval_status', 30)->default('pending')->index(); // pending, approved, rejected, changes_requested
            $table->text('rejection_reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable()->index();

            // Analytics
            $table->unsignedBigInteger('views_count')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('video_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained('uploaded_videos')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['video_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_views');
        Schema::dropIfExists('uploaded_videos');
    }
};
