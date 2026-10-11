<?php

namespace App\Providers;

use App\Domain\Otp\PengirimOtp;
use App\Domain\Otp\PengirimOtpLog;
use App\Support\Waktu;
use DateTimeInterface;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Pengirim OTP (arsitektur-backend.md bagian 5). Driver log hanya boleh di lingkungan lokal:
        // kode tertulis di log dan terbaca lewat /demo/kode-otp.
        $this->app->bind(PengirimOtp::class, function () {
            $driver = config('services.otp.driver');
            if ($driver === 'log') {
                if (! $this->app->environment('local', 'testing')) {
                    throw new RuntimeException('OTP_DRIVER=log hanya boleh dipakai saat APP_ENV=local.');
                }

                return new PengirimOtpLog;
            }
            throw new RuntimeException("OTP_DRIVER tidak dikenal: {$driver}");
        });
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
