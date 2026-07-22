<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('question_id')->index();
            $table->string('question_code', 100)->nullable()->index();
            $table->unsignedBigInteger('subject_id')->nullable()->index();
            $table->unsignedBigInteger('topic_id')->nullable()->index();
            $table->string('report_type', 40);
            $table->text('details')->nullable();
            $table->string('context', 60)->nullable();
            $table->text('page_url')->nullable();
            $table->string('status', 20)->default('open')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['question_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_reports');
    }
};
