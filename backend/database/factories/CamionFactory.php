<?php

namespace Database\Factories;

use App\Models\Camion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Camion>
 */
class CamionFactory extends Factory
{
    protected $model = Camion::class;

    public function definition(): array
    {
        $brands = ['Volvo', 'Mercedes', 'Renault', 'MAN', 'Scania'];

        return [
            'matricule' => strtoupper(Str::random(2)).'-'.random_int(1000, 9999).'-'.strtoupper(Str::random(2)),
            'marque' => $brands[array_rand($brands)],
            'capacite' => random_int(2, 40),
            'statut' => ['disponible', 'en_maintenance', 'indisponible'][array_rand(['disponible', 'en_maintenance', 'indisponible'])],
        ];
    }
}
