<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Contact>
 */
class ContactFactory extends Factory
{
    protected $model = Contact::class;

    public function definition(): array
    {
        $firstNames = ['Alex', 'Sam', 'Nadia', 'Youssef', 'Sara', 'Omar', 'Hana', 'Imane', 'Adam', 'Lina'];
        $lastNames = ['El Amrani', 'Bennani', 'Karim', 'Alaoui', 'Mansouri', 'Saidi', 'Fassi', 'Idrissi', 'Zahra', 'Tazi'];
        $name = $firstNames[array_rand($firstNames)].' '.$lastNames[array_rand($lastNames)];

        return [
            'nom' => $name,
            'email' => Str::lower(Str::slug($name)).'@example.com',
            'message' => 'Demande de contact envoyee depuis le formulaire du site.',
        ];
    }
}
