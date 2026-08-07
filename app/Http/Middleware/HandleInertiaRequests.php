<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Web\MenuController;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $locale = App::getLocale();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'student' => function () use ($request) {
                    if (!$request->user()) {
                        return null;
                    }

                    return Student::with(['school', 'level'])
                        ->where('user_id', $request->user()->id)
                        ->first();
                },
            ],
            'schoolSubjects' => fn () => (new MenuController())->getSchoolSubjects(),
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'locale' => $locale,
            'translations' => $this->getTranslations($locale),
            'availableLocales' => config('app.available_locales', ['en', 'ms']),
            'appName' => config('app.name'),
            'appUrl' => config('app.url'),
        ]);
    }

    /**
     * Return a flat translation map because the frontend calls t('courses').
     */
    private function getTranslations(string $locale): array
    {
        $translations = [];

        foreach (['common', 'other'] as $filename) {
            $path = lang_path("{$locale}/{$filename}.php");

            if (File::exists($path)) {
                $translations = array_replace($translations, require $path);
            }
        }

        return $translations;
    }
}
