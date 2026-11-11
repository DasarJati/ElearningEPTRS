<?php

return [
    // Players ranked within this position qualify for a prize card.
    'prize_top' => 10,

    // Admin password that must be entered before a prize winner can continue.
    // Override with QUIZ_PRIZE_PASSWORD in .env.
    'prize_password' => env('QUIZ_PRIZE_PASSWORD', '12345678'),
];
