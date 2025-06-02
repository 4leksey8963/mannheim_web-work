<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\User; // Путь к вашей модели User (App\User для Laravel 5.5 по умолчанию)
use App\Services\JwtService;
use App\RefreshToken; // Путь к вашей модели RefreshToken (App\RefreshToken)

class AuthController extends Controller
{
    // Для PHP < 7.4 уберите типизацию: protected $jwtService;
    protected $jwtService;
    

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
        $this->middleware('auth:api', ['except' => ['login', 'register', 'refresh']]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string|max:255|unique:users,login',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'gender' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'car' => 'nullable|string|max:255',
        ]);


        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = $request->only(['login', 'email', 'firstname', 'lastname', 'gender', 'city', 'car']);
        $userData['password'] = bcrypt($request->password); // Хэшируем пароль

        $user = User::create($userData);

        $accessToken = $this->jwtService->createAccessToken($user);
        $refreshTokenString = $this->jwtService->createAndStoreRefreshToken($user);

        return response()->json([
            'message' => 'User successfully registered',
            'access_token' => $accessToken,
            'refresh_token' => $refreshTokenString,
            'token_type' => 'bearer',
            'expires_in' => config('auth.jwt_access_token_ttl', 3600)
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string', // Предполагаем вход по 'login'
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('login', $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Unauthorized (Invalid credentials)'], 401);
        }

        // Аннулируем старые refresh-токены пользователя (опционально, но хорошая практика)
        // $this->jwtService->revokeUserRefreshTokens($user);

        $accessToken = $this->jwtService->createAccessToken($user);
        $refreshTokenString = $this->jwtService->createAndStoreRefreshToken($user);

        return response()->json([
            'access_token' => $accessToken,
            'refresh_token' => $refreshTokenString,
            'token_type' => 'bearer',
            'expires_in' => config('auth.jwt_access_token_ttl', 3600)
        ]);
    }

    public function refresh(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $refreshTokenString = $request->input('refresh_token');
        $parsedRefreshToken = $this->jwtService->parseToken($refreshTokenString, 'refresh');

        if (!$parsedRefreshToken) {
            return response()->json(['error' => 'Invalid or expired refresh token (parsing/validation)'], 401);
        }

        $userId = $this->jwtService->getUserIdFromToken($parsedRefreshToken);
        $jti = $this->jwtService->getTokenJti($parsedRefreshToken);

        // Ищем refresh токен в БД по JTI
        $dbRefreshToken = RefreshToken::where('user_id', $userId)
                                      ->where('token', $jti) // 'token' в БД это JTI
                                      ->whereNull('revoked_at')
                                      ->where('expires_at', '>', now())
                                      ->first();

        if (!$dbRefreshToken) {
            return response()->json(['error' => 'Refresh token not found, revoked, or expired (db)'], 401);
        }

        // Опциональная ротация: аннулируем старый refresh токен
        $dbRefreshToken->update(['revoked_at' => now()]);

        $user = User::find($userId);
        if (!$user) {
            // Это не должно произойти, если refresh токен валиден
            return response()->json(['error' => 'User not found'], 404);
        }

        $newAccessToken = $this->jwtService->createAccessToken($user);
        // Генерируем новый refresh токен для ротации
        $newRefreshTokenString = $this->jwtService->createAndStoreRefreshToken($user);


        return response()->json([
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshTokenString, // Возвращаем новый refresh токен
            'token_type' => 'bearer',
            'expires_in' => config('auth.jwt_access_token_ttl', 3600)
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $this->jwtService->revokeUserRefreshTokens($user);
        }
        return response()->json(['message' => 'Successfully logged out and refresh tokens revoked']);
    }
}