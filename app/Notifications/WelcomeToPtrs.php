<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WelcomeToPtrs extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'welcome',
            'sender' => 'Admin PTRS',
            'title' => 'Selamat datang ke PTRS Praktis!',
            'message' => 'Hebat, kamu sudah bermula! Belajar sedikit demi sedikit, berani mencuba, dan jangan takut salah. Setiap latihan membawa kamu selangkah lebih maju. Jom belajar bersama!',
            'image' => '/images/welcome_ptrs_praktis.png',
        ];
    }
}
