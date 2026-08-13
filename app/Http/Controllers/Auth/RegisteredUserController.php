<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\School;
use App\Models\User;
use App\Models\UserLocation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'schools' => School::query()
                ->select('id', 'name')
                ->whereNotNull('name')
                ->where('name', '!=', '')
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'ic_number' => preg_replace('/\D+/', '', (string) $request->input('ic_number')),
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'ic_number' => [
                'required',
                'digits:12',
                Rule::unique((new Student)->getTable(), 'ic_number'),
            ],
            'school_id' => ['required', 'integer', 'exists:school,id'],
        ], [
            'ic_number.digits' => 'Please enter a valid 12-digit IC number.',
            'ic_number.unique' => 'An account already exists for this IC number.',
            'school_id.required' => 'Please select your school.',
            'school_id.exists' => 'The selected school is not available.',
        ]);

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->ic_number),
                'display_name' => $request->name,
                'role_id' => 6,
                'is_active' => 1,
            ]);

            Student::create([
                'user_id' => $user->id,
                'school_id' => $request->school_id,
                'ic_number' => $request->ic_number,
                'full_name' => $request->name,
            ]);

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        if (! UserLocation::query()->where('user_id', $user->getKey())->exists()) {
            $request->session()->put('location_redirect_to', route('dashboard', absolute: false));

            return redirect()->route('login.location');
        }

        return redirect(route('dashboard', absolute: false));
    }
}
