<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'item_name',
        'category',
        'current_stock',
        'unit',
        'expiration_date',
        'status',
        'branch'
    ];

    protected $casts = [
        'expiration_date' => 'date',
    ];

    public function updateStatus()
    {
        $this->status = $this->current_stock < 10 ? 'low' : 'ok';
        $this->save();
    }
}