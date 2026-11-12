<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->string('category');

            $table->integer('current_stock')->default(0);

            // NEW COLUMN → minimum stock warning level
            $table->integer('min_stock')->default(0);

            $table->string('unit');
            $table->date('expiration_date')->nullable();

            // status will be auto-updated based on current_stock vs min_stock
            $table->enum('status', ['low', 'ok'])->default('ok');

            $table->string('branch'); // lumangbayan / pachoca
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory');
    }
};
