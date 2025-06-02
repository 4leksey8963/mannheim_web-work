<?php

namespace App; // Стандартный namespace

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RefreshToken extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
        'revoked_at'
    ];

    protected $dates = [
        'expires_at',
        'revoked_at',
        'created_at',
        'updated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isRevoked(): bool
    {
        return !is_null($this->revoked_at);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}