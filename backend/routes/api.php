<?php


use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CamionController;
use App\Http\Controllers\ClientOrderController;
use App\Http\Controllers\ClientNotificationController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\ReportController;
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

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Admin notifications
        Route::get('notifications/unread', [AdminNotificationController::class, 'getUnread']);
        Route::patch('notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
        Route::patch('notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);

        // Users and roles management
        Route::apiResource('users', UserController::class);
        Route::get('roles', [UserController::class, 'getRoles']);

        // Clients Management
        Route::apiResource('clients', ClientController::class);

        // Camions (Trucks) and commandes management
        Route::get('commandes/{commande}/status-logs', [CommandeController::class, 'statusLogs']);
        Route::post('commandes/{commande}/facture/generate', [CommandeController::class, 'generateFacture']);
        Route::apiResource('camions', CamionController::class);
        Route::apiResource('commandes', CommandeController::class);

        // Reporting and data exchange
        Route::get('reports/commandes/pdf', [ReportController::class, 'commandesPdf']);
        Route::get('reports/commandes/summary', [ReportController::class, 'commandesSummary']);
        Route::get('reports/commandes/export-xml', [ReportController::class, 'exportCommandesXml']);
        Route::post('reports/commandes/import-xml', [ReportController::class, 'importCommandesXml']);
    });

    Route::prefix('client')->middleware('role:client')->group(function () {
        Route::get('commandes/summary', [ClientOrderController::class, 'summary']);
        Route::get('commandes', [ClientOrderController::class, 'index']);
        Route::post('commandes', [ClientOrderController::class, 'store']);
        Route::get('commandes/{commande}', [ClientOrderController::class, 'show']);
        Route::get('notifications', [ClientNotificationController::class, 'index']);
        Route::patch('notifications/{id}/read', [ClientNotificationController::class, 'markAsRead']);
        Route::patch('notifications/read-all', [ClientNotificationController::class, 'markAllAsRead']);
    });

    Route::get('commandes/{commande}/facture/download', [CommandeController::class, 'downloadFacture']);
});
