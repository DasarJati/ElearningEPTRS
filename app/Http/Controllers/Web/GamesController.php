<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use App\Models\School;
use App\Services\QuizArenaService;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use RuntimeException;

class GamesController extends Controller
{
    private const NAME_TAKEN_MESSAGE = 'Nama pemain ini sudah digunakan. Sila guna nama lain.';

    public function __construct(private QuizArenaService $quiz)
    {
    }

    public function index()
    {
        $game = $this->quiz->current();

        return Inertia::render('games/QuizLeaderboard', [
            'title' => 'Quiz Section',
            'schools' => School::select('id', 'name')->orderBy('name')->get(),
            'leaderboard' => $this->leaderboard(),
            'totalPlayers' => QuizSession::count(),
            'activeQuiz' => $game ? $this->quiz->publicState($game) : null,
        ]);
    }

    public function startQuiz(Request $request): JsonResponse
    {
        $request->merge(['display_name' => $this->normalizeName($request->input('display_name'))]);

        $validated = $request->validate([
            'display_name' => 'required|string|max:200',
            'school_id' => 'required|exists:school,id',
        ]);

        if ($this->nameTaken($validated['display_name'])) {
            throw ValidationException::withMessages(['display_name' => self::NAME_TAKEN_MESSAGE]);
        }

        // Re-submitting with the same player name resumes the running game.
        $game = $this->quiz->current();
        if (!$game || mb_strtolower($game['player']['display_name']) !== mb_strtolower($validated['display_name'])) {
            $game = $this->quiz->start($validated);
        }

        return response()->json(['quiz' => $this->quiz->publicState($game)]);
    }

    public function answerQuestion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'index' => 'required|integer|min:0|max:' . (QuizArenaService::QUESTION_COUNT - 1),
            'option' => 'required|integer|min:0',
        ]);

        try {
            $answer = $this->quiz->answer($validated['index'], $validated['option']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => 'Sesi kuiz tidak dijumpai. Sila mulakan semula.'], 409);
        }

        return response()->json(['answer' => $answer]);
    }

    public function storeQuizResult(): JsonResponse
    {
        $game = $this->quiz->current();

        if (!$game) {
            return response()->json(['message' => 'Sesi kuiz tidak dijumpai. Sila mulakan semula.'], 409);
        }

        $player = $game['player'];
        $score = $this->quiz->score($game);
        $time = $this->quiz->elapsedSeconds($game);

        // Lock so two players finishing with the same name at once cannot both be saved.
        try {
            $session = Cache::lock('quiz_arena.save_result', 10)->block(5, function () use ($player, $score, $time) {
                if ($this->nameTaken($player['display_name'])) {
                    return null;
                }

                return QuizSession::create([
                    'display_name' => $player['display_name'],
                    'school_id' => $player['school_id'],
                    'total_correct' => $score,
                    'total_time_seconds' => $time,
                ]);
            });
        } catch (LockTimeoutException $e) {
            return response()->json(['message' => 'Server sibuk. Sila tekan Finish Quiz sekali lagi.'], 503);
        }

        if (!$session) {
            $this->quiz->forget();

            return response()->json(['message' => self::NAME_TAKEN_MESSAGE], 422);
        }

        $this->quiz->forget();

        return response()->json([
            'result' => [
                'id' => $session->id,
                'correct' => $session->total_correct,
                'total' => QuizArenaService::QUESTION_COUNT,
                'time' => $session->total_time_seconds,
                'rank' => $this->rankOf($session),
                'total_players' => QuizSession::count(),
            ],
        ]);
    }

    private function leaderboard()
    {
        return QuizSession::with('school:id,name')
            ->select('id', 'display_name', 'school_id', 'total_correct', 'total_time_seconds')
            ->orderByDesc('total_correct')
            ->orderBy('total_time_seconds')
            ->orderBy('id')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'nickname' => $s->display_name,
                'school' => $s->school?->name ?? 'Unknown School',
                'correct' => $s->total_correct,
                'time' => $s->total_time_seconds,
            ]);
    }

    // Same ordering as the leaderboard: score desc, time asc, earliest first.
    private function rankOf(QuizSession $session): int
    {
        return QuizSession::where('total_correct', '>', $session->total_correct)
            ->orWhere(fn ($q) => $q->where('total_correct', $session->total_correct)
                ->where('total_time_seconds', '<', $session->total_time_seconds))
            ->orWhere(fn ($q) => $q->where('total_correct', $session->total_correct)
                ->where('total_time_seconds', $session->total_time_seconds)
                ->where('id', '<', $session->id))
            ->count() + 1;
    }

    // Case-insensitive via the column collation; TRIM covers older rows saved with spaces.
    private function nameTaken(string $displayName): bool
    {
        return QuizSession::whereRaw('TRIM(display_name) = ?', [$displayName])->exists();
    }

    private function normalizeName(?string $displayName): string
    {
        return trim(preg_replace('/\s+/u', ' ', (string) $displayName));
    }
}
