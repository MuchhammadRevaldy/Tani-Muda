<?php

namespace App\Domain\Otp;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * OTP_DRIVER=log: kode ditulis ke log Laravel dan disimpan sementara untuk panel "Kode uji" di
 * demo lokal (GET /demo/kode-otp). Hanya boleh aktif saat APP_ENV=local (dicek AppServiceProvider).
 */
final class PengirimOtpLog implements PengirimOtp
{
    public function kirim(string $nomorHp, string $kode): void
    {
        Log::info("Kode OTP untuk {$nomorHp}: {$kode}");
        Cache::put(self::kunciCache($nomorHp), $kode, now()->addSeconds(LayananOtp::KEDALUWARSA_DETIK));
    }

    public static function kodeTerakhir(string $nomorHp): ?string
    {
        $kode = Cache::get(self::kunciCache($nomorHp));

        return is_string($kode) ? $kode : null;
    }

    public static function lupakan(string $nomorHp): void
    {
        Cache::forget(self::kunciCache($nomorHp));
    }

    private static function kunciCache(string $nomorHp): string
    {
        return "otp-log:{$nomorHp}";
    }
}
