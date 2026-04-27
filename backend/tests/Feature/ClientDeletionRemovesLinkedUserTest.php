<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClientDeletionRemovesLinkedUserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('pdo_sqlite extension is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_deleting_client_from_admin_also_deletes_linked_client_user(): void
    {
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $clientRole = Role::factory()->create(['name' => 'client']);

        $admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'role' => 'admin',
        ]);

        $clientUser = User::factory()->create([
            'role_id' => $clientRole->id,
            'role' => 'client',
            'email' => 'deleted-client@example.com',
        ]);

        $client = Client::factory()->create([
            'email' => 'deleted-client@example.com',
        ]);

        Sanctum::actingAs($admin);

        $this->deleteJson('/api/admin/clients/'.$client->id)->assertNoContent();

        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
        $this->assertDatabaseMissing('users', ['id' => $clientUser->id]);
    }
}