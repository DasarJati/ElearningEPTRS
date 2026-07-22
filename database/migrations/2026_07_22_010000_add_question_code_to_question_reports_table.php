<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_reports', function (Blueprint $table) {
            $table->string('question_code', 100)
                ->nullable()
                ->after('question_id')
                ->index();
        });

        // Populate the code for reports submitted before this column existed.
        DB::table('question_reports')
            ->whereNull('question_code')
            ->orderBy('id')
            ->chunkById(200, function ($reports) {
                $codes = DB::table('questions')
                    ->whereIn('id', $reports->pluck('question_id')->unique())
                    ->pluck('question_code', 'id');

                foreach ($reports as $report) {
                    if ($codes->has($report->question_id)) {
                        DB::table('question_reports')
                            ->where('id', $report->id)
                            ->update(['question_code' => $codes[$report->question_id]]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('question_reports', function (Blueprint $table) {
            $table->dropIndex(['question_code']);
            $table->dropColumn('question_code');
        });
    }
};
