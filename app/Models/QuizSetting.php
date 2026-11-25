<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class QuizSetting extends Model
{
    public const DEFAULT_LABEL = 'Selangor Education Summit 2026';

    protected $table = 'quiz_settings';

    protected $fillable = [
        'leaderboard_label',
        'leaderboard_start_date',
        'leaderboard_end_date',
        'collect_school',
        'collect_ic',
        'collect_email',
        'collect_phone',
    ];

    protected $casts = [
        'collect_school' => 'boolean',
        'collect_ic' => 'boolean',
        'collect_email' => 'boolean',
        'collect_phone' => 'boolean',
        'leaderboard_start_date' => 'date:Y-m-d',
        'leaderboard_end_date' => 'date:Y-m-d',
    ];

    public static function current(): self
    {
        return static::query()->first() ?? static::create(['leaderboard_label' => self::DEFAULT_LABEL]);
    }

    public function label(): string
    {
        $label = trim((string) $this->leaderboard_label);

        return $label !== '' ? $label : self::DEFAULT_LABEL;
    }

    /** Optional registration fields switched on for the current event. */
    public function registrationFields(): array
    {
        return [
            'school' => (bool) $this->collect_school,
            'ic' => (bool) $this->collect_ic,
            'email' => (bool) $this->collect_email,
            'phone' => (bool) $this->collect_phone,
        ];
    }

    /** Limit a quiz_sessions query to the configured start/end dates (both inclusive). */
    public function applyDateRange(Builder $query): Builder
    {
        if ($this->leaderboard_start_date) {
            $query->where('created_at', '>=', $this->leaderboard_start_date->copy()->startOfDay());
        }

        if ($this->leaderboard_end_date) {
            $query->where('created_at', '<=', $this->leaderboard_end_date->copy()->endOfDay());
        }

        return $query;
    }
}
