<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRefreshTokensTable extends Migration
{
    public function up()
    {
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id'); // Соответствует increments('id') в users
            $table->string('token', 191); // <--- ЭТА КОЛОНКА КЛЮЧЕВАЯ
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('token'); // Если JTI короткие, иначе для TEXT индекс может быть специфичным
        });
    }

    public function down()
    {
        Schema::dropIfExists('refresh_tokens');
    }
}