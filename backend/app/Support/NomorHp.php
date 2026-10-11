<?php

namespace App\Support;

use App\Http\Galat\GalatApi;

/**
 * Normalisasi nomor HP Indonesia ke format +62, sama dengan frontend/src/lib/nomor-hp.ts (D-04):
 * "0812-3456-7890", "62 812 3456 7890", "+6281234567890", "81234567890" → "+6281234567890".
 */
final class NomorHp
{
    public static function normalisasi(string $masukan): ?string
    {
        $digit = preg_replace('/[\s\-().]/', '', $masukan) ?? '';
        if (! preg_match('/^\+?\d+$/', $digit)) {
            return null;
        }
        $inti = ltrim($digit, '+');
        if (str_starts_with($inti, '62')) {
            $inti = substr($inti, 2);
        } elseif (str_starts_with($inti, '0')) {
            $inti = substr($inti, 1);
        }

        return preg_match('/^8\d{8,11}$/', $inti) ? '+62'.$inti : null;
    }

    /** Nomor ternormalisasi, atau galat validasi `NOMOR_HP_TIDAK_VALID` pada kolom `nomor_hp`. */
    public static function wajib(mixed $masukan): string
    {
        return (is_string($masukan) ? self::normalisasi($masukan) : null)
            ?? throw GalatApi::validasi(['nomor_hp' => 'NOMOR_HP_TIDAK_VALID'], kode: 'NOMOR_HP_TIDAK_VALID');
    }
}
