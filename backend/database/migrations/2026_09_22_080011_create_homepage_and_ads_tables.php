<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key', 50)->unique();
            $table->string('title');
            $table->string('title_gu');
            $table->string('subtitle')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedSmallInteger('card_limit')->default(6);
            $table->json('custom_config')->nullable();
            $table->timestamps();
        });

        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('placement', 50)->index(); // desktop_banner, mobile_banner, sidebar, article_inline, homepage
            $table->string('image_url', 1000)->nullable();
            $table->string('destination_url', 1000)->nullable();
            $table->text('code_html')->nullable();
            $table->timestamp('start_date')->nullable()->index();
            $table->timestamp('end_date')->nullable()->index();
            $table->string('status', 30)->default('active')->index(); // active, inactive, expired
            $table->unsignedBigInteger('impressions_count')->default(0);
            $table->unsignedBigInteger('clicks_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
        Schema::dropIfExists('homepage_sections');
    }
};
