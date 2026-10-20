<?php

namespace Tests\Feature;

use App\Http\Controllers\Web\ReportController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use Tests\TestCase;

class ReportProgressTest extends TestCase
{
    public function test_report_groups_sessions_under_subtopics_and_filters_user_and_date(): void
    {
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('topic_id');
            $table->unsignedBigInteger('subtopic_id')->nullable();
            $table->unsignedTinyInteger('question_type_id');
            $table->unsignedTinyInteger('score');
            $table->unsignedTinyInteger('total_correct');
            $table->unsignedTinyInteger('total_skipped');
            $table->timestamp('created_at');
        });

        $session = fn (int $userId, int $score, $createdAt) => [
            'user_id' => $userId,
            'topic_id' => 1,
            'subtopic_id' => 2,
            'question_type_id' => 1,
            'score' => $score,
            'total_correct' => 5,
            'total_skipped' => 0,
            'created_at' => $createdAt,
        ];

        DB::table('practice_session')->insert([
            $session(10, 80, now()->subDays(2)),
            $session(10, 100, now()),
            $session(10, 40, now()->subDays(50)),
            $session(20, 0, now()),
        ]);

        Auth::shouldReceive('id')->andReturn(10);
        $method = new \ReflectionMethod(ReportController::class, 'batchCalculateTopicProgress');
        $controller = new ReportController();

        $recent = $method->invoke($controller, [1, 2], 1, 'Last 7 Days');
        $this->assertSame(0, $recent[1]['total_sessions']);
        $this->assertSame(2, (int) $recent[2]['total_sessions']);
        $this->assertSame(90.0, $recent[2]['average_score']);

        $allTime = $method->invoke($controller, [1, 2], 1, 'All Time');
        $this->assertSame(3, (int) $allTime[2]['total_sessions']);
        $this->assertSame(73.3, $allTime[2]['average_score']);
    }

    public function test_subtopic_details_use_actual_question_count_and_selected_period(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('topic_id');
            $table->unsignedBigInteger('subtopic_id')->nullable();
            $table->unsignedTinyInteger('question_type_id');
            $table->unsignedTinyInteger('total_correct');
            $table->unsignedTinyInteger('total_skipped');
            $table->unsignedInteger('total_time_seconds');
            $table->timestamp('created_at');
        });
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('question_id');
        });

        DB::table('topics')->insert(['id' => 2, 'name' => 'Subtopic']);
        DB::table('practice_session')->insert([
            ['id' => 1, 'user_id' => 10, 'topic_id' => 1, 'subtopic_id' => 2, 'question_type_id' => 1, 'total_correct' => 1, 'total_skipped' => 1, 'total_time_seconds' => 90, 'created_at' => now()],
            ['id' => 2, 'user_id' => 10, 'topic_id' => 1, 'subtopic_id' => 2, 'question_type_id' => 1, 'total_correct' => 2, 'total_skipped' => 0, 'total_time_seconds' => 60, 'created_at' => now()->subDays(40)],
            ['id' => 3, 'user_id' => 20, 'topic_id' => 1, 'subtopic_id' => 2, 'question_type_id' => 1, 'total_correct' => 3, 'total_skipped' => 0, 'total_time_seconds' => 60, 'created_at' => now()],
        ]);
        DB::table('quiz_attempts')->insert([
            ['session_id' => 1, 'question_id' => 11],
            ['session_id' => 1, 'question_id' => 12],
            ['session_id' => 1, 'question_id' => 13],
            ['session_id' => 1, 'question_id' => 13],
        ]);

        Auth::shouldReceive('id')->andReturn(10);
        $response = (new ReportController())->getSubtopicDetails(2, Request::create('/subtopic-details', 'GET', [
            'questionType' => 'Objective',
            'time_range' => 'Last 7 Days',
        ]));
        $data = $response->getData(true);

        $this->assertSame(1, $data['total_sessions']);
        $this->assertSame(3, $data['sessions'][0]['total_questions']);
        $this->assertSame(1, $data['sessions'][0]['total_wrong']);
        $this->assertSame(1, $data['sessions'][0]['total_skipped']);
    }
}
