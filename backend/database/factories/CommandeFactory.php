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
        $faker = \Faker\Factory::create();

        return [
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),
            'client_id' => Client::query()->inRandomOrder()->value('id') ?? Client::factory(),
            'camion_id' => $faker->boolean(80)
                ? (Camion::query()->inRandomOrder()->value('id') ?? Camion::factory())
                : null,
            'lieu_depart' => $faker->city(),
            'lieu_arrivee' => $faker->city(),
            'date_transport' => $faker->dateTimeBetween('-2 months', '+2 months')->format('Y-m-d'),
            'prix' => $faker->randomFloat(2, 500, 15000),
            'statut' => $faker->randomElement(['en_attente', 'validee', 'en_cours', 'livree', 'annulee']),
            'verified' => $faker->boolean(70),
        ];
    }
}
