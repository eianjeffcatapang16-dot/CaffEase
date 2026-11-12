<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::get('/check-auth', [AuthController::class, 'checkAuth']);
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/seed-menu', [MenuController::class, 'seedMenu']);

// 🔁 CSRF refresh (fix token mismatch)
Route::get('/refresh-csrf', function () {
    return response()->json(['token' => csrf_token()]);
});

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (AUTH REQUIRED)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Users (Manager / Admin only — enforced in controller)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);

    // 🔴 VOID ORDER (MANAGER ONLY – enforced in controller)
    Route::post('/orders/{id}/void', [OrderController::class, 'void']);

    // Dashboard
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);
});

/*
|--------------------------------------------------------------------------
| VIEW ROUTES (SPA STYLE)
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return view('pos');
});

// Catch-all (ALWAYS LAST)
Route::get('/{any}', function () {
    return view('pos');
})->where('any', '.*');
