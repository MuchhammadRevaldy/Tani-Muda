<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Stok\LayananStok;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller untuk pengelolaan stok siap jual (PRD Tambahan F-07).
 */
class StokController extends Controller
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
     * GET /api/v1/stok
     */
    public function daftar(Request $request): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        if ($p->peran?->value !== 'petani') {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        $stok = $this->layananStok->daftarStokPetani($p);

        return response()->json(['data' => $stok]);
    }

    /**
     * POST /api/v1/stok
     */
    public function buat(Request $request): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        if ($p->peran?->value !== 'petani') {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        $validated = $request->validate([
            'komoditas_id' => ['required', 'string'],
            'lahan_id' => ['nullable', 'string'],
            'jumlah_kg' => ['required', 'numeric', 'min:0.01'],
            'harga_per_kg' => ['required', 'integer', 'min:1'],
            'tanggal_panen' => ['required', 'date'],
            'foto' => ['nullable', 'string'],
        ]);

        $stok = $this->layananStok->tambahStok($p, $validated);

        return response()->json(['data' => $stok], 201);
    }

    /**
     * PATCH /api/v1/stok/{id}
     */
    public function ubah(Request $request, string $id): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        if ($p->peran?->value !== 'petani') {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        $validated = $request->validate([
            'harga_per_kg' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'string', 'in:tersedia,habis,ditarik'],
            'foto' => ['nullable', 'string'],
        ]);

        $stok = $this->layananStok->ubahStok($p, $id, $validated);

        return response()->json(['data' => $stok]);
    }

    /**
     * GET /api/v1/stok/sekitar
     */
    public function sekitar(Request $request): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $komoditasId = $request->query('komoditas');
        $radiusKm = (int) ($request->query('radius_km', 15));

        $stok = $this->layananStok->ambilStokSekitar($p, $komoditasId ? (string) $komoditasId : null, $radiusKm);

        return response()->json(['data' => $stok]);
    }

    /**
     * POST /api/v1/stok/{id}/beli
     */
    public function beli(Request $request, string $id): JsonResponse
    {
        $this->periksaSakelar();
        $p = $this->pengguna($request);

        $validated = $request->validate([
            'jumlah_kg' => ['required', 'numeric', 'min:0.01'],
            'metode_bayar' => ['required', 'string', 'in:cod,bayar_di_aplikasi'],
            'alamat_antar' => ['required', 'string', 'min:3'],
            'kunci_idempoten' => ['nullable', 'string'],
        ]);

        /** @var array{jumlah_kg: float|int, metode_bayar: 'cod'|'bayar_di_aplikasi', alamat_antar: string, kunci_idempoten?: string|null} $validated */
        $pesananStok = $this->layananStok->beliStok($p, $id, $validated);

        return response()->json(['data' => $pesananStok], 201);
    }
}
