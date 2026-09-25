<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('market_symbols', function (Blueprint $table) {
            if (!Schema::hasColumn('market_symbols', 'display_name')) {
                $table->string('display_name', 100)->nullable()->after('symbol');
            }
            if (!Schema::hasColumn('market_symbols', 'instrument_type')) {
                $table->string('instrument_type', 30)->default('stock')->index()->after('exchange'); // index, stock, etf
            }
            if (!Schema::hasColumn('market_symbols', 'is_active')) {
                $table->boolean('is_active')->default(true)->index()->after('instrument_type');
            }
            if (!Schema::hasColumn('market_symbols', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('is_active');
            }
        });

        Schema::table('market_snapshots', function (Blueprint $table) {
            if (!Schema::hasColumn('market_snapshots', 'symbol')) {
                $table->string('symbol', 50)->nullable()->index()->after('id');
            }
            if (!Schema::hasColumn('market_snapshots', 'name')) {
                $table->string('name', 100)->nullable()->after('symbol');
            }
            if (!Schema::hasColumn('market_snapshots', 'exchange')) {
                $table->string('exchange', 20)->nullable()->after('name');
            }
            if (!Schema::hasColumn('market_snapshots', 'price')) {
                $table->decimal('price', 14, 2)->nullable()->after('exchange');
            }
            if (!Schema::hasColumn('market_snapshots', 'previous_close')) {
                $table->decimal('previous_close', 14, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('market_snapshots', 'change')) {
                $table->decimal('change', 10, 2)->nullable()->after('previous_close');
            }
            if (!Schema::hasColumn('market_snapshots', 'change_percent')) {
                $table->decimal('change_percent', 8, 2)->nullable()->after('change');
            }
            if (!Schema::hasColumn('market_snapshots', 'volume')) {
                $table->unsignedBigInteger('volume')->nullable()->after('change_percent');
            }
            if (!Schema::hasColumn('market_snapshots', 'market_status')) {
                $table->string('market_status', 30)->nullable()->after('volume');
            }
            if (!Schema::hasColumn('market_snapshots', 'provider_timestamp')) {
                $table->timestamp('provider_timestamp')->nullable()->after('market_status');
            }
            if (Schema::hasColumn('market_snapshots', 'data_payload')) {
                $table->json('data_payload')->nullable()->change();
            }
            if (Schema::hasColumn('market_snapshots', 'fetched_at')) {
                $table->timestamp('fetched_at')->nullable()->change();
            }
        });

        if (!Schema::hasTable('market_settings')) {
            Schema::create('market_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key', 100)->unique();
                $table->text('value')->nullable();
                $table->string('description', 255)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_settings');

        Schema::table('market_snapshots', function (Blueprint $table) {
            $table->dropColumn([
                'symbol', 'name', 'exchange', 'price', 'previous_close',
                'change', 'change_percent', 'volume', 'market_status', 'provider_timestamp'
            ]);
        });

        Schema::table('market_symbols', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'instrument_type', 'is_active', 'sort_order']);
        });
    }
};
