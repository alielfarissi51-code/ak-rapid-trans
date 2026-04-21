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

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $managerRole = Role::firstOrCreate(['name' => 'manager']);

        User::updateOrCreate([
            'email' => 'admin@akrapidtrans.com',
        ], [
            'role_id' => $adminRole->id,
            'name' => 'Admin AK Rapid Trans',
            'password' => Hash::make('Admin@1234'),
        ]);
        User::updateOrCreate([
            'email' => 'client@akrapidtrans.com',
        ], [
            'role_id' => $userRole->id,
            'name' => 'Admin AK Rapid Trans',
            'password' => Hash::make('client@1234'),
        ]);

        User::factory(10)->create();
        User::factory(3)->create(['role_id' => $managerRole->id]);
        User::factory(12)->create(['role_id' => $userRole->id]);

        Client::factory(30)->create();
        Camion::factory(12)->create();
        Commande::factory(60)->create();
        Contact::factory(20)->create();
    }
}
