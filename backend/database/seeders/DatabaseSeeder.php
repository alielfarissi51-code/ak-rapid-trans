<?php

namespace Database\Seeders;

use App\Models\Role;
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
        Role::firstOrCreate(['name' => 'user']);

        User::updateOrCreate([
            'email' => 'admin@akrapidtrans.com',
        ], [
            'role_id' => $adminRole->id,
            'name' => 'Admin AK Rapid Trans',
            'password' => Hash::make('Admin@1234'),
        ]);
    }
}
