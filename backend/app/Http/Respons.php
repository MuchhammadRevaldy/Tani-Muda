<?php

namespace App\Http;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Bentuk respons sukses kontrak-api.md bagian 1.2 dan 1.3.
 */
final class Respons
{
    public const PER_HALAMAN_BAWAAN = 20;

    public const PER_HALAMAN_MAKS = 100;

    /** `{ "data": … }` */
    public static function data(mixed $data, int $status = 200): JsonResponse
    {
        return new JsonResponse(['data' => $data], $status);
    }

    /** `{ "data": [ … ], "meta": { halaman, per_halaman, total, halaman_terakhir } }` */
    public static function halaman(LengthAwarePaginator $p, ?callable $bentuk = null): JsonResponse
    {
        $isi = $bentuk === null ? $p->items() : array_map($bentuk, $p->items());

        return new JsonResponse([
            'data' => array_values($isi),
            'meta' => [
                'halaman' => $p->currentPage(),
                'per_halaman' => $p->perPage(),
                'total' => $p->total(),
                'halaman_terakhir' => $p->lastPage(),
            ],
        ]);
    }

    /**
     * Parameter `?halaman=&per_halaman=`. Bawaan 20, maksimal 100; nilai di luar batas dipotong ke
     * batas terdekat, nilai yang bukan angka memakai bawaan.
     *
     * @return array{halaman: int, per_halaman: int}
     */
    public static function paginasi(Request $request): array
    {
        $angka = fn (string $kunci, int $bawaan) => filter_var($request->query($kunci), FILTER_VALIDATE_INT) === false
            ? $bawaan
            : (int) $request->query($kunci);

        return [
            'halaman' => max(1, $angka('halaman', 1)),
            'per_halaman' => min(self::PER_HALAMAN_MAKS, max(1, $angka('per_halaman', self::PER_HALAMAN_BAWAAN))),
        ];
    }
}
