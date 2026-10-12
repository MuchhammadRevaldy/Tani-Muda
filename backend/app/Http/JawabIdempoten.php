<?php

namespace App\Http;

use App\Domain\Idempotensi\Idempotensi;
use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Endpoint idempoten (kontrak 1.7, D-54): `kunci_idempoten` wajib, respons pertama diulang. */
final class JawabIdempoten
{
    /** @param  Closure(): mixed  $operasi  isi `data` respons */
    public static function jalankan(Request $request, Pengguna $p, string $endpoint, Closure $operasi): JsonResponse
    {
        $kunci = $request->input('kunci_idempoten');
        if (! is_string($kunci) || $kunci === '') {
            throw GalatApi::validasi(['kunci_idempoten' => 'VALIDASI']);
        }
        $hasil = Idempotensi::jalankan($p->id, $endpoint, $kunci, fn () => ['status' => 200, 'respons' => ['data' => $operasi()]]);

        return new JsonResponse($hasil['respons'], $hasil['status']);
    }
}
