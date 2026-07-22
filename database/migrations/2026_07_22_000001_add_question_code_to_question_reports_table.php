<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('question_reports', 'question_code')) {
            Schema::table('question_reports', function (Blueprint $table) {
                $table->string('question_code', 100)
                    ->nullable()
                    ->index()
                    ->after('question_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('question_reports', 'question_code')) {
            Schema::table('question_reports', function (Blueprint $table) {
                $table->dropIndex(['question_code']);
                $table->dropColumn('question_code');
            });
        }
    }
};
