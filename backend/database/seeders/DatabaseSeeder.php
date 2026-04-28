<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Camion;
use App\Models\Client;
use App\Models\Commande;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $clientRole = Role::firstOrCreate(['name' => 'client']);

        User::updateOrCreate(
            ['email' => 'admin@akrapidtrans.com'],
            [
                'role_id' => $adminRole->id,
                'role' => 'admin',
                'name' => 'Admin AK Rapid Trans',
                'password' => Hash::make('Admin@1234'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'client@akrapidtrans.com'],
            [
                'role_id' => $clientRole->id,
                'role' => 'client',
                'name' => 'Client AK Rapid Trans',
                'password' => Hash::make('client@1234'),
            ]
        );

        User::factory(25)->create([
            'role_id' => $clientRole->id,
            'role' => 'client',
        ]);

        Client::factory(30)->create();
        Camion::factory(12)->create();
        Commande::factory(60)->create();
        Contact::factory(20)->create();
    }
}