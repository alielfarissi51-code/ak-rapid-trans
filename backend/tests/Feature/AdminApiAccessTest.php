<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminApiAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('pdo_sqlite extension is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_non_admin_user_cannot_access_admin_api_routes(): void
    {
        $role = Role::factory()->create(['name' => 'user']);
        $user = User::factory()->create(['role_id' => $role->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/users')->assertStatus(403);
        $this->getJson('/api/reports/commandes/summary')->assertStatus(403);
    }

    public function test_admin_user_can_access_admin_api_routes(): void
    {
        $role = Role::factory()->create(['name' => 'admin']);
        $admin = User::factory()->create(['role_id' => $role->id]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/users')->assertOk();
    }
}
