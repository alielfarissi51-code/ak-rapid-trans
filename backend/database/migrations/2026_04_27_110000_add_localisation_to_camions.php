<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('camions', function (Blueprint $table) {
            // Base city/location of the truck — used for proximity-based assignment scoring
            $table->string('localisation')->nullable()->after('capacite');
        });
    }

    public function down(): void
    {
        Schema::table('camions', function (Blueprint $table) {
            $table->dropColumn('localisation');
        });
    }
};
