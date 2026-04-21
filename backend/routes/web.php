<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'AK Rapid Trans backend is running. Use the React frontend for UI.',
    ]);
});
