<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;

class MenuController extends Controller
{
    public function index()
    {
        // PREPARE EXPECTED STRUCTURE
        $menuData = [
            'lumangbayan' => [],
            'pachoca' => []
        ];

        // FETCH ALL ITEMS
        $items = MenuItem::all();

        foreach ($items as $item) {

            // Ensure category exists
            if (!isset($menuData[$item->branch][$item->category])) {
                $menuData[$item->branch][$item->category] = [];
            }

            // Add item
            $menuData[$item->branch][$item->category][] = [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'prices' => json_decode($item->prices, true) // FIX ✔
            ];
        }

        return response()->json($menuData);
    }
}
