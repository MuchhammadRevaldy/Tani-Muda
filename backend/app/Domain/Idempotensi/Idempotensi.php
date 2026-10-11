<?php

namespace App\Domain\Idempotensi;

use Closure;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use LogicException;

/**
 * Operasi idempoten (kontrak-api.md 1.7, arsitektur-backend.md bagian 10, D-54).
 *
 * Baris `kunci_idempoten` di-insert sebagai pernyataan PERTAMA di transaksi yang sama dengan
 * operasinya, dan responsnya disimpan di transaksi itu sebelum commit:
 * - permintaan serentak dengan kunci yang sama tertahan kunci unik sampai transaksi pertama selesai,
 *   lalu membaca respons tersimpan (tidak ada status "sedang berjalan", tidak ada BENTROK);
 * - bila operasi gagal, baris kuncinya ikut di-rollback, sehingga tidak ada kunci yatim dan
 *   permintaan bisa diulang dengan kunci yang sama.
 *
 * Insert harus menjadi pernyataan pertama di transaksi: permintaan yang menunggu belum memegang
 * kunci baris apa pun, jadi tidak bisa terjadi deadlock dengan transaksi pertama.
 */
final class Idempotensi
{
    /**
     * @param  Closure(): array{status: int, respons: array<mixed>}  $operasi
     * @return array{status: int, respons: array<mixed>, diulang: bool}
     */
    public static function jalankan(string $penggunaId, string $endpoint, string $kunci, Closure $operasi): array
    {
        return DB::transaction(function () use ($penggunaId, $endpoint, $kunci, $operasi) {
            $kunciBaris = ['pengguna_id' => $penggunaId, 'endpoint' => $endpoint, 'kunci' => $kunci];
            try {
                $nomor = DB::table('kunci_idempoten')->insertGetId($kunciBaris + ['dibuat_pada' => now()]);
            } catch (UniqueConstraintViolationException) {
                return self::tersimpan($kunciBaris);
            }

            $hasil = $operasi();
            DB::table('kunci_idempoten')->where('nomor', $nomor)->update([
                'status_http' => $hasil['status'],
                'respons' => json_encode($hasil['respons'], JSON_THROW_ON_ERROR),
                'diperbarui_pada' => now(),
            ]);

            return $hasil + ['diulang' => false];
        });
    }

    /**
     * Respons permintaan pertama. Baris itu baru terlihat setelah transaksinya commit, dan
     * responsnya diisi sebelum commit, jadi respons selalu ada.
     *
     * @param  array{pengguna_id: string, endpoint: string, kunci: string}  $kunciBaris
     * @return array{status: int, respons: array<mixed>, diulang: bool}
     */
    private static function tersimpan(array $kunciBaris): array
    {
        // Baca terkunci: selalu membaca versi terbaru yang sudah commit, bukan snapshot transaksi.
        $baris = DB::table('kunci_idempoten')->where($kunciBaris)->sharedLock()->first();
        if ($baris === null || $baris->status_http === null || $baris->respons === null) {
            throw new LogicException('Kunci idempoten tanpa respons tersimpan.');
        }

        return [
            'status' => (int) $baris->status_http,
            'respons' => json_decode((string) $baris->respons, true, flags: JSON_THROW_ON_ERROR),
            'diulang' => true,
        ];
    }
}
