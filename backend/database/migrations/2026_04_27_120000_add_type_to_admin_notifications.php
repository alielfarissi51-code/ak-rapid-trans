<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add the type column if it isn't there yet (a previous partial run may
        //    have added it before failing on the index steps).
        if (! Schema::hasColumn('admin_notifications', 'type')) {
            Schema::table('admin_notifications', function (Blueprint $table) {
                $table->string('type')->default('new_order')->after('message');
            });
        }

        // 2. Drop the FK so we can replace the single-column unique with a composite one.
        //    MySQL requires the index that backs the FK to be dropped AFTER the FK.
        $hasFk = DB::select(
            "SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME    = 'admin_notifications'
               AND CONSTRAINT_NAME = 'admin_notifications_commande_id_foreign'
             LIMIT 1"
        );

        $hasOldUnique = DB::select(
            "SELECT 1 FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME   = 'admin_notifications'
               AND INDEX_NAME   = 'admin_notifications_commande_id_unique'
             LIMIT 1"
        );

        $hasComposite = DB::select(
            "SELECT 1 FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME   = 'admin_notifications'
               AND INDEX_NAME   = 'admin_notifs_commande_type_unique'
             LIMIT 1"
        );

        Schema::table('admin_notifications', function (Blueprint $table) use ($hasFk, $hasOldUnique, $hasComposite) {
            if ($hasFk) {
                $table->dropForeign(['commande_id']);
            }
            if ($hasOldUnique) {
                $table->dropUnique(['commande_id']);
            }
            if (! $hasComposite) {
                $table->unique(['commande_id', 'type'], 'admin_notifs_commande_type_unique');
            }
            // Re-add the FK (composite index on (commande_id, type) satisfies
            // MySQL's requirement that the FK column has a leading index).
            if ($hasFk) {
                $table->foreign('commande_id')
                    ->references('id')->on('commandes')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('admin_notifications', function (Blueprint $table) {
            $table->dropForeign(['commande_id']);
            $table->dropUnique('admin_notifs_commande_type_unique');
            $table->dropColumn('type');
            $table->unique('commande_id');
            $table->foreign('commande_id')
                ->references('id')->on('commandes')
                ->nullOnDelete();
        });
    }
};
