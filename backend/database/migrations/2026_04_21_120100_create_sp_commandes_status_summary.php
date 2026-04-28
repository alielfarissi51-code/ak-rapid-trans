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
        if ($driver === 'pgsql') {
            DB::unprepared('DROP FUNCTION IF EXISTS sp_commandes_status_summary()');

            DB::unprepared(<<<'SQL'
                CREATE FUNCTION sp_commandes_status_summary()
                RETURNS TABLE (statut text, total bigint, total_amount numeric)
                LANGUAGE sql
                AS $$
                    SELECT
                        statut,
                        COUNT(*)::bigint AS total,
                        COALESCE(SUM(prix), 0) AS total_amount
                    FROM commandes
                    GROUP BY statut
                    ORDER BY total DESC
                $$
            SQL);

            return;
        }

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
        if ($driver === 'pgsql') {
            DB::unprepared('DROP FUNCTION IF EXISTS sp_commandes_status_summary()');

            return;
        }

        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        DB::unprepared('DROP PROCEDURE IF EXISTS sp_commandes_status_summary');
    }
};
