<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('states', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_gu')->nullable();
            $table->string('code', 10)->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('state_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('name_gu');
            $table->string('slug')->unique();
            $table->string('code', 10)->nullable()->index();
            $table->string('headquarters')->nullable();
            $table->string('svg_path_id', 50)->nullable()->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('talukas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('name_gu')->nullable();
            $table->string('slug');
            $table->timestamps();
            $table->unique(['district_id', 'slug']);
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->foreignId('taluka_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('name_gu');
            $table->string('slug')->unique();
            $table->boolean('is_major')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('local_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('name_gu')->nullable();
            $table->string('slug');
            $table->string('pincode', 10)->nullable();
            $table->timestamps();
            $table->unique(['city_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('local_areas');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('talukas');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('states');
    }
};
