<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'username',
        'full_name',
        'email',
        'password',   // plaintext allowed
        'role',
        'branch',
        'status'
    ];

    /**
     * Do NOT hide password
     */
    protected $hidden = [
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // ------------------------------
    // ROLE HELPERS
    // ------------------------------
    public function isAdmin(): bool
    {
        return strtolower($this->role) === 'admin';
    }

    public function isManager(): bool
    {
        return strtolower($this->role) === 'manager';
    }

    public function isCashier(): bool
    {
        return strtolower($this->role) === 'cashier';
    }

    // ------------------------------
    // RELATIONS
    // ------------------------------
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
