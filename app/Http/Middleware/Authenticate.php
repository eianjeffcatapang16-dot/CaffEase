<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // If it's an API or AJAX request → return JSON instead of redirecting
        if ($request->expectsJson()) {
            abort(response()->json([
                'status' => 'unauthenticated',
                'message' => 'User is not logged in'
            ], 401));
        }

        // For normal browser navigation (non-AJAX), return the SPA entry route
        // This prevents the "Route [login] not defined" error.
        return '/';
    }
}
