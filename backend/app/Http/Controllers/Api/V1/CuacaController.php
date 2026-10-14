<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Cuaca\LayananCuaca;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CuacaController extends Controller
{
    public function __construct(
        protected LayananCuaca $layananCuaca
    ) {}

    /**
     * GET /api/v1/cuaca
     */
    public function sekarang(Request $request): JsonResponse
    {
        /** @var Pengguna|null $pengguna */
        $pengguna = $request->user();
        if (! $pengguna) {
            throw new GalatApi('BELUM_MASUK');
        }

        $data = $this->layananCuaca->ambilCuacaPetani($pengguna);

        return response()->json([
            'data' => $data,
        ]);
    }
}
