<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserLoginActivity;
use App\Notifications\WelcomeToPtrs;

class WelcomeNotificationService
{
    public function sendForFirstLogin(User $user): void
    {
        if (UserLoginActivity::where('user_id', $user->id)->exists()
            || $user->notifications()->where('type', WelcomeToPtrs::class)->exists()) {
            return;
        }

        $user->notify(new WelcomeToPtrs());
    }
}
