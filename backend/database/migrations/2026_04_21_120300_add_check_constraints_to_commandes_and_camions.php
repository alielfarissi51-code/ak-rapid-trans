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
        DB::statement('ALTER TABLE camions ADD CONSTRAINT chk_camions_capacite_positive CHECK (capacite > 0)');
        DB::statement('ALTER TABLE commandes ADD CONSTRAINT chk_commandes_prix_positive CHECK (prix IS NULL OR prix >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE camions DROP CONSTRAINT IF EXISTS chk_camions_capacite_positive');
            DB::statement('ALTER TABLE commandes DROP CONSTRAINT IF EXISTS chk_commandes_prix_positive');
            return;
        }

        DB::statement('ALTER TABLE camions DROP CHECK chk_camions_capacite_positive');
        DB::statement('ALTER TABLE commandes DROP CHECK chk_commandes_prix_positive');
    }
};
