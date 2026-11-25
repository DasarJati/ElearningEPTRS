<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Which optional fields the player registration form shows (player name is always required).
        Schema::table('quiz_settings', function (Blueprint $table) {
            $table->boolean('collect_school')->default(true);
            $table->boolean('collect_ic')->default(false);
            $table->boolean('collect_email')->default(false);
            $table->boolean('collect_phone')->default(false);
        });

        // ic_number already exists on quiz_sessions.
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->string('email', 255)->nullable();
            $table->string('phone', 30)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->dropColumn(['email', 'phone']);
        });

        Schema::table('quiz_settings', function (Blueprint $table) {
            $table->dropColumn(['collect_school', 'collect_ic', 'collect_email', 'collect_phone']);
        });
    }
};
