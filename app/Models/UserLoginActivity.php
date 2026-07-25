<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLoginActivity extends Model
{
    protected $fillable = [
        'user_id',
        'login_date',
        'last_login_at',
    ];

    protected function casts(): array
    {
        return [
            'login_date' => 'date',
            'last_login_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
