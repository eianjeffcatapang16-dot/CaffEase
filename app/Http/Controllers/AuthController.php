<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
            'role' => 'required|in:admin,manager,cashier',
            'branch' => 'nullable|string'
        ]);

        $username = $request->username;
        $role = $request->role;
        $branch = $request->branch;

        // Find user by username + role
        $user = User::where('username', $username)
                    ->where('role', $role)
                    ->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // PLAINTEXT PASSWORD CHECK
        if ($request->password !== $user->password) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Branch validation
        if ($branch) {
            // Cashier/Admin must match branch
            if ($user->branch !== $branch) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid credentials for this branch'
                ], 401);
            }
        }

        // Status check
        if ($user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Account is not active'
            ], 403);
        }

        // Log in user
        Auth::login($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id'        => $user->id,
                'username'  => $user->username,
                'full_name' => $user->full_name,
                'role'      => $user->role,
                'branch'    => $user->branch,
                'email'     => $user->email,
                'status'    => $user->status
            ]
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        session()->flush();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }

    public function checkAuth()
    {
        if (Auth::check()) {
            return response()->json([
                'authenticated' => true,
                'user' => Auth::user()
            ]);
        }

        return response()->json([
            'authenticated' => false,
            'user' => null
        ]);
    }
}
