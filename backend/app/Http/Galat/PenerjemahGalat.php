<?php

namespace App\Http\Galat;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\RecordsNotFoundException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Satu-satunya tempat galat diubah menjadi respons kontrak (arsitektur-backend.md bagian 4):
 * `{ "galat": { "kode", "pesan", "rincian"?, "coba_lagi_dalam"? } }`.
 *
 * `rincian` hanya dikirim bila berisi, sama dengan GalatApi.keJson() di klien tiruan. Rincian
 * galat server tidak pernah dikirim ke klien; galat tetap dicatat di log oleh Laravel.
 */
final class PenerjemahGalat
{
    public static function keRespons(Throwable $e): JsonResponse
    {
        return self::keJson(self::keGalatApi($e));
    }

    public static function keGalatApi(Throwable $e): GalatApi
    {
        return match (true) {
            $e instanceof GalatApi => $e,
            $e instanceof ValidationException => new GalatApi('VALIDASI', rincian: $e->errors()),
            $e instanceof AuthenticationException => new GalatApi('BELUM_MASUK'),
            $e instanceof AuthorizationException => new GalatApi('TIDAK_DIIZINKAN'),
            // 404 juga untuk data milik pengguna lain, supaya keberadaannya tidak bocor (D-22).
            $e instanceof ModelNotFoundException,
            $e instanceof RecordsNotFoundException => new GalatApi('TIDAK_DITEMUKAN'),
            $e instanceof ThrottleRequestsException => self::terlaluSering($e),
            $e instanceof TokenMismatchException => self::sesiBerubah(),
            $e instanceof HttpExceptionInterface => self::dariStatusHttp($e),
            default => new GalatApi('GALAT_SERVER'),
        };
    }

    private static function dariStatusHttp(HttpExceptionInterface $e): GalatApi
    {
        $status = $e->getStatusCode();

        return match (true) {
            $status === 401 => new GalatApi('BELUM_MASUK'),
            $status === 403 => new GalatApi('TIDAK_DIIZINKAN'),
            // 405: metode lain untuk alamat yang ada diperlakukan seperti alamat yang tidak ada.
            $status === 404, $status === 405 => new GalatApi('TIDAK_DITEMUKAN'),
            $status === 409 => new GalatApi('BENTROK'),
            $status === 419 => self::sesiBerubah(),
            $status === 429 => self::terlaluSering($e),
            $status >= 500 => new GalatApi('GALAT_SERVER', status: $status),
            // 400, 413, 415, dan sejenisnya: permintaan tidak bisa dibaca.
            default => new GalatApi('VALIDASI', status: $status),
        };
    }

    private static function terlaluSering(HttpExceptionInterface $e): GalatApi
    {
        $detik = (int) ($e->getHeaders()['Retry-After'] ?? 60);

        return new GalatApi('TERLALU_SERING', cobaLagiDalam: max(1, $detik));
    }

    /**
     * Token CSRF tidak cocok (sesi berganti atau kedaluwarsa). Status 419 dipertahankan agar
     * klien HTTP bisa meminta /sanctum/csrf-cookie lagi; kode BENTROK karena tindakannya sama:
     * muat ulang lalu coba lagi.
     */
    private static function sesiBerubah(): GalatApi
    {
        return new GalatApi('BENTROK', status: 419);
    }

    private static function keJson(GalatApi $g): JsonResponse
    {
        $isi = ['kode' => $g->kode, 'pesan' => $g->getMessage()];
        if ($g->rincian !== []) {
            $isi['rincian'] = $g->rincian;
        }
        if ($g->cobaLagiDalam !== null) {
            $isi['coba_lagi_dalam'] = $g->cobaLagiDalam;
        }
        $header = $g->cobaLagiDalam !== null ? ['Retry-After' => (string) $g->cobaLagiDalam] : [];

        return new JsonResponse(['galat' => $isi], $g->status, $header);
    }
}
