<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::table('topics')
            ->where('name', 'From 4 Vocabulary in Alphabetical Order')
            ->update(['name' => 'Form 4 Vocabulary in Alphabetical Order']);
    }

    public function down(): void
    {
        // Leave corrected content intact when rolling back the schema history.
    }
};
