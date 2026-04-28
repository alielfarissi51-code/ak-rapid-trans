<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $clientRole = Role::query()->firstOrCreate(['name' => 'client']);
        $firstNames = ['Alex', 'Sam', 'Nadia', 'Youssef', 'Sara', 'Omar', 'Hana', 'Imane', 'Adam', 'Lina'];
        $lastNames = ['El Amrani', 'Bennani', 'Karim', 'Alaoui', 'Mansouri', 'Saidi', 'Fassi', 'Idrissi', 'Zahra', 'Tazi'];
        $name = $firstNames[array_rand($firstNames)].' '.$lastNames[array_rand($lastNames)];

        return [
            'role_id' => $clientRole->id,
            'role' => 'client',
            'name' => $name,
            'email' => Str::lower(Str::slug($name)).'@example.com',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
