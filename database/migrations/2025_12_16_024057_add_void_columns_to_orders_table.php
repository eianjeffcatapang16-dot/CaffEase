<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {

            if (!Schema::hasColumn('orders', 'voided_by')) {
                $table->unsignedBigInteger('voided_by')->nullable()->after('status');
            }

            if (!Schema::hasColumn('orders', 'voided_at')) {
                $table->timestamp('voided_at')->nullable()->after('voided_by');
            }
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'voided_by')) {
                $table->dropColumn('voided_by');
            }

            if (Schema::hasColumn('orders', 'voided_at')) {
                $table->dropColumn('voided_at');
            }
        });
    }
};

