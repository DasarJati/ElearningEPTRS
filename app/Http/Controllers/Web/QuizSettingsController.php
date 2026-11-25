<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\QuizSetting;
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

        return Inertia::render('games/QuizSettings', [
            'unlocked' => $unlocked,
            'settings' => $settings ? [
                'label' => $settings->label(),
                'start_date' => $settings->leaderboard_start_date?->format('Y-m-d'),
                'end_date' => $settings->leaderboard_end_date?->format('Y-m-d'),
                'registration' => $settings->registrationFields(),
            ] : null,
            'defaultLabel' => QuizSetting::DEFAULT_LABEL,
        ]);
    }

    // Same admin password that confirms prize winners.
    public function unlock(Request $request): RedirectResponse
    {
        $validated = $request->validate(['password' => 'required|string|max:100']);

        if (!hash_equals((string) config('quiz.prize_password'), $validated['password'])) {
            throw ValidationException::withMessages(['password' => 'Kata laluan admin salah.']);
        }

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
