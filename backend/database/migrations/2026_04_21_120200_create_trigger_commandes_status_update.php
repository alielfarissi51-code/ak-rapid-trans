<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();
        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trg_commandes_status_update');

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_commandes_status_update
            AFTER UPDATE ON commandes
            FOR EACH ROW
            BEGIN
                IF OLD.statut <> NEW.statut THEN
                    INSERT INTO commande_status_logs (commande_id, old_status, new_status, changed_at, created_at, updated_at)
                    VALUES (NEW.id, OLD.statut, NEW.statut, NOW(), NOW(), NOW());
                END IF;
            END
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trg_commandes_status_update');
    }
};
