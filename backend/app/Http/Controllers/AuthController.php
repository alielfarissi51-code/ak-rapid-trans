<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function userPayload(User $user): array
    {
        $user->loadMissing('role');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id,
            'role' => $user->role?->name,
            'role_name' => $user->role?->name,
        ];
    }

    public function showLoginForm()
    {
        return response()->json([
            'message' => 'Login UI is handled by the React frontend.',
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            return back()
                ->withErrors(['email' => __('messages.invalid_credentials')])
                ->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function showRegisterForm()
    {
        return response()->json([
            'message' => 'Register UI is handled by the React frontend.',
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email', 'unique:clients,email'],
            'telephone' => ['required', 'string', 'max:50'],
            'adresse' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $userRole = Role::firstOrCreate(['name' => 'user']);

            $user = User::create([
                'role_id' => $userRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            Client::create([
                'nom' => $validated['name'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'],
                'adresse' => $validated['adresse'] ?? null,
            ]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        Mail::send('emails.welcome-user', ['user' => $user], function ($message) use ($user): void {
            $message->to($user->email)->subject(__('messages.welcome_subject'));
        });

        return response()->json([
            'message' => __('messages.account_created_success'),
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => __('messages.logout_success'),
        ]);
    }

    public function apiRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email', 'unique:clients,email'],
            'telephone' => ['required', 'string', 'max:50'],
            'adresse' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $userRole = Role::firstOrCreate(['name' => 'user']);

            $user = User::create([
                'role_id' => $userRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            Client::create([
                'nom' => $validated['name'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'],
                'adresse' => $validated['adresse'] ?? null,
            ]);

            return $user;
        });

        $token = $user->createToken('frontend-token')->plainTextToken;

        Mail::send('emails.welcome-user', ['user' => $user], function ($message) use ($user): void {
            $message->to($user->email)->subject(__('messages.welcome_subject'));
        });

        return response()->json([
            'message' => __('messages.account_created_success'),
            'token' => $token,
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function apiLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('messages.invalid_credentials')],
            ]);
        }

        $user->loadMissing('role');

        $user->tokens()->delete();
        $token = $user->createToken('frontend-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function apiMe(Request $request)
    {
        $user = $request->user()->load('role');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id,
            'role' => $user->role?->name,
            'role_name' => $user->role?->name,
        ]);
    }

    public function apiLogout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => __('messages.logout_success'),
        ]);
    }

    public function apiUpdateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => __('messages.profile_updated_success'),
            'user' => $this->userPayload($user->fresh()),
        ]);
    }

    public function apiUpdatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => [__('messages.current_password_invalid')],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => __('messages.password_updated_success'),
        ]);
    }
}