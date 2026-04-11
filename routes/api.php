Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::apiResource('commandes', CommandeController::class);
Route::apiResource('camions', CamionController::class);
Route::apiResource('clients', ClientController::class);