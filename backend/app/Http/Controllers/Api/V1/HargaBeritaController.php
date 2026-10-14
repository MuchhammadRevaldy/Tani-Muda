<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Berita\LayananHargaBerita;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller untuk F-10: Harga panen dari pemantauan berita.
 */
class HargaBeritaController extends Controller
{
    public function __construct(
        protected LayananHargaBerita $layanan
    ) {}

    /**
     * GET /api/v1/harga-berita?komoditas_id=
     */
    public function daftar(Request $request): JsonResponse
    {
        $komoditasId = (string) $request->query('komoditas_id', '');
        if (empty($komoditasId)) {
            throw GalatApi::validasi(['komoditas_id' => 'VALIDASI']);
        }

        /** @var Pengguna|null $pengguna */
        $pengguna = $request->user();

        // Tentukan kabupaten dari wilayah pengguna
        $kabupaten = 'Kabupaten Bandung Barat';
        if ($pengguna && $pengguna->wilayah_id) {
            $wilayah = DB::table('wilayah')->where('id', $pengguna->wilayah_id)->first();
            if ($wilayah && ! empty($wilayah->kabupaten)) {
                $kabupaten = $wilayah->kabupaten;
            }
        }

        $hasil = $this->layanan->ambilHargaTerbaru($komoditasId, $kabupaten);

        return response()->json($hasil);
    }
}
