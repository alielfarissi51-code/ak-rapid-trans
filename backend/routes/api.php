<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\CamionController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
// Public routes
Route::post('/login', [AuthController::class, 'apiLogin']);
Route::post('/register', [AuthController::class, 'apiRegister']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/me', [AuthController::class, 'apiMe']);
    Route::post('/logout', [AuthController::class, 'apiLogout']);
    Route::put('/me', [AuthController::class, 'apiUpdateProfile']);
    Route::put('/me/password', [AuthController::class, 'apiUpdatePassword']);

    // Users Management (Admin only)
    Route::apiResource('users', UserController::class);
    Route::get('/roles', [UserController::class, 'getRoles']);

    // Camions (Trucks) Management
    Route::apiResource('camions', CamionController::class);

    // Clients Management
    Route::apiResource('clients', ClientController::class);

    // Commandes (Orders) Management
    Route::apiResource('commandes', CommandeController::class);
});
