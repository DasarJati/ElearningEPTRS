<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->routeIs('logout') || $request->is('logout')) {
            return $next($request);
        }

        $availableLocales = config('app.available_locales', ['en', 'ms']);

        if (Auth::check()) {
            $userLocale = Auth::user()->language;
            $locale = in_array($userLocale, $availableLocales, true)
                ? $userLocale
                : config('app.locale', 'en');
        } else {
            $locale = Session::get('locale', config('app.locale', 'en'));
        }

        if (!in_array($locale, $availableLocales, true)) {
            $locale = config('app.locale', 'en');
        }

        Session::put('locale', $locale);
        App::setLocale($locale);

        return $next($request);
    }
}
