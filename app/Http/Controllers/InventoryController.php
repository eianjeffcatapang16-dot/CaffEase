<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && !$user->isManager()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Inventory::where('branch', $user->branch);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('item_name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }
        
        $inventory = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($inventory);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && !$user->isManager()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'item_name' => 'required|string|max:100',
            'category' => 'required|string|max:50',
            'current_stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:20',
            'expiration_date' => 'nullable|date'
        ]);

        $inventory = Inventory::create([
            'item_name' => $request->item_name,
            'category' => $request->category,
            'current_stock' => $request->current_stock,
            'unit' => $request->unit,
            'expiration_date' => $request->expiration_date,
            'status' => $request->current_stock < 10 ? 'low' : 'ok',
            'branch' => $user->branch
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Inventory item added successfully',
            'data' => $inventory
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $inventory = Inventory::findOrFail($id);
        
        // Check if inventory belongs to user's branch
        if ($inventory->branch !== $user->branch) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $inventory->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Inventory item deleted successfully'
        ]);
    }
}