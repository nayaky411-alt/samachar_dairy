<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (!Schema::hasColumn('articles', 'wordpress_post_id')) {
                $table->unsignedBigInteger('wordpress_post_id')->nullable()->index();
            }
            if (!Schema::hasColumn('articles', 'wordpress_author_id')) {
                $table->unsignedBigInteger('wordpress_author_id')->nullable();
            }
            if (!Schema::hasColumn('articles', 'import_source')) {
                $table->string('import_source', 50)->nullable()->index();
            }
            if (!Schema::hasColumn('articles', 'is_imported')) {
                $table->boolean('is_imported')->default(false)->index();
            }
            if (!Schema::hasColumn('articles', 'original_url')) {
                $table->string('original_url', 1000)->nullable();
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'wordpress_term_id')) {
                $table->unsignedBigInteger('wordpress_term_id')->nullable()->index();
            }
            if (!Schema::hasColumn('categories', 'import_source')) {
                $table->string('import_source', 50)->nullable();
            }
            if (!Schema::hasColumn('categories', 'is_imported')) {
                $table->boolean('is_imported')->default(false);
            }
        });

        Schema::table('tags', function (Blueprint $table) {
            if (!Schema::hasColumn('tags', 'wordpress_term_id')) {
                $table->unsignedBigInteger('wordpress_term_id')->nullable()->index();
            }
            if (!Schema::hasColumn('tags', 'import_source')) {
                $table->string('import_source', 50)->nullable();
            }
            if (!Schema::hasColumn('tags', 'is_imported')) {
                $table->boolean('is_imported')->default(false);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'wordpress_user_id')) {
                $table->unsignedBigInteger('wordpress_user_id')->nullable()->index();
            }
            if (!Schema::hasColumn('users', 'import_source')) {
                $table->string('import_source', 50)->nullable();
            }
            if (!Schema::hasColumn('users', 'is_imported')) {
                $table->boolean('is_imported')->default(false);
            }
        });

        Schema::table('media', function (Blueprint $table) {
            if (!Schema::hasColumn('media', 'wordpress_attachment_id')) {
                $table->unsignedBigInteger('wordpress_attachment_id')->nullable()->index();
            }
            if (!Schema::hasColumn('media', 'original_url')) {
                $table->string('original_url', 1000)->nullable();
            }
            if (!Schema::hasColumn('media', 'import_source')) {
                $table->string('import_source', 50)->nullable();
            }
            if (!Schema::hasColumn('media', 'is_imported')) {
                $table->boolean('is_imported')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn(['wordpress_post_id', 'wordpress_author_id', 'import_source', 'is_imported', 'original_url']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['wordpress_term_id', 'import_source', 'is_imported']);
        });

        Schema::table('tags', function (Blueprint $table) {
            $table->dropColumn(['wordpress_term_id', 'import_source', 'is_imported']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['wordpress_user_id', 'import_source', 'is_imported']);
        });

        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn(['wordpress_attachment_id', 'original_url', 'import_source', 'is_imported']);
        });
    }
};
