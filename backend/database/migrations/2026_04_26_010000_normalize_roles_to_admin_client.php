<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $adminRoleId = DB::table('roles')->where('name', 'admin')->value('id');
        if (! $adminRoleId) {
            $adminRoleId = DB::table('roles')->insertGetId([
                'name' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $clientRoleId = DB::table('roles')->where('name', 'client')->value('id');
        if (! $clientRoleId) {
            $clientRoleId = DB::table('roles')->insertGetId([
                'name' => 'client',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $deprecatedRoleIds = DB::table('roles')
            ->whereIn('name', ['manager', 'user'])
            ->pluck('id')
            ->all();

        DB::table('users')
            ->whereRaw("LOWER(COALESCE(role, '')) IN (?, ?)", ['manager', 'user'])
            ->update([
                'role' => 'client',
                'role_id' => $clientRoleId,
                'updated_at' => now(),
            ]);

        if (! empty($deprecatedRoleIds)) {
            DB::table('users')
                ->whereIn('role_id', $deprecatedRoleIds)
                ->update([
                    'role' => 'client',
                    'role_id' => $clientRoleId,
                    'updated_at' => now(),
                ]);
        }

        DB::table('users')
            ->whereRaw("LOWER(COALESCE(role, '')) = ?", ['admin'])
            ->update([
                'role' => 'admin',
                'role_id' => $adminRoleId,
                'updated_at' => now(),
            ]);

        DB::table('users')
            ->whereRaw("LOWER(COALESCE(role, '')) = ?", ['client'])
            ->update([
                'role' => 'client',
                'role_id' => $clientRoleId,
                'updated_at' => now(),
            ]);

        DB::table('roles')->whereIn('name', ['manager', 'user'])->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $timestamp = now();

        foreach (['manager', 'user'] as $name) {
            $exists = DB::table('roles')->where('name', $name)->exists();
            if (! $exists) {
                DB::table('roles')->insert([
                    'name' => $name,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }
    }
};
