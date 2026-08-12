<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class LoginLocationTest extends TestCase
{
    public function test_guests_cannot_access_the_login_location_step(): void
    {
        $this->get('/login/location')->assertRedirect('/login');
    }
}
