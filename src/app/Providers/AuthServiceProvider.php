<?php

namespace App\Providers;

use App\Auth\JwtGuard;      // <-- ДОБАВЬТЕ ЭТОТ USE, если его нет
use App\Services\JwtService;  // <-- ДОБАВЬТЕ ЭТОТ USE, если его нет
use Illuminate\Support\Facades\Auth; // <-- ДОБАВЬТЕ ЭТОТ USE, если его нет
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
// Для Laravel 5.5 может потребоваться:
// use Illuminate\Contracts\Auth\Access\Gate as GateContract; // Если используете Gate

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Model' => 'App\Policies\ModelPolicy', // Замените на ваши реальные политики, если они есть
        // Например: 'App\User' => 'App\Policies\UserPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot() // Для Laravel 5.5 параметр GateContract $gate может быть здесь: public function boot(GateContract $gate)
    {
        $this->registerPolicies(); // ЭТО ЗДЕСЬ ПРАВИЛЬНО

        // ДОБАВЬТЕ ВАШ КОД ДЛЯ РЕГИСТРАЦИИ JWT GUARD СЮДА:
        Auth::extend('jwt_custom', function ($app, $name, array $config) {
            return new JwtGuard(
                Auth::createUserProvider($config['provider']),
                $app['request'],
                $app->make(JwtService::class)
            );
        });

        // ... другая ваша логика авторизации, если есть (например, Gate::define(...))
    }
}