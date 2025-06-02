<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// Возможно, здесь есть use Illuminate\Support\Facades\Schema; для Schema::defaultStringLength(191);

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Schema::defaultStringLength(191); // Если у вас есть эта строка, оставьте ее
        // УДАЛИТЕ ОТСЮДА ВСЕ, ЧТО КАСАЕТСЯ Auth::extend, $policies и $this->registerPolicies();
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}