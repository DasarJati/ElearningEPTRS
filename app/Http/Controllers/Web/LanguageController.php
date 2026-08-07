<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rule;

class LanguageController extends Controller
{
    public function change(Request $request)
    {
        $availableLocales = config('app.available_locales', ['en', 'ms']);
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in($availableLocales)],
        ]);
        $locale = $validated['locale'];

        Session::put('locale', $locale);
        App::setLocale($locale);

        $user = Auth::user();
        if ($user && $user->language !== $locale) {
            $user->update(['language' => $locale]);
        }

        if ($request->expectsJson()) {
            $translations = trans('common', [], $locale);

            return response()->json([
                'locale' => $locale,
                'translations' => is_array($translations) ? $translations : [],
                'availableLocales' => $availableLocales,
            ]);
        }

        return back()->with('success', 'Language changed successfully');
    }
}
