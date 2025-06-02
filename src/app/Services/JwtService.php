<?php

namespace App\Services;

use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Rsa\Sha256;
use Lcobucci\JWT\Token as ParsedToken; // Переименовываем, чтобы не конфликтовать с моделью RefreshToken
use Lcobucci\JWT\Validation\Constraint\IssuedBy;
use Lcobucci\JWT\Validation\Constraint\PermittedFor;
use Lcobucci\JWT\Validation\Constraint\SignedWith;
use Lcobucci\JWT\Validation\Constraint\ValidAt;
use Lcobucci\Clock\SystemClock;
use App\User;
use App\RefreshToken; // Ваша модель для Refresh токенов (путь App\RefreshToken)

class JwtService
{
    // Для PHP < 7.4 уберите типизацию свойств
    private $config;
    private $passphrase;
    private $accessTokenTtl;
    private $refreshTokenTtl;

    public function __construct()
    {
        $privateKeyPath = storage_path('oauth-private.key');
        $publicKeyPath = storage_path('oauth-public.key');
        
        $this->passphrase = env('JWT_KEY_PASSPHRASE');

        if (empty($this->passphrase) && file_exists($privateKeyPath) && strpos(file_get_contents($privateKeyPath), 'ENCRYPTED') !== false) {
            throw new \RuntimeException('JWT_KEY_PASSPHRASE is not set in .env and private key seems to be encrypted.');
        }

        $privateKey = InMemory::file('file://' . $privateKeyPath, $this->passphrase);
        $publicKey = InMemory::file('file://' . $publicKeyPath);

        $this->config = Configuration::forAsymmetricSigner(
            new Sha256(),
            $privateKey,
            $publicKey
        );

        // Устанавливаем TTL для токенов из конфигурации или .env
        // В config/auth.php можно добавить:
        // 'jwt_access_token_ttl' => env('JWT_ACCESS_TOKEN_TTL', 3600),
        // 'jwt_refresh_token_ttl' => env('JWT_REFRESH_TOKEN_TTL', 2592000), // 30 дней
        $this->accessTokenTtl = config('auth.jwt_access_token_ttl', 3600); // 1 час по умолчанию
        $this->refreshTokenTtl = config('auth.jwt_refresh_token_ttl', 60 * 60 * 24 * 30); // 30 дней по умолчанию
    }

    /**
     * Создание Access Token.
     */
    public function createAccessToken(User $user): string
    {
        $now = new DateTimeImmutable();
        $expiresAt = $now->modify("+{$this->accessTokenTtl} seconds");

        $token = $this->config->builder()
            ->issuedBy(config('app.url')) // URL вашего приложения из .env
            ->permittedFor(config('app.url')) // Для кого предназначен токен
            ->identifiedBy(bin2hex(random_bytes(16))) // Уникальный ID токена (JTI)
            ->issuedAt($now) // Время выпуска
            ->canOnlyBeUsedAfter($now) // Не раньше чем
            ->expiresAt($expiresAt) // Время истечения
            ->withClaim('uid', $user->id) // ID пользователя
            ->withClaim('type', 'access') // Тип токена
            ->getToken($this->config->signer(), $this->config->signingKey());

        return $token->toString();
    }

    /**
     * Создание Refresh Token (как JWT) и сохранение его JTI в БД.
     */
    public function createAndStoreRefreshToken(User $user): string
    {
        $now = new DateTimeImmutable();
        $expiresAt = $now->modify("+{$this->refreshTokenTtl} seconds");
        $jti = bin2hex(random_bytes(16)); // Уникальный ID для refresh токена (JTI)

        $token = $this->config->builder()
            ->issuedBy(config('app.url'))
            ->permittedFor(config('app.url')) // Можно сделать специфичным для refresh эндпоинта
            ->identifiedBy($jti)
            ->issuedAt($now)
            ->canOnlyBeUsedAfter($now)
            ->expiresAt($expiresAt)
            ->withClaim('uid', $user->id) // ID пользователя
            ->withClaim('type', 'refresh') // Тип токена
            ->getToken($this->config->signer(), $this->config->signingKey());

        $tokenString = $token->toString();

        // Сохраняем JTI refresh токена в БД
        RefreshToken::create([
            'user_id' => $user->id,
            'token' => $jti, // Сохраняем JTI
            'expires_at' => $expiresAt,
        ]);

        return $tokenString; // Возвращаем полный JWT refresh токен клиенту
    }

    /**
     * Парсинг и валидация токена.
     * @param string $tokenString
     * @param string|null $expectedType Ожидаемый тип токена ('access' или 'refresh')
     * @return ParsedToken|null
     */
    public function parseToken(string $tokenString, string $expectedType = null): ?ParsedToken
    {
        try {
            $token = $this->config->parser()->parse($tokenString);

            // Валидация токена
            $constraints = [
                new SignedWith($this->config->signer(), $this->config->verificationKey()),
                new IssuedBy(config('app.url')),
                new PermittedFor(config('app.url')),
                new ValidAt(SystemClock::fromSystemTimezone()), // Проверяет nbf, exp, iat
            ];

            if (!$this->config->validator()->validate($token, ...$constraints)) {
                \Log::warning('JWT validation failed for basic constraints.');
                return null;
            }

            // Проверка типа токена, если указан
            if ($expectedType && $token->claims()->get('type') !== $expectedType) {
                \Log::warning("Invalid token type. Expected {$expectedType}, got ".$token->claims()->get('type'));
                return null;
            }

            return $token;
        } catch (\Lcobucci\JWT\Token\InvalidTokenStructure $e) {
            \Log::warning('Invalid JWT structure: ' . $e->getMessage() . ' Token: ' . substr($tokenString, 0, 50) . '...');
            return null;
        } catch (\Exception $e) {
            \Log::error('JWT Parsing/Validation Error: ' . $e->getMessage() . ' Token: ' . substr($tokenString, 0, 50) . '...');
            return null;
        }
    }

    /**
     * Получение User ID из токена.
     */
    public function getUserIdFromToken(ParsedToken $token)
    {
        return $token->claims()->get('uid');
    }

    /**
     * Получение JTI (JWT ID) из токена.
     */
    public function getTokenJti(ParsedToken $token)
    {
        return $token->claims()->get('jti');
    }

    /**
     * Аннулирование всех refresh токенов пользователя.
     */
    public function revokeUserRefreshTokens(User $user)
    {
        RefreshToken::where('user_id', $user->id)
                      ->whereNull('revoked_at')
                      ->update(['revoked_at' => now()]);
    }
}