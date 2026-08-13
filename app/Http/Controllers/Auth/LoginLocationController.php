<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserLocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LoginLocationController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (UserLocation::query()->where('user_id', $request->user()->getKey())->exists()) {
            return redirect($this->redirectDestination($request));
        }

        return Inertia::render('Auth/LoginLocation');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'permission_status' => ['required', Rule::in(['granted', 'denied', 'unavailable'])],
            'latitude' => ['nullable', 'required_if:permission_status,granted', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_if:permission_status,granted', 'numeric', 'between:-180,180'],
            'accuracy_m' => ['nullable', 'numeric', 'min:0', 'max:100000'],
        ]);

        UserLocation::updateOrCreate(
            ['user_id' => $request->user()->getKey()],
            [...$data, 'captured_at' => now()],
        );

        return redirect($this->redirectDestination($request));
    }

    private function redirectDestination(Request $request): string
    {
        $destination = $request->session()->pull(
            'location_redirect_to',
            route('dashboard', absolute: false)
        );

        return is_string($destination) && str_starts_with($destination, '/')
            ? $destination
            : route('dashboard', absolute: false);
    }
}
