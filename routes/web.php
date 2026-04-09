<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CamionController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
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
});
