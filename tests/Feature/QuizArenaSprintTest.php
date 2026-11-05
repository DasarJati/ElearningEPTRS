<?php

namespace Tests\Feature;

use App\Services\QuizArenaService;
use Illuminate\Support\Facades\Session;
use RuntimeException;
use Tests\TestCase;

class QuizArenaSprintTest extends TestCase
{
    public function test_answer_scores_bonus_and_advances_beyond_first_batch(): void
    {
        $quiz = app(QuizArenaService::class);
        $game = $quiz->start(['display_name' => 'Tester', 'school_id' => 1]);
        $game['question_started_at'] = microtime(true) - 3;
        Session::put('quiz_arena', $game);

        $answer = $quiz->answer(0, $game['questions'][0]['correctAnswer']);
        $this->assertTrue($answer['correct']);
        $this->assertSame(1070, $answer['points']);
        $this->assertSame(70, $answer['bonus_points']);
        $this->assertSame($answer, $quiz->answer(0, 0));

        for ($index = 1; $index < 5; $index++) {
            $game = $quiz->nextQuestion();
            $quiz->answer($index, $game['questions'][$index]['correctAnswer']);
        }

        $game = $quiz->nextQuestion();
        $this->assertSame(5, $game['current_index']);
        $this->assertCount(10, $game['questions']);
        $this->assertSame(5, $quiz->answeredCount($game));
        $this->assertSame(5, $quiz->score($game));
    }

    public function test_bonus_ends_after_ten_seconds_and_deadline_rejects_late_answers(): void
    {
        $quiz = app(QuizArenaService::class);
        $game = $quiz->start(['display_name' => 'Tester', 'school_id' => 1]);
        $game['question_started_at'] = microtime(true) - 11;
        Session::put('quiz_arena', $game);

        $answer = $quiz->answer(0, $game['questions'][0]['correctAnswer']);
        $this->assertSame(1000, $answer['points']);
        $this->assertSame(0, $answer['bonus_points']);

        $game = $quiz->nextQuestion();
        $game['started_at'] = microtime(true) - 121;
        Session::put('quiz_arena', $game);

        $this->assertSame(120, $quiz->elapsedSeconds($game));
        $this->assertSame(0, $quiz->remainingSeconds($game));
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Quiz time expired.');
        $quiz->answer(1, 0);
    }
}
