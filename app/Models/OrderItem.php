<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_name',
        'size',
        'base_price',
        'addons',
        'addons_total',
        'quantity',
        'total_price'
    ];

    protected $casts = [
        'addons' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}