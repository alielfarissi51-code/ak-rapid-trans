<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommandeController;
use Illuminate\Support\Facades\Route;


Route::post('/login', [AuthController::class, 'apiLogin']);
Route::post('/register', [AuthController::class, 'apiRegister']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'apiMe']);
    Route::post('/logout', [AuthController::class, 'apiLogout']);

});
