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

        DB::unprepared('DROP PROCEDURE IF EXISTS sp_commandes_status_summary');

        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE sp_commandes_status_summary()
            BEGIN
                SELECT
                    statut,
                    COUNT(*) AS total,
                    COALESCE(SUM(prix), 0) AS total_amount
                FROM commandes
                GROUP BY statut
                ORDER BY total DESC;
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

        DB::unprepared('DROP PROCEDURE IF EXISTS sp_commandes_status_summary');
    }
};
