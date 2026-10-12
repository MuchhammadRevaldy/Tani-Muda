<?php

namespace App\Support;

use App\Models\Pengguna;
use Carbon\CarbonImmutable;

/**
 * "Hari ini" menurut zona waktu pengguna (D-31), sama dengan `k.hariIni(pengguna)` klien tiruan.
 * Jadwal dan tanggal kalender dihitung dari tanggal ini, bukan tanggal UTC server.
 */
final class HariIni
{
    public static function untuk(?Pengguna $p): string
    {
        $zona = $p?->zona_waktu ?: (string) config('app.zona_waktu_tampilan', 'Asia/Jakarta');

        return CarbonImmutable::now()->setTimezone($zona)->toDateString();
    }
}
