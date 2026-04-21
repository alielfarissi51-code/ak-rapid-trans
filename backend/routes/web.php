<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
<<<<<<< HEAD
    return response()->json(['message'=>'Laravel is working ✅']);
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');

    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});

Route::middleware('auth')->group(function () {
    Route::view('/dashboard', 'dashboard')->name('dashboard');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::resource('clients', ClientController::class);
    Route::resource('contacts', ContactController::class);

    Route::middleware('role:admin')->group(function () {
        Route::resource('roles', RoleController::class);
        Route::resource('camions', CamionController::class);
        Route::resource('commandes', CommandeController::class);
    });
=======
    return response()->json([
        'message' => 'AK Rapid Trans backend is running. Use the React frontend for UI.',
    ]);
>>>>>>> a6eee3b685361401cac096bfca9ec30a91f90c15
});
