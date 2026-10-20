<?php

namespace Tests\Feature;

use App\Http\Controllers\Web\NotificationController;
use App\Models\User;
use App\Services\WelcomeNotificationService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class NotificationFeedTest extends TestCase
{
    public function test_feed_only_contains_messages_even_when_friend_requests_and_practice_exist(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('display_name')->nullable();
        });
        Schema::create('friend_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('requester_id');
            $table->unsignedBigInteger('receiver_id');
            $table->string('status');
            $table->timestamps();
        });
        Schema::create('subject', function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
        Schema::create('practice_session', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedTinyInteger('score');
            $table->timestamp('end_at')->nullable();
            $table->timestamps();
        });
        Schema::create('user_login_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->date('login_date');
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        DB::table('users')->insert([
            ['id' => 10, 'name' => 'Student'],
            ['id' => 20, 'name' => 'Friend'],
            ['id' => 30, 'name' => 'Other'],
        ]);
        DB::table('subject')->insert(['id' => 43, 'name' => 'English']);
        DB::table('friend_requests')->insert([
            ['id' => 1, 'requester_id' => 20, 'receiver_id' => 10, 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'requester_id' => 30, 'receiver_id' => 10, 'status' => 'accepted', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'requester_id' => 20, 'receiver_id' => 30, 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()],
        ]);
        DB::table('practice_session')->insert([
            ['id' => 1, 'user_id' => 10, 'subject_id' => 43, 'score' => 80, 'end_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'user_id' => 10, 'subject_id' => 43, 'score' => 0, 'end_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'user_id' => 30, 'subject_id' => 43, 'score' => 100, 'end_at' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        $user = (new User())->forceFill(['id' => 10]);
        app(WelcomeNotificationService::class)->sendForFirstLogin($user);
        app(WelcomeNotificationService::class)->sendForFirstLogin($user);
        DB::table('user_login_activities')->insert([
            'user_id' => 20,
            'login_date' => now()->toDateString(),
        ]);
        app(WelcomeNotificationService::class)->sendForFirstLogin((new User())->forceFill(['id' => 20]));
        $this->assertSame(1, DB::table('notifications')->count());

        $request = Request::create('/notifications');
        $request->setUserResolver(fn () => $user);
        $data = (new NotificationController())->index($request)->getData(true);

        $this->assertArrayNotHasKey('pending_count', $data);
        $this->assertSame(1, $data['unread_count']);
        $this->assertCount(1, $data['items']);
        $this->assertSame(['admin_message'], array_column($data['items'], 'type'));
        $welcome = collect($data['items'])->firstWhere('type', 'admin_message');
        $this->assertSame('Selamat datang ke PTRS Praktis!', $welcome['title']);
        $this->assertSame('/images/welcome_ptrs_praktis.png', $welcome['image']);

        $readRequest = Request::create('/notifications/read', 'POST', ['ids' => [$welcome['id']]]);
        $readRequest->setUserResolver(fn () => $user);
        $this->assertSame(0, (new NotificationController())->markRead($readRequest)->getData(true)['unread_count']);
    }
}
