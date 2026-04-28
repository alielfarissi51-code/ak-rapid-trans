<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        $firstNames = ['Alex', 'Sam', 'Nadia', 'Youssef', 'Sara', 'Omar', 'Hana', 'Imane', 'Adam', 'Lina'];
        $lastNames = ['El Amrani', 'Bennani', 'Karim', 'Alaoui', 'Mansouri', 'Saidi', 'Fassi', 'Idrissi', 'Zahra', 'Tazi'];
        $name = $firstNames[array_rand($firstNames)].' '.$lastNames[array_rand($lastNames)];

        return [
            'nom' => $name,
            'email' => Str::lower(Str::slug($name)).'@example.com',
            'telephone' => '+212'.random_int(600000000, 799999999),
            'adresse' => 'Casablanca, Morocco',
        ];
    }
}
