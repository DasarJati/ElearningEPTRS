<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_settings', function (Blueprint $table) {
            $table->id();
            $table->string('leaderboard_label', 120)->nullable();
            $table->date('leaderboard_start_date')->nullable();
            $table->date('leaderboard_end_date')->nullable();
            $table->timestamps();
        });

        // Keep the current leaderboard title and show every score until dates are set.
        DB::table('quiz_settings')->insert([
            'leaderboard_label' => 'Selangor Education Summit 2026',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_settings');
    }
};
