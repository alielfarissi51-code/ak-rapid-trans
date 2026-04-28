<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function hasForeignKey(string $table, string $constraint): bool
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            $row = DB::selectOne(
                "SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints
                    WHERE table_schema = current_schema()
                      AND table_name = ?
                      AND constraint_name = ?
                      AND constraint_type = 'FOREIGN KEY'
                ) AS exists",
                [$table, $constraint]
            );

            return (bool) ($row?->exists ?? false);
        }

        $row = DB::selectOne(
            "SELECT COUNT(*) AS aggregate
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND CONSTRAINT_NAME = ?
               AND CONSTRAINT_TYPE = 'FOREIGN KEY'",
            [$table, $constraint]
        );

        return ((int) ($row?->aggregate ?? 0)) > 0;
    }

    private function hasUniqueConstraint(string $table, string $constraint): bool
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            $row = DB::selectOne(
                "SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints
                    WHERE table_schema = current_schema()
                      AND table_name = ?
                      AND constraint_name = ?
                      AND constraint_type = 'UNIQUE'
                ) AS exists",
                [$table, $constraint]
            );

            return (bool) ($row?->exists ?? false);
        }

        $row = DB::selectOne(
            "SELECT COUNT(*) AS aggregate
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND CONSTRAINT_NAME = ?
               AND CONSTRAINT_TYPE = 'UNIQUE'",
            [$table, $constraint]
        );

        return ((int) ($row?->aggregate ?? 0)) > 0;
    }

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
        $hasFk = $this->hasForeignKey('admin_notifications', 'admin_notifications_commande_id_foreign');
        $hasOldUnique = $this->hasUniqueConstraint('admin_notifications', 'admin_notifications_commande_id_unique');
        $hasComposite = $this->hasUniqueConstraint('admin_notifications', 'admin_notifs_commande_type_unique');

        Schema::table('admin_notifications', function (Blueprint $table) use ($hasFk, $hasOldUnique, $hasComposite) {
            if ($hasFk) {
                $table->dropForeign(['commande_id']);
            }
            if ($hasOldUnique) {
                $table->dropUnique('admin_notifications_commande_id_unique');
            }
            if (! $hasComposite) {
                $table->unique(['commande_id', 'type'], 'admin_notifs_commande_type_unique');
            }
            // Re-add the FK after the unique/index changes so both MySQL and PostgreSQL
            // keep the relationship intact regardless of partial migration state.
            if ($hasFk) {
                $table->foreign('commande_id')
                    ->references('id')->on('commandes')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        $hasFk = $this->hasForeignKey('admin_notifications', 'admin_notifications_commande_id_foreign');
        $hasOldUnique = $this->hasUniqueConstraint('admin_notifications', 'admin_notifications_commande_id_unique');
        $hasComposite = $this->hasUniqueConstraint('admin_notifications', 'admin_notifs_commande_type_unique');

        Schema::table('admin_notifications', function (Blueprint $table) {
            if (Schema::hasColumn('admin_notifications', 'type')) {
                $table->dropColumn('type');
            }
        });

        Schema::table('admin_notifications', function (Blueprint $table) use ($hasFk, $hasOldUnique, $hasComposite) {
            if ($hasComposite) {
                $table->dropUnique('admin_notifs_commande_type_unique');
            }

            if ($hasFk) {
                $table->dropForeign(['commande_id']);
            }

            if (! $hasOldUnique) {
                $table->unique('commande_id');
            }

            if ($hasFk) {
                $table->foreign('commande_id')
                    ->references('id')->on('commandes')
                    ->nullOnDelete();
            }
        });
    }
};
