<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    // =====================================
    // ORDER LIST
    // =====================================
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Order::with(['user', 'items']);

        // CASHIER → own branch only
        if ($user->role === 'cashier') {
            $query->where('branch', $user->branch);
        }

        // ADMIN → own branch only
        elseif ($user->role === 'admin') {
            $query->where('branch', $user->branch);
        }

        // MANAGER → can filter branch
        elseif ($user->role === 'manager') {
            if ($request->filled('branch') && $request->branch !== 'all') {
                $query->where('branch', $request->branch);
            }
        }

        // SEARCH
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('username', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(50)
        );
    }

    // =====================================
    // VOID ORDER (MANAGER ONLY)
    // =====================================
    public function void($id)
    {
        $user = Auth::user();

        if ($user->role !== 'manager') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $order = Order::findOrFail($id);

        if ($order->status === 'voided') {
            return response()->json([
                'status' => 'error',
                'message' => 'Order already voided'
            ], 400);
        }

        $order->update([
            'status'    => 'voided',
            'voided_by' => $user->id,
            'voided_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Order successfully voided'
        ]);
    }

    // =====================================
    // CREATE ORDER
    // =====================================
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'total_amount'     => 'required|numeric|min:0',
            'payment_method'   => 'required|in:cash,mobile',
            'cash_amount'      => 'nullable|required_if:payment_method,cash|numeric|min:' . $request->total_amount,
            'change_amount'    => 'nullable|numeric|min:0',
            'mobile_provider'  => 'nullable|required_if:payment_method,mobile|string',
            'mobile_number'    => 'nullable|string',
            'reference_number' => 'nullable|required_if:payment_method,mobile|string',
            'items'            => 'required|array|min:1'
        ]);

        DB::beginTransaction();

        try {
            $order = Order::create([
                'branch'           => $user->branch,
                'total_amount'     => $request->total_amount,
                'payment_method'   => $request->payment_method,
                'cash_amount'      => $request->cash_amount,
                'change_amount'    => $request->change_amount,
                'mobile_provider'  => $request->mobile_provider,
                'mobile_number'    => $request->mobile_number,
                'reference_number' => $request->reference_number,
                'user_id'          => $user->id,
                'status'           => 'completed',
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id'    => $order->id,
                    'product_name'=> $item['name'],
                    'size'        => $item['size'] ?? null,
                    'base_price'  => $item['basePrice'],
                    'addons'      => $item['addons'] ?? [],
                    'addons_total'=> $item['addonsTotal'] ?? 0,
                    'quantity'    => $item['quantity'],
                    'total_price' => $item['totalPrice'],
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message'=> 'Order saved successfully',
                'data'   => $order->load('items', 'user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message'=> $e->getMessage()
            ], 500);
        }
    }
}
