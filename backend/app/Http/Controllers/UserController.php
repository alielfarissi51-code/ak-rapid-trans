<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of all users
     */
    public function index()
    {
        $users = User::with('roleRelation')->latest()->get()->map(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $user->roleRelation,
                'role_name' => $user->resolvedRole(),
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        return response()->json($users);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role_id' => ['required', 'exists:roles,id'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        if (isset($validated['role_id'])) {
            $role = Role::find($validated['role_id']);
            $validated['role'] = $role?->name;
        }

        $user = User::create($validated);

        return response()->json([
            ...$user->toArray(),
            'role' => $user->load('roleRelation')->roleRelation,
            'role_name' => $user->resolvedRole(),
        ], 201);
    }

    /**
     * Display a specific user
     */
    public function show(User $user)
    {
        $user->load('roleRelation');

        return response()->json([
            ...$user->toArray(),
            'role' => $user->roleRelation,
            'role_name' => $user->resolvedRole(),
        ]);
    }

    /**
     * Update a specific user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => ['sometimes', 'required', 'exists:roles,id'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
        ]);

        // Hash password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if (isset($validated['role_id'])) {
            $role = Role::find($validated['role_id']);
            $validated['role'] = $role?->name;
        }

        $user->update($validated);

        $user->load('roleRelation');

        return response()->json([
            ...$user->toArray(),
            'role' => $user->roleRelation,
            'role_name' => $user->resolvedRole(),
        ]);
    }

    /**
     * Delete a specific user
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }

    /**
     * Get all available roles
     */
    public function getRoles()
    {
        return response()->json(Role::all());
    }
}
