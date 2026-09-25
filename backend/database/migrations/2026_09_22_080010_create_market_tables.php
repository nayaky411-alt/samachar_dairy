<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('market_indices', function (Blueprint $table) {
            $table->id();
            $table->string('symbol', 50)->unique(); // NIFTY 50, SENSEX, BANK NIFTY
            $table->string('name', 100);
            $table->decimal('current_value', 12, 2)->default(0);
            $table->decimal('change_value', 10, 2)->default(0);
            $table->decimal('change_percent', 6, 2)->default(0);
            $table->decimal('day_high', 12, 2)->nullable();
            $table->decimal('day_low', 12, 2)->nullable();
            $table->string('market_status', 30)->default('Open'); // Open, Closed, Pre-Open
            $table->string('provider', 100)->default('Samachar Financial Feed');
            $table->boolean('is_delayed')->default(true);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });

        Schema::create('market_symbols', function (Blueprint $table) {
            $table->id();
            $table->string('symbol', 50)->index();
            $table->string('name', 100);
            $table->string('exchange', 20)->default('NSE');
            $table->string('type', 30)->default('popular')->index(); // gainer, loser, popular
            $table->decimal('current_value', 12, 2)->default(0);
            $table->decimal('change_value', 10, 2)->default(0);
            $table->decimal('change_percent', 6, 2)->default(0);
            $table->unsignedBigInteger('volume')->nullable();
            $table->string('provider', 100)->default('Samachar Financial Feed');
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });

        Schema::create('market_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 100);
            $table->json('data_payload');
            $table->boolean('is_demo')->default(false);
            $table->timestamp('fetched_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('market_snapshots');
        Schema::dropIfExists('market_symbols');
        Schema::dropIfExists('market_indices');
    }
};
