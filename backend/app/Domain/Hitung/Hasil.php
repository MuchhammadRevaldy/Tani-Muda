<?php

namespace App\Domain\Hitung;

use App\Http\Galat\GalatApi;

/**
 * Hasil fungsi hitung, sama dengan `Hasil<T>` di frontend/src/lib/hasil.ts:
 * `['ok' => true, 'nilai' => …]` atau `['ok' => false, 'galat' => 'KODE']`.
 */
final class Hasil
{
    /**
     * @template T
     *
     * @param  T  $nilai
     * @return array{ok: true, nilai: T}
     */
    public static function ok(mixed $nilai): array
    {
        return ['ok' => true, 'nilai' => $nilai];
    }

    /** @return array{ok: false, galat: string} */
    public static function gagal(string $galat): array
    {
        return ['ok' => false, 'galat' => $galat];
    }

    /**
     * Nilai bila berhasil; bila gagal, galat API dengan kode yang sama (ditandai pada kolomnya bila
     * diberikan), seperti `dariHasil` klien tiruan.
     *
     * @param  array{ok: true, nilai: mixed}|array{ok: false, galat: string}  $hasil
     */
    public static function buka(array $hasil, ?string $kolom = null): mixed
    {
        if ($hasil['ok']) {
            return $hasil['nilai'];
        }
        $kode = (string) $hasil['galat'];

        throw $kolom === null ? new GalatApi($kode) : GalatApi::validasi([$kolom => $kode], kode: $kode);
    }
}
