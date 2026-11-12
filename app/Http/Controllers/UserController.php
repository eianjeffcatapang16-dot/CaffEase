<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    // ======================================
    // LIST USERS (Manager & Admin)
    // ======================================
    public function index(Request $request)
    {
        $user = Auth::user();

        // Manager OR Admin can view user list
        if (!($user->isManager() || $user->isAdmin())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = User::query();

        // ===========================
        // ROLE-BASED FILTERING
        // ===========================

        if ($user->isManager()) {

            // Manager sees ALL users from ALL branches
            // no restriction applied

        } elseif ($user->isAdmin()) {

            // Admin sees ONLY their own branch
            $query->where('branch', $user->branch);
        }

        // ===========================
        // SEARCH FILTER
        // ===========================
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // ===========================
        // SORTING
        // ===========================
        $users = $query
            ->orderByRaw("FIELD(role, 'admin', 'manager', 'cashier')")
            ->orderBy('branch', 'asc')
            ->orderBy('full_name', 'asc')
            ->get();

        return response()->json($users);
    }

    // ======================================
    // CREATE USER (ONLY MANAGER)
    // ======================================
    public function store(Request $request)
    {
        $user = Auth::user();

        // Manager ONLY
        if (!$user->isManager()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'username'  => 'required|string|max:50|unique:users',
            'password'  => 'required|string|min:3',
            'full_name' => 'required|string|max:100',
            'email'     => 'required|email|unique:users',
            'role'      => 'required|in:admin,manager,cashier',
            'status'    => 'required|in:active,inactive',
            'branch'    => 'required|in:lumangbayan,pachoca'
        ]);

        $newUser = User::create([
            'username'  => $request->username,
            'password'  => $request->password, // plaintext as required
            'full_name' => $request->full_name,
            'email'     => $request->email,
            'role'      => $request->role,
            'branch'    => $request->branch,
            'status'    => $request->status
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => $newUser
        ]);
    }

    // ======================================
    // UPDATE USER (Manager & Admin)
    // ======================================
    public function update(Request $request, $id)
    {
        $currentUser = Auth::user();

        // Only manager OR admin can edit
        if (!($currentUser->isManager() || $currentUser->isAdmin())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $target = User::findOrFail($id);

        // Admin CANNOT edit users from another branch
        if ($currentUser->isAdmin() && $currentUser->branch !== $target->branch) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Validation
        $request->validate([
            'username'  => 'required|string|max:50|unique:users,username,' . $id,
            'full_name' => 'required|string|max:100',
            'email'     => 'required|email|unique:users,email,' . $id,
            'role'      => 'required|in:admin,manager,cashier',
            'branch'    => 'required|in:lumangbayan,pachoca',
            'status'    => 'required|in:active,inactive'
        ]);

        // Update fields
        $target->username = $request->username;
        $target->full_name = $request->full_name;
        $target->email = $request->email;
        $target->role = $request->role;
        $target->branch = $request->branch;
        $target->status = $request->status;

        // Optional: Update password if given
        if ($request->filled('password')) {
            $target->password = $request->password; // plaintext
        }

        $target->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'data' => $target
        ]);
    }

    // ======================================
    // DELETE USER (Manager & Admin)
    // ======================================
    public function destroy($id)
    {
        $currentUser = Auth::user();
        $target = User::findOrFail($id);

        // Only manager OR admin can delete
        if (!($currentUser->isManager() || $currentUser->isAdmin())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Admin cannot delete other branch users
        if ($currentUser->isAdmin() && $currentUser->branch !== $target->branch) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Cannot delete yourself
        if ($currentUser->id === $target->id) {
            return response()->json(['error' => 'You cannot delete your own account'], 403);
        }

        $target->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ]);
    }
}
