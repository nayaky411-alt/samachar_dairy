<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title', 500);
            $table->string('subtitle', 500)->nullable();
            $table->string('slug', 500)->unique();
            $table->text('short_description')->nullable();
            $table->longText('content');
            
            // Taxonomies
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained()->nullOnDelete();
            
            // Geography
            $table->foreignId('state_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            
            // People & Attribution
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('editor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source_name')->nullable();
            $table->string('source_url', 1000)->nullable();
            $table->string('content_type', 50)->default('Original Reporting'); // Staff Report, Agency Report, etc.
            
            // Media
            $table->string('featured_image', 1000)->nullable();
            $table->string('featured_image_caption')->nullable();
            $table->string('featured_image_credit')->nullable();
            $table->unsignedSmallInteger('reading_time')->default(2); // minutes
            
            // Workflow & Status
            $table->string('status', 30)->default('draft')->index(); // draft, pending_review, approved, published, rejected, scheduled, archived
            $table->string('approval_status', 30)->default('draft')->index(); // draft, pending, approved, rejected, changes_requested
            $table->text('rejection_reason')->nullable();
            $table->timestamp('scheduled_at')->nullable()->index();
            $table->timestamp('published_at')->nullable()->index();
            
            // Editorial flags & Metrics
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_breaking')->default(false)->index();
            $table->boolean('is_pinned')->default(false);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('shares_count')->default(0);
            
            // Corrections
            $table->text('correction_note')->nullable();
            $table->timestamp('correction_at')->nullable();
            
            // SEO
            $table->string('seo_title', 255)->nullable();
            $table->text('seo_description')->nullable();
            $table->string('canonical_url', 1000)->nullable();
            $table->string('og_title', 255)->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image', 1000)->nullable();
            
            $table->softDeletes();
            $table->timestamps();

            // Composite indexes for fast querying
            $table->index(['status', 'published_at']);
            $table->index(['category_id', 'status', 'published_at']);
            $table->index(['district_id', 'status', 'published_at']);
            $table->index(['city_id', 'status', 'published_at']);
        });

        Schema::create('article_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number')->default(1);
            $table->foreignId('changed_by')->constrained('users')->cascadeOnDelete();
            $table->longText('old_content')->nullable();
            $table->longText('new_content');
            $table->string('change_summary')->nullable();
            $table->timestamps();
            $table->index(['article_id', 'version_number']);
        });

        Schema::create('article_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['article_id', 'tag_id']);
        });

        Schema::create('article_related', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_article_id')->constrained('articles')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['article_id', 'related_article_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_related');
        Schema::dropIfExists('article_tag');
        Schema::dropIfExists('article_revisions');
        Schema::dropIfExists('articles');
    }
};
