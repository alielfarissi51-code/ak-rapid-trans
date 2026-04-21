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
        return [
            'matricule' => strtoupper(fake()->bothify('??-####-??')),
            'marque' => fake()->randomElement(['Volvo', 'Mercedes', 'Renault', 'MAN', 'Scania']),
            'capacite' => fake()->numberBetween(2, 40),
            'statut' => fake()->randomElement(['disponible', 'en_maintenance', 'indisponible']),
        ];
    }
}
