<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CommandeController;

Route::get('/', function () {
    return view('welcome');
});
Route::resource('commandes', CommandeController::class);
