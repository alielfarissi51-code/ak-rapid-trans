<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        $faker = \Faker\Factory::create();

        return [
            'nom' => $faker->name(),
            'email' => $faker->unique()->safeEmail(),
            'telephone' => $faker->phoneNumber(),
            'adresse' => $faker->address(),
        ];
    }
}
