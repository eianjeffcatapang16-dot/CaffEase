<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\DashboardController;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/check-auth', [AuthController::class, 'checkAuth']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Inventory routes
    Route::apiResource('inventory', InventoryController::class)->except(['show', 'update']);
    
    // User management routes (Manager only)
    Route::apiResource('users', UserController::class)->except(['show', 'update']);
    
    // Order routes
    Route::apiResource('orders', OrderController::class)->except(['show', 'update', 'destroy']);
    
    // Dashboard routes
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::get('/dashboard/sales-trend', [DashboardController::class, 'salesTrend']);
});

// Public menu route
Route::get('/menu', [MenuController::class, 'index']);
Route::post('/seed-menu', [MenuController::class, 'seedMenu']);