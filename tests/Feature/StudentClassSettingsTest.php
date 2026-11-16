<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class StudentClassSettingsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(HandleInertiaRequests::class);
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
        });
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('class_name')->nullable();
            $table->string('ic_number')->nullable();
            $table->timestamps();
        });
    }

    public function test_student_can_update_and_clear_only_their_own_class(): void
    {
        $user = User::create(['name' => 'Syazwan', 'email' => 'syazwan@example.test']);
        $student = Student::create(['user_id' => $user->id, 'class_name' => '4 Amanah']);
        $other = User::create(['name' => 'Other', 'email' => 'other@example.test']);
        $otherStudent = Student::create(['user_id' => $other->id, 'class_name' => '5 Cekal']);

        $this->actingAs($user)->patch('/profile', [
            'name' => $user->name, 'email' => $user->email,
            'class_name' => '5 Bestari', 'student_id' => $otherStudent->id,
        ])->assertSessionHasNoErrors()->assertRedirect('/profile');

        $this->assertSame('5 Bestari', $student->fresh()->class_name);
        $this->assertSame('5 Cekal', $otherStudent->fresh()->class_name);

        $this->patch('/profile', [
            'name' => $user->name, 'email' => $user->email, 'class_name' => '',
        ])->assertSessionHasNoErrors();
        $this->assertNull($student->fresh()->class_name);
    }

    public function test_invalid_class_is_rejected_without_changing_the_profile(): void
    {
        $user = User::create(['name' => 'Syazwan', 'email' => 'syazwan@example.test']);
        $student = Student::create(['user_id' => $user->id, 'class_name' => '4 Amanah']);

        foreach ([str_repeat('a', 101), ['invalid']] as $invalid) {
            $this->actingAs($user)->from('/profile')->patch('/profile', [
                'name' => 'Changed', 'email' => $user->email, 'class_name' => $invalid,
            ])->assertSessionHasErrors('class_name');
        }
        $this->assertSame('4 Amanah', $student->fresh()->class_name);
        $this->assertSame('Syazwan', $user->fresh()->name);
    }

    public function test_account_without_student_can_still_update_profile(): void
    {
        $user = User::create(['name' => 'Account', 'email' => 'account@example.test']);
        $this->actingAs($user)->patch('/profile', [
            'name' => 'Updated', 'email' => $user->email,
        ])->assertSessionHasNoErrors()->assertRedirect('/profile');
        $this->assertSame('Updated', $user->fresh()->name);
        $this->assertSame(0, Student::count());
    }

    public function test_omitting_class_preserves_existing_value(): void
    {
        $user = User::create(['name' => 'Syazwan', 'email' => 'syazwan@example.test']);
        $student = Student::create(['user_id' => $user->id, 'class_name' => '5 Bestari']);
        $this->actingAs($user)->patch('/profile', [
            'name' => 'Updated', 'email' => $user->email,
        ])->assertSessionHasNoErrors();
        $this->assertSame('5 Bestari', $student->fresh()->class_name);
    }

    public function test_identity_card_number_cannot_be_changed_through_profile_update(): void
    {
        $user = User::create(['name' => 'Student', 'email' => 'student@example.test']);
        $student = Student::create(['user_id' => $user->id, 'ic_number' => '080101010101']);
        $this->actingAs($user)->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'ic_number' => '999999999999',
        ])->assertSessionHasNoErrors()->assertRedirect('/profile');
        $this->assertSame('080101010101', $student->fresh()->ic_number);
    }
}
