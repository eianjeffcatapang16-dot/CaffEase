<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function statistics(Request $request)
    {
        $user = Auth::user();

        // =========================
        // BASE QUERIES
        // =========================
        $ordersQuery = Order::query();
        $usersQuery  = User::query();

        // =========================
        // ROLE RULES
        // =========================
        if ($user->role === 'cashier') {
            return response()->json([
                'total_revenue' => 0,
                'total_orders'  => 0,
                'active_staff'  => 0,
                'top_products'  => []
            ]);
        }

        // ADMIN → own branch only
        if ($user->role === 'admin') {
            $ordersQuery->where('branch', $user->branch);
            $usersQuery->where('branch', $user->branch);
        }

        // MANAGER → branch filter
        if ($user->role === 'manager' && $request->filled('branch')) {
            $ordersQuery->where('branch', $request->branch);
            $usersQuery->where('branch', $request->branch);
        }

        // =========================
        // CARDS
        // =========================
        $totalRevenue = $ordersQuery->sum('total_amount');
        $totalOrders  = $ordersQuery->count();
        $activeStaff  = $usersQuery->where('status', 'active')->count();

        // =========================
        // 🔥 TOP 5 SELLING PRODUCTS
        // =========================
        $topProducts = OrderItem::select(
                'product_name',
                DB::raw('SUM(quantity) as total_sold')
            )
            ->whereIn('order_id', $ordersQuery->pluck('id'))
            ->groupBy('product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'total_orders'  => $totalOrders,
            'active_staff'  => $activeStaff,
            'top_products'  => $topProducts
        ]);
    }
}
