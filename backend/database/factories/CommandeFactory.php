<?php

namespace Database\Factories;

use App\Models\Camion;
use App\Models\Client;
use App\Models\Commande;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Commande>
 */
class CommandeFactory extends Factory
{
    protected $model = Commande::class;

    public function definition(): array
    {
        $statuses = ['en_attente', 'validee', 'en_cours', 'livree', 'annulee'];
        $cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Oujda', 'Kenitra'];

        return [
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),
            'client_id' => Client::query()->inRandomOrder()->value('id') ?? Client::factory(),
            'camion_id' => random_int(1, 100) <= 80
                ? (Camion::query()->inRandomOrder()->value('id') ?? Camion::factory())
                : null,
            'lieu_depart' => $cities[array_rand($cities)],
            'lieu_arrivee' => $cities[array_rand($cities)],
            'date_transport' => now()->addDays(random_int(-60, 60))->format('Y-m-d'),
            'prix' => random_int(500, 15000),
            'statut' => $statuses[array_rand($statuses)],
            'verified' => random_int(1, 100) <= 70,
        ];
    }
}
