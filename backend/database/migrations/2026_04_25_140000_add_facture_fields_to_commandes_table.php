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
        Schema::table('commandes', function (Blueprint $table): void {
            if (! Schema::hasColumn('commandes', 'facture_number')) {
                $table->string('facture_number')->nullable()->unique()->after('verified');
            }

            if (! Schema::hasColumn('commandes', 'facture_path')) {
                $table->string('facture_path')->nullable()->after('facture_number');
            }

            if (! Schema::hasColumn('commandes', 'facture_generated_at')) {
                $table->timestamp('facture_generated_at')->nullable()->after('facture_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table): void {
            if (Schema::hasColumn('commandes', 'facture_generated_at')) {
                $table->dropColumn('facture_generated_at');
            }

            if (Schema::hasColumn('commandes', 'facture_path')) {
                $table->dropColumn('facture_path');
            }

            if (Schema::hasColumn('commandes', 'facture_number')) {
                $table->dropUnique(['facture_number']);
                $table->dropColumn('facture_number');
            }
        });
    }
};
