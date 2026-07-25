<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_login_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->date('login_date');
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'login_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_login_activities');
    }
};
