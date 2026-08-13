<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_login_activities', function (Blueprint $table): void {
            // A user can sign in more than once on the same day.
            $table->dropUnique(['user_id', 'login_date']);
            $table->string('ip_address', 45)->nullable()->after('user_id');
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->index('last_login_at');
        });
    }

    public function down(): void
    {
        Schema::table('user_login_activities', function (Blueprint $table): void {
            $table->dropIndex(['last_login_at']);
            $table->dropColumn(['ip_address', 'user_agent']);
            $table->unique(['user_id', 'login_date']);
        });
    }
};
