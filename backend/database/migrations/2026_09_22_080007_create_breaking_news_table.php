<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('breaking_news', function (Blueprint $table) {
            $table->id();
            $table->text('headline');
            $table->string('link_url', 1000)->nullable();
            $table->foreignId('article_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('priority')->default(1)->index();
            $table->boolean('is_pinned')->default(false)->index();
            $table->string('status', 30)->default('published')->index(); // published, draft, expired
            $table->timestamp('start_time')->nullable()->index();
            $table->timestamp('end_time')->nullable()->index();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'start_time', 'end_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breaking_news');
    }
};
