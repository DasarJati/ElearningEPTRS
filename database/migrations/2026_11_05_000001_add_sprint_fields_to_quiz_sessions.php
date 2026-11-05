<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->string('quiz_mode', 20)->nullable();
            $table->unsignedInteger('total_answered')->default(0);
            $table->unsignedInteger('total_points')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->dropColumn(['quiz_mode', 'total_answered', 'total_points']);
        });
    }
};
