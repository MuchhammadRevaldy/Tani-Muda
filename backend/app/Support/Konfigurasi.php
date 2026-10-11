<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Konfigurasi bisnis dari tabel `konfigurasi` (D-28; kontrak-api.md 2.4 `Konfigurasi`): persen uang
 * muka, jam periksa, radius, dan seterusnya. Hanya belasan baris, jadi dibaca langsung tanpa cache.
 */
final class Konfigurasi
{
    /** @return array<string, mixed> `Konfigurasi` lengkap, termasuk `diperbarui_pada`. */
    public static function semua(): array
    {
        $baris = DB::table('konfigurasi')->get();
        $hasil = [];
        $terakhir = null;
        foreach ($baris as $b) {
            $hasil[$b->kunci] = json_decode($b->nilai, true, flags: JSON_THROW_ON_ERROR);
            $waktu = $b->diperbarui_pada ?? $b->dibuat_pada;
            if ($waktu !== null && ($terakhir === null || $waktu > $terakhir)) {
                $terakhir = $waktu;
            }
        }
        $hasil['diperbarui_pada'] = $terakhir === null ? null : Waktu::iso(CarbonImmutable::parse($terakhir, 'UTC'));

        return $hasil;
    }

    public static function nilai(string $kunci): mixed
    {
        return self::semua()[$kunci] ?? throw new RuntimeException("Konfigurasi {$kunci} belum diisi.");
    }

    public static function angka(string $kunci): int|float
    {
        $nilai = self::nilai($kunci);

        return is_int($nilai) || is_float($nilai) ? $nilai : throw new RuntimeException("Konfigurasi {$kunci} bukan angka.");
    }
}
