<?php

namespace App\Domain\Hitung;

use InvalidArgumentException;

/**
 * Pembulatan dan tanggal yang meniru JavaScript persis, supaya hitungan server sama dengan
 * frontend/src/lib (D-08). `round()` PHP membulatkan setengah menjauhi nol dan memakai
 * pra-pembulatan; `Math.round` membulatkan setengah ke atas tanpa pra-pembulatan.
 */
final class Angka
{
    /** `Math.round(x * 10^d) / 10^d`. */
    public static function bulat(float|int $x, int $desimal = 0): float
    {
        $f = 10 ** $desimal;

        return floor($x * $f + 0.5) / $f;
    }

    public static function bulat2(float|int $x): float
    {
        return self::bulat($x, 2);
    }

    /** `bulatkanRupiah` (format.ts): bulat, setengah menjauhi nol. */
    public static function rupiah(float|int $n): int
    {
        return (int) (($n <=> 0) * floor(abs($n) + 0.5));
    }

    /** Tanggal "YYYY-MM-DD" + n hari (tanggal.ts). */
    public static function tambahHari(string $tanggal, int $n): string
    {
        return gmdate('Y-m-d', self::keDetik($tanggal) + $n * 86400);
    }

    /** Hari dari `$dari` ke `$ke`, positif bila `$ke` lebih akhir (tanggal.ts). */
    public static function selisihHari(string $dari, string $ke): int
    {
        return intdiv(self::keDetik($ke) - self::keDetik($dari), 86400);
    }

    private static function keDetik(string $tanggal): int
    {
        if (! preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $tanggal, $m) || ! checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
            throw new InvalidArgumentException("Tanggal harus berformat YYYY-MM-DD: {$tanggal}");
        }

        return (int) gmmktime(0, 0, 0, (int) $m[2], (int) $m[3], (int) $m[1]);
    }
}
