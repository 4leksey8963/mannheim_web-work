<?php

namespace App\Auth;

use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use App\Services\JwtService;

class JwtGuard implements Guard
{
    use GuardHelpers;

    protected $request;
    protected $jwtService;

    public function __construct(UserProvider $provider, Request $request, JwtService $jwtService)
    {
        $this->provider = $provider;
        $this->request = $request;
        $this->jwtService = $jwtService;
    }

    public function user()
    {
        if (!is_null($this->user)) {
            return $this->user;
        }

        $tokenString = $this->getTokenForRequest();

        if (empty($tokenString)) {
            return null;
        }

        $parsedToken = $this->jwtService->parseToken($tokenString);

        if (!$parsedToken) {
            return null;
        }

        $userId = $this->jwtService->getUserIdFromToken($parsedToken);
        if (!$userId) {
            return null;
        }
        
        $user = $this->provider->retrieveById($userId);
        $this->setUser($user); // Устанавливаем пользователя

        return $this->user;
    }

    public function getTokenForRequest(): ?string
    {
        return $this->request->bearerToken();
    }

    public function validate(array $credentials = [])
    {
        return false;
    }

}