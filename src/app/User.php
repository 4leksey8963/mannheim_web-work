<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable // implements JWTSubject (если бы был tymon)
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
     protected $fillable = [
        'login',
        'email',
        'password', // Добавляем сюда, так как мы передаем его в User::create() после хэширования
        'firstname',
        'lastname',
        'gender',
        'city',
        'car',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class); // Убедитесь, что App\RefreshToken существует
    }

}