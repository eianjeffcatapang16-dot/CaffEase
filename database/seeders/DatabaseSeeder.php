<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->createDefaultUsers();
    }

    private function createDefaultUsers()
    {
        // =====================================
        // ADMIN (Lumangbayan — manages ALL)
        // =====================================
        User::create([
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'full_name' => 'System Administrator',
            'role' => 'admin',
            'branch' => 'lumangbayan', // base branch, but unlimited control
            'email' => 'admin@2n1coffee.com',
            'status' => 'active'
        ]);

        // =====================================
        // MANAGER (Lumangbayan — manages ALL)
        // =====================================
        User::create([
            'username' => 'manager',
            'password' => Hash::make('manager123'),
            'full_name' => 'Lumangbayan Manager',
            'role' => 'manager',
            'branch' => 'lumangbayan', // base branch, but unlimited control
            'email' => 'manager@lumangbayan.2n1coffee.com',
            'status' => 'active'
        ]);

        // =====================================
        // CASHIER — Lumangbayan
        // =====================================
        User::create([
            'username' => 'cashier_lumangbayan',
            'password' => Hash::make('cashier123'),
            'full_name' => 'Lumangbayan Cashier',
            'role' => 'cashier',
            'branch' => 'lumangbayan',
            'email' => 'cashier@lumangbayan.2n1coffee.com',
            'status' => 'active'
        ]);

        // =====================================
        // CASHIER — Pachoca
        // =====================================
        User::create([
            'username' => 'cashier_pachoca',
            'password' => Hash::make('cashier123'),
            'full_name' => 'Pachoca Cashier',
            'role' => 'cashier',
            'branch' => 'pachoca',
            'email' => 'cashier@pachoca.2n1coffee.com',
            'status' => 'active'
        ]);
    }

    private function seedMenuItems()
    {
        $menuItems = [
            // Lumangbayan Coffee
            ['name' => 'SALTED CARAMEL', 
            'category' => 'Coffee', 
            'branch' => 'lumangbayan', 
            'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'SPANISH LATTE', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CARAMEL MACCHIATO', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'FRENCH VANILLA', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'WHITE CHOCOLATE', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CAFE MOCHA', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'HAZEL NUT', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'DIRTY MATCHA', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'STRAWBERRY ESPRESSO', 'category' => 'Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            
            // Lumangbayan Non-Coffee
            ['name' => 'MATCHA LATTE', 'category' => 'Non-Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'STRAWBERRY LATTE', 'category' => 'Non-Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'MANGO LATTE', 'category' => 'Non-Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CHOCO LATTE', 'category' => 'Non-Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'MATCHA BERRY', 'category' => 'Non-Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CHOCO BERRY', 'category' => 'Non-Coffee', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            
            // Lumangbayan MilkTea
            ['name' => 'MATCHA MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CHOCOLATE MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'WINTERMELON MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'OKINAWA MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'HOKKAIDO MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'RED VELVET MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'BLACK FOREST MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'COOKIES N CREAM MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'TARO MILKTEA', 'category' => 'MilkTea', 'branch' => 'lumangbayan', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            
            // Lumangbayan Frappe
            ['name' => 'MATCHA CREAM', 'category' => 'Frappe', 'branch' => 'lumangbayan', 'prices' => ['Regular' => 130]],
            ['name' => 'STRAWBERRY CREAM', 'category' => 'Frappe', 'branch' => 'lumangbayan', 'prices' => ['Regular' => 130]],
            ['name' => 'JAVA CHIP', 'category' => 'Frappe', 'branch' => 'lumangbayan', 'prices' => ['Regular' => 130]],
            ['name' => 'CARAMEL MACCHIATO', 'category' => 'Frappe', 'branch' => 'lumangbayan', 'prices' => ['Regular' => 130]],
            ['name' => 'SALTED CARAMEL', 'category' => 'Frappe', 'branch' => 'lumangbayan', 'prices' => ['Regular' => 130]],
            ['name' => 'HERSHEY CHOCO', 'category' => 'Frappe', 'branch' => 'lumangbayan', 'prices' => ['Regular' => 130]],
            ['name' => 'OREO CREAM', 'category' => 'Frappe', 'branch' => 'lumangbayan', 'prices' => ['Regular' => 130]],
            
            // Pachoca Coffee
            ['name' => 'SALTED CARAMEL', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'SPANISH LATTE', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CARAMEL MACCHIATO', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'FRENCH VANILLA', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'WHITE CHOCOLATE', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CAFE MOCHA', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'HAZEL NUT', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'DIRTY MATCHA', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'STRAWBERRY ESPRESSO', 'category' => 'Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            
            // Pachoca Non-Coffee
            ['name' => 'MATCHA LATTE', 'category' => 'Non-Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'STRAWBERRY LATTE', 'category' => 'Non-Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'MANGO LATTE', 'category' => 'Non-Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CHOCO LATTE', 'category' => 'Non-Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'MATCHA BERRY', 'category' => 'Non-Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CHOCO BERRY', 'category' => 'Non-Coffee', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            
            // Pachoca MilkTea
            ['name' => 'MATCHA MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'CHOCOLATE MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'WINTERMELON MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'OKINAWA MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'HOKKAIDO MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'RED VELVET MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'BLACK FOREST MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'COOKIES N CREAM MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
            ['name' => 'TARO MILKTEA', 'category' => 'MilkTea', 'branch' => 'pachoca', 'prices' => ['M' => 39, 'L' => 49, 'XL' => 69]],
        ];

        foreach ($menuItems as $item) {
            MenuItem::create([
                'name' => $item['name'],
                'description' => '',
                'category' => $item['category'],
                'branch' => $item['branch'],
                'prices' => json_encode($item['prices'])
            ]);
        }
    }
}