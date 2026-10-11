<?php

namespace App\Support;

use Carbon\CarbonImmutable;

/**
 * Tanggal relatif data contoh menjadi tanggal nyata, sama dengan
 * frontend/src/api/tiruan/tanggal-relatif.ts (D-47):
 * "H-13" → "YYYY-MM-DD", "H+0T07:00" → waktu UTC ISO, "B+2" → "YYYY-MM",
 * "J-1" → waktu UTC ISO satu jam sebelum data dibuat atau diatur ulang.
 */
final class TanggalRelatif
{
    /**
     * @param  string  $hariIni  tanggal "YYYY-MM-DD" di zona `$zona`
     * @param  CarbonImmutable|null  $sekarang  acuan "J±n"; bila null, hari ini pukul 08.00 di zona itu
     */
    public static function nilai(string $nilai, string $hariIni, string $zona, ?CarbonImmutable $sekarang = null): string
    {
        if (preg_match('/^J([+-]\d+)$/', $nilai, $m)) {
            $acuan = $sekarang ?? CarbonImmutable::parse("{$hariIni} 08:00", $zona);

            return Waktu::iso($acuan->utc()->addHours((int) $m[1]));
        }
        if (preg_match('/^H([+-]\d+)T(\d{2}):(\d{2})$/', $nilai, $m)) {
            $tanggal = CarbonImmutable::parse($hariIni, $zona)->addDays((int) $m[1])->toDateString();

            return Waktu::iso(CarbonImmutable::parse("{$tanggal} {$m[2]}:{$m[3]}", $zona));
        }
        if (preg_match('/^H([+-]\d+)$/', $nilai, $m)) {
            return CarbonImmutable::parse($hariIni, 'UTC')->addDays((int) $m[1])->toDateString();
        }
        if (preg_match('/^B([+-]\d+)$/', $nilai, $m)) {
            [$tahun, $bulan] = array_map('intval', explode('-', $hariIni));
            $total = $tahun * 12 + ($bulan - 1) + (int) $m[1];

            return sprintf('%d-%02d', intdiv($total, 12), $total % 12 + 1);
        }

        return $nilai;
    }

    /** Salinan data dengan semua string relatif diselesaikan; angka, boolean, dan null tetap. */
    public static function selesaikan(mixed $data, string $hariIni, string $zona, ?CarbonImmutable $sekarang = null): mixed
    {
        if (is_string($data)) {
            return self::nilai($data, $hariIni, $zona, $sekarang);
        }
        if (is_array($data)) {
            return array_map(fn ($x) => self::selesaikan($x, $hariIni, $zona, $sekarang), $data);
        }

        return $data;
    }
}
