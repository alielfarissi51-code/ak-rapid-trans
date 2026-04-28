<?php

namespace Database\Factories;

use App\Models\Camion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Camion>
 */
class CamionFactory extends Factory
{
    protected $model = Camion::class;

    public function definition(): array
    {
        $faker = \Faker\Factory::create();

        return [
            'matricule' => strtoupper($faker->bothify('??-####-??')),
            'marque' => $faker->randomElement(['Volvo', 'Mercedes', 'Renault', 'MAN', 'Scania']),
            'capacite' => $faker->numberBetween(2, 40),
            'statut' => $faker->randomElement(['disponible', 'en_maintenance', 'indisponible']),
        ];
    }
}
