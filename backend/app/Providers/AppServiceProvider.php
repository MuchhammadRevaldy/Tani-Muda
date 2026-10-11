<?php

namespace App\Providers;

use App\Support\Waktu;
use DateTimeInterface;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Setiap waktu di JSON berbentuk ISO 8601 UTC dengan milidetik dan `Z` (kontrak 1.5).
        Date::serializeUsing(fn (DateTimeInterface $waktu) => Waktu::iso($waktu));
    }
}
