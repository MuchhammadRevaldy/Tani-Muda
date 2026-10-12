<?php

namespace App\Domain\Hitung;

/**
 * Jarak Haversine dari titik tengah desa (frontend/src/lib/jarak.ts, D-06).
 *
 * @phpstan-type Titik array{lintang: float|int, bujur: float|int}
 */
final class Jarak
{
    public const JARI_JARI_BUMI_KM = 6371;

    /**
     * @param  Titik  $a
     * @param  Titik  $b
     */
    public static function jarakKm(array $a, array $b): float
    {
        $dLintang = deg2rad($b['lintang'] - $a['lintang']);
        $dBujur = deg2rad($b['bujur'] - $a['bujur']);
        $h = sin($dLintang / 2) ** 2 + cos(deg2rad($a['lintang'])) * cos(deg2rad($b['lintang'])) * sin($dBujur / 2) ** 2;

        return 2 * self::JARI_JARI_BUMI_KM * asin(min(1, sqrt($h)));
    }

    /**
     * @param  Titik  $titik
     * @param  Titik  $pusat
     */
    public static function dalamRadius(array $titik, array $pusat, float|int $radiusKm): bool
    {
        return self::jarakKm($titik, $pusat) <= $radiusKm + 1e-9;
    }

    /**
     * Titik tengah wilayah, atau null bila desa belum punya titik (D-56).
     *
     * @return Titik|null
     */
    public static function titik(?object $wilayah): ?array
    {
        if ($wilayah === null || $wilayah->lintang === null || $wilayah->bujur === null) {
            return null;
        }

        return ['lintang' => (float) $wilayah->lintang, 'bujur' => (float) $wilayah->bujur];
    }
}
