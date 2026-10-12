<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Wilayah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Wilayah (kontrak 2.3 dan 3.2, D-56, D-57). */
class WilayahController extends Controller
{
    /** GET /wilayah?cari= : desa tersedia di pilot lebih dulu, lalu urut nama desa. */
    public function daftar(Request $request): JsonResponse
    {
        ['halaman' => $halaman, 'per_halaman' => $per] = Respons::paginasi($request);
        $q = Wilayah::query();
        $cari = trim((string) $request->query('cari'));
        if ($cari !== '') {
            $q->where(fn ($w) => $w->where('desa', 'like', "%{$cari}%")->orWhere('kecamatan', 'like', "%{$cari}%"));
        }
        $hasil = $q->orderByRaw('lintang IS NULL')->orderBy('desa')->orderBy('id')
            ->paginate($per, ['*'], 'halaman', $halaman);

        return Respons::halaman($hasil, self::bentuk(...));
    }

    /** GET /wilayah/{id} */
    public function ambil(string $id): JsonResponse
    {
        return Respons::data(self::bentuk(Wilayah::find($id) ?? throw new GalatApi('TIDAK_DITEMUKAN')));
    }

    /** `Wilayah`: tanpa kolom khusus server, dengan `tersedia_pilot` (D-56). */
    public static function bentuk(Wilayah $w): array
    {
        return [
            'id' => $w->id,
            'desa' => $w->desa,
            'kecamatan' => $w->kecamatan,
            'kabupaten' => $w->kabupaten,
            'provinsi' => $w->provinsi,
            'lintang' => $w->lintang,
            'bujur' => $w->bujur,
            'tersedia_pilot' => $w->lintang !== null && $w->bujur !== null,
        ];
    }
}
