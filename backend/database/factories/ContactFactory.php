<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contact>
 */
class ContactFactory extends Factory
{
    protected $model = Contact::class;

    public function definition(): array
    {
        $faker = \Faker\Factory::create();

        return [
            'nom' => $faker->name(),
            'email' => $faker->safeEmail(),
            'message' => $faker->paragraph(),
        ];
    }
}
