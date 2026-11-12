<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'branch',
        'total_amount',
        'payment_method',
        'status',
        'cash_amount',
        'change_amount',
        'mobile_provider',
        'mobile_number',
        'reference_number',
        'user_id',
        'voided_by',
        'voided_at'
    ];
    

    // ===============================
    // RELATIONSHIPS
    // ===============================

    // Cashier who processed the order
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Order line items
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ===============================
    // AUTO-GENERATE UNIQUE ORDER NUMBER
    // ===============================
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            do {
                $order->order_number =
                    'ORD' .
                    now()->format('YmdHis') . // YYYYMMDDHHMMSS
                    rand(100, 999);          // random suffix
            } while (
                self::where('order_number', $order->order_number)->exists()
            );
        });
    }
}
