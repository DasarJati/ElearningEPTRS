<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use RuntimeException;

/**
 * Server-side Quiz Arena game state.
 *
 * Questions are picked, answers checked and time measured on the server, so the
 * browser never sees the correct answers and cannot submit its own score.
 * The active game lives in the user's session so a page refresh resumes it.
 */
class QuizArenaService
{
    public const QUESTION_COUNT = 5;

    private const SESSION_KEY = 'quiz_arena';
    private const TOPIC_ROTATION_CACHE_KEY = 'quiz_arena.general_topic_index';
    private const SESSION_DIFFICULTIES = ['easy', 'easy', 'medium', 'medium', 'hard'];

    // Every game has Matematik, Sains and Kemahiran Hidup; the other two slots
    // rotate through the general-knowledge topics.
    private const GENERAL_TOPIC_ROTATION = [
        ['Haiwan', 'Planet'],
        ['Tokoh Malaysia', 'Perdana Menteri Malaysia'],
        ['Tubuh Manusia', 'Haiwan'],
        ['Planet', 'Tokoh Malaysia'],
        ['Perdana Menteri Malaysia', 'Tubuh Manusia'],
    ];

    private ?array $bank = null;

    public function current(): ?array
    {
        return Session::get(self::SESSION_KEY);
    }

    public function start(array $player): array
    {
        $game = [
            'player' => $player,
            'questions' => $this->pickQuestions(),
            'answers' => array_fill(0, self::QUESTION_COUNT, null),
            'started_at' => microtime(true),
        ];

        Session::put(self::SESSION_KEY, $game);

        return $game;
    }

    /**
     * Record the player's first answer for a question. Later attempts on the
     * same question return the stored result unchanged.
     */
    public function answer(int $index, int $option): array
    {
        $game = $this->current();

        if (!$game || !isset($game['questions'][$index])) {
            throw new RuntimeException('No active quiz question.');
        }

        if ($game['answers'][$index] === null) {
            $question = $game['questions'][$index];

            if (!isset($question['options'][$option])) {
                throw new RuntimeException('Invalid option.');
            }

            $game['answers'][$index] = [
                'selected' => $option,
                'correct' => $option === $question['correctAnswer'],
            ];

            Session::put(self::SESSION_KEY, $game);
        }

        return $this->publicAnswer($game, $index);
    }

    public function forget(): void
    {
        Session::forget(self::SESSION_KEY);
    }

    public function score(array $game): int
    {
        return collect($game['answers'])->where('correct', true)->count();
    }

    public function elapsedSeconds(array $game): int
    {
        return max(0, (int) floor(microtime(true) - $game['started_at']));
    }

    /**
     * Game state safe to send to the browser: correct answers and explanations
     * are only included for questions the player has already answered.
     */
    public function publicState(array $game): array
    {
        return [
            'player' => [
                'display_name' => $game['player']['display_name'],
                'school_id' => $game['player']['school_id'],
            ],
            'questions' => collect($game['questions'])->map(fn ($q) => [
                'question' => $q['question'],
                'options' => $q['options'],
                'category' => $q['category'],
                'difficulty' => $q['difficulty'],
            ])->all(),
            'answers' => collect(array_keys($game['answers']))
                ->map(fn ($index) => $this->publicAnswer($game, $index))
                ->all(),
            'elapsed_seconds' => $this->elapsedSeconds($game),
        ];
    }

    private function publicAnswer(array $game, int $index): ?array
    {
        $answer = $game['answers'][$index];

        if ($answer === null) {
            return null;
        }

        $question = $game['questions'][$index];

        return [
            'selected' => $answer['selected'],
            'correct' => $answer['correct'],
            'correct_answer' => $question['correctAnswer'],
            'explanation' => $question['explanation'],
        ];
    }

    private function pickQuestions(): array
    {
        $bank = $this->bank();
        [$firstTopic, $secondTopic] = $this->nextGeneralTopics();

        $pools = [
            $bank['pools']['mathematic'],
            $bank['pools']['science'],
            $bank['pools']['kemahiran_hidup'],
            $bank['general'][$firstTopic],
            $bank['general'][$secondTopic],
        ];

        $difficulties = self::SESSION_DIFFICULTIES;
        shuffle($difficulties);

        $questions = [];
        foreach ($pools as $i => $pool) {
            $candidates = array_values(array_filter($pool, fn ($q) => $q['difficulty'] === $difficulties[$i])) ?: $pool;
            $questions[] = $this->shuffleOptions($candidates[array_rand($candidates)]);
        }

        shuffle($questions);

        return $questions;
    }

    private function shuffleOptions(array $question): array
    {
        $correctText = $question['options'][$question['correctAnswer']];
        $options = $question['options'];
        shuffle($options);

        $question['options'] = $options;
        $question['correctAnswer'] = array_search($correctText, $options, true);

        return $question;
    }

    private function nextGeneralTopics(): array
    {
        $counter = (int) Cache::increment(self::TOPIC_ROTATION_CACHE_KEY);

        return self::GENERAL_TOPIC_ROTATION[max(0, $counter - 1) % count(self::GENERAL_TOPIC_ROTATION)];
    }

    private function bank(): array
    {
        if ($this->bank === null) {
            $path = resource_path('data/quiz_bank.json');
            $bank = is_file($path) ? json_decode(file_get_contents($path), true) : null;

            if (!is_array($bank)) {
                throw new RuntimeException('Quiz bank missing. Run: npm run quiz:export');
            }

            $this->bank = $bank;
        }

        return $this->bank;
    }
}
