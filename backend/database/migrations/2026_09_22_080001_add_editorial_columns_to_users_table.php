<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 50)->default('staff')->after('password')->index();
            $table->string('slug')->unique()->nullable()->after('role');
            $table->string('designation')->nullable()->after('slug');
            $table->text('bio')->nullable()->after('designation');
            $table->string('profile_image')->nullable()->after('bio');
            $table->string('phone', 30)->nullable()->after('profile_image');
            $table->json('social_links')->nullable()->after('phone');
            $table->string('status', 30)->default('active')->after('social_links')->index();
            $table->softDeletes()->after('updated_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn([
                'role',
                'slug',
                'designation',
                'bio',
                'profile_image',
                'phone',
                'social_links',
                'status',
            ]);
        });
    }
};
