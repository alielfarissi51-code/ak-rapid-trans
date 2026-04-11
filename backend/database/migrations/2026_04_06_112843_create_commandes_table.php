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
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('camion_id')->nullable()->constrained()->nullOnDelete();

            $table->string('lieu_depart');
            $table->string('lieu_arrivee');
            $table->date('date_transport');
            $table->decimal('prix', 10, 2)->nullable();

            $table->enum('statut',['en_attente','validee','en_cours','livree','annulee'])->default('en_attente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
