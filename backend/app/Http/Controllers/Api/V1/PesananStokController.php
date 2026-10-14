<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Stok\LayananStok;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller untuk transaksi pesanan stok (F-07).
 */
class PesananStokController extends Controller
{
    public function __construct(
        protected LayananStok $layananStok
    ) {}

    protected function periksaSakelar(): void
    {
        if (! config('fitur.stok', true)) {
            throw new GalatApi('BELUM_TERSEDIA');
        }
    }

    protected function pengguna(Request $request): Pengguna
    {
        /** @var Pengguna|null $p */
        $p = $request->user();
        if (! $p) {
            throw new GalatApi('BELUM_MASUK');
        }

        return $p;
    }

    /**
     * GET /api/v1/pesanan-stok/saya
     */
    public function saya(Request $request): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $daftar = $this->layananStok->pesananSaya($p);

        return response()->json(['data' => $daftar]);
    }

    /**
     * POST /api/v1/pesanan-stok/{id}/terima
     */
    public function terima(Request $request, string $id): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $hasil = $this->layananStok->terimaPesanan($p, $id);

        return response()->json(['data' => $hasil]);
    }

    /**
     * POST /api/v1/pesanan-stok/{id}/tolak
     */
    public function tolak(Request $request, string $id): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $alasan = $request->input('alasan');
        $hasil = $this->layananStok->tolakPesanan($p, $id, $alasan ? (string) $alasan : null);

        return response()->json(['data' => $hasil]);
    }

    /**
     * POST /api/v1/pesanan-stok/{id}/dikirim
     */
    public function dikirim(Request $request, string $id): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $hasil = $this->layananStok->kirimPesanan($p, $id);

        return response()->json(['data' => $hasil]);
    }

    /**
     * POST /api/v1/pesanan-stok/{id}/selesai
     */
    public function selesai(Request $request, string $id): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $hasil = $this->layananStok->selesaiPesanan($p, $id);

        return response()->json(['data' => $hasil]);
    }

    /**
     * POST /api/v1/pesanan-stok/{id}/batalkan
     */
    public function batalkan(Request $request, string $id): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $alasan = $request->input('alasan');
        $hasil = $this->layananStok->batalkanPesanan($p, $id, $alasan ? (string) $alasan : null);

        return response()->json(['data' => $hasil]);
    }
}
