<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use App\Models\QuizSetting;
use App\Models\School;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class QuizSettingsController extends Controller
{
    private const UNLOCK_KEY = 'quiz_settings_unlocked';

    public function show(Request $request): Response
    {
        $unlocked = (bool) $request->session()->get(self::UNLOCK_KEY, false);
        $settings = $unlocked ? QuizSetting::current() : null;
        $filters = $unlocked ? $this->playerFilters($request) : null;

        return Inertia::render('games/QuizSettings', [
            'unlocked' => $unlocked,
            'settings' => $settings ? [
                'label' => $settings->label(),
                'start_date' => $settings->leaderboard_start_date?->format('Y-m-d'),
                'end_date' => $settings->leaderboard_end_date?->format('Y-m-d'),
                'registration' => $settings->registrationFields(),
            ] : null,
            'defaultLabel' => QuizSetting::DEFAULT_LABEL,
            // Registered players are admin-only: sent only while the page is unlocked.
            'players' => $unlocked ? $this->players($filters, $settings) : null,
            'playerFilters' => $filters,
            'playerStats' => $unlocked ? $this->playerStats($settings) : null,
            'schools' => $unlocked ? School::select('id', 'name')->orderBy('name')->get() : [],
        ]);
    }

    // Delete one or more registered players (quiz arena sprint results).
    public function destroyPlayers(Request $request): RedirectResponse
    {
        abort_unless($request->session()->get(self::UNLOCK_KEY, false), 403);

        $validated = $request->validate([
            'ids' => 'required|array|min:1|max:500',
            'ids.*' => 'integer|distinct',
        ], [
            'ids.required' => 'Pilih sekurang-kurangnya satu pemain.',
        ]);

        $deleted = QuizSession::where('quiz_mode', self::MODE)->whereIn('id', $validated['ids'])->delete();

        return back()->with('success', "{$deleted} pemain dipadam.");
    }

    private const MODE = 'sprint';
    private const SORTS = ['latest', 'oldest', 'points', 'name'];
    private const PER_PAGE = [10, 25, 50, 100];

    private function playerFilters(Request $request): array
    {
        $date = fn ($value) => is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? $value : '';

        return [
            'search' => mb_substr(trim((string) $request->query('search', '')), 0, 100),
            'school' => ctype_digit((string) $request->query('school', '')) ? (int) $request->query('school') : '',
            'from' => $date($request->query('from')),
            'to' => $date($request->query('to')),
            'event' => $request->query('event', '1') !== '0',
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : 'latest',
            'per_page' => in_array((int) $request->query('per_page'), self::PER_PAGE, true) ? (int) $request->query('per_page') : 25,
        ];
    }

    private function players(array $filters, QuizSetting $settings): array
    {
        $query = QuizSession::query()->where('quiz_mode', self::MODE)->with('school:id,name');

        if ($filters['event']) {
            $settings->applyDateRange($query);
        }

        if ($filters['search'] !== '') {
            $term = '%' . addcslashes($filters['search'], '%_\\') . '%';
            $query->where(fn ($q) => $q->where('display_name', 'like', $term)
                ->orWhere('email', 'like', $term)
                ->orWhere('phone', 'like', $term)
                ->orWhere('ic_number', 'like', $term));
        }

        if ($filters['school'] !== '') {
            $query->where('school_id', $filters['school']);
        }
        if ($filters['from'] !== '') {
            $query->whereDate('created_at', '>=', $filters['from']);
        }
        if ($filters['to'] !== '') {
            $query->whereDate('created_at', '<=', $filters['to']);
        }

        match ($filters['sort']) {
            'oldest' => $query->orderBy('created_at')->orderBy('id'),
            'points' => $query->orderByDesc('total_points')->orderByDesc('total_correct')->orderBy('total_time_seconds'),
            'name' => $query->orderBy('display_name'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };

        return $query->paginate($filters['per_page'])
            ->withQueryString()
            ->through(fn (QuizSession $s) => [
                'id' => $s->id,
                'name' => $s->display_name,
                'school' => $s->school?->name,
                'email' => $s->email,
                'phone' => $s->phone,
                // Show only the last 4 IC digits in the admin list.
                'ic' => $s->ic_number ? str_repeat('•', max(0, strlen($s->ic_number) - 4)) . substr($s->ic_number, -4) : null,
                'points' => $s->total_points,
                'correct' => $s->total_correct,
                'answered' => $s->total_answered,
                'time' => $s->total_time_seconds,
                'played_at' => $s->created_at?->format('Y-m-d H:i'),
            ])
            ->toArray();
    }

    private function playerStats(QuizSetting $settings): array
    {
        $base = fn () => QuizSession::query()->where('quiz_mode', self::MODE);

        return [
            'all' => $base()->count(),
            'event' => $settings->applyDateRange($base())->count(),
            'today' => $base()->whereDate('created_at', today())->count(),
        ];
    }

    public function unlock(Request $request): RedirectResponse
    {
        $validated = $request->validate(['password' => 'required|string|max:100']);

        $password = (string) config('quiz.settings_password');

        if ($password === '' || !hash_equals($password, $validated['password'])) {
            throw ValidationException::withMessages(['password' => 'Kata laluan admin salah.']);
        }

        $request->session()->regenerate();
        $request->session()->put(self::UNLOCK_KEY, true);

        return redirect()->route('quiz.settings');
    }

    public function lock(Request $request): RedirectResponse
    {
        $request->session()->forget(self::UNLOCK_KEY);

        return redirect()->route('quiz.settings');
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->session()->get(self::UNLOCK_KEY, false), 403);

        $validated = $request->validate([
            'label' => 'required|string|max:120',
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'registration' => 'required|array',
            'registration.school' => 'required|boolean',
            'registration.ic' => 'required|boolean',
            'registration.email' => 'required|boolean',
            'registration.phone' => 'required|boolean',
        ], [
            'label.required' => 'Label leaderboard wajib diisi.',
            'start_date.date_format' => 'Tarikh mula tidak sah.',
            'end_date.date_format' => 'Tarikh tamat tidak sah.',
            'end_date.after_or_equal' => 'Tarikh tamat mesti sama atau selepas tarikh mula.',
        ]);

        QuizSetting::current()->update([
            'leaderboard_label' => trim($validated['label']),
            'leaderboard_start_date' => $validated['start_date'] ?? null,
            'leaderboard_end_date' => $validated['end_date'] ?? null,
            'collect_school' => $validated['registration']['school'],
            'collect_ic' => $validated['registration']['ic'],
            'collect_email' => $validated['registration']['email'],
            'collect_phone' => $validated['registration']['phone'],
        ]);

        return redirect()->route('quiz.settings')->with('success', 'Tetapan kuiz disimpan.');
    }
}
