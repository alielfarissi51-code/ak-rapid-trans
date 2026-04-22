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
        return [
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),
            'client_id' => Client::query()->inRandomOrder()->value('id') ?? Client::factory(),
            'camion_id' => fake()->boolean(80)
                ? (Camion::query()->inRandomOrder()->value('id') ?? Camion::factory())
                : null,
            'lieu_depart' => fake()->city(),
            'lieu_arrivee' => fake()->city(),
            'date_transport' => fake()->dateTimeBetween('-2 months', '+2 months')->format('Y-m-d'),
            'prix' => fake()->randomFloat(2, 500, 15000),
            'statut' => fake()->randomElement(['en_attente', 'validee', 'en_cours', 'livree', 'annulee']),
            'verified' => fake()->boolean(70),
        ];
    }
}
