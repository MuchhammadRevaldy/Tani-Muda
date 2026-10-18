<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Jarak;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Wilayah;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Wilayah (kontrak 2.3 dan 3.2, D-56, D-57, D-67). */
class WilayahController extends Controller
{
    /**
     * GET /wilayah/kabupaten (D-67, AG-41)
     * Daftar kabupaten/kota, disaring provinsi aktif (bawaan: 33 Jawa Tengah).
     */
    public function kabupaten(Request $request): JsonResponse
    {
        $provinsi = (string) $request->query('provinsi', config('tani_muda.wilayah_provinsi_aktif', '33'));
        $q = WilayahKabupaten::query();
        if ($provinsi !== '' && $provinsi !== 'semua') {
            $q->where('provinsi_id', $provinsi);
        }
        $data = $q->orderBy('nama')->get(['id', 'nama', 'provinsi_id', 'lintang', 'bujur']);

        return Respons::data($data);
    }

    /**
     * GET /wilayah/kecamatan?kabupaten= (D-67, AG-41)
     * Daftar kecamatan dalam kabupaten/kota tertentu.
     */
    public function kecamatan(Request $request): JsonResponse
    {
        $request->validate([
            'kabupaten' => ['required', 'string'],
        ]);

        $kabupatenId = (string) $request->query('kabupaten');
        $data = WilayahKecamatan::query()
            ->where('kabupaten_id', $kabupatenId)
            ->orderBy('nama')
            ->get(['id', 'nama', 'kabupaten_id', 'lintang', 'bujur']);

        return Respons::data($data);
    }

    /**
     * GET /wilayah/desa?kecamatan=&cari= (D-67, AG-41)
     * Daftar desa/kelurahan dalam kecamatan tertentu, dengan opsi cari nama.
     */
    public function desa(Request $request): JsonResponse
    {
        $request->validate([
            'kecamatan' => ['required', 'string'],
        ]);

        $kecamatanId = (string) $request->query('kecamatan');
        $cari = trim((string) $request->query('cari', ''));

        $q = Wilayah::query()->where(function ($query) use ($kecamatanId) {
            $query->where('kecamatan_id', $kecamatanId)
                ->orWhere('id', 'like', "{$kecamatanId}.%");
        });

        if ($cari !== '') {
            $pola = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $cari);
            $q->where('desa', 'like', "%{$pola}%");
        }

        $data = $q->orderBy('desa')->get();

        return Respons::data($data->map(self::bentuk(...)));
    }

    /**
     * GET /wilayah?cari= : desa tersedia di pilot lebih dulu (D-57). Di dalamnya, desa yang namanya
     * cocok dengan kata cari (sama persis, diawali, lalu memuat) sebelum desa yang hanya cocok
     * kecamatannya (D-58), lalu urut nama desa.
     */
    public function daftar(Request $request): JsonResponse
    {
        ['halaman' => $halaman, 'per_halaman' => $per] = Respons::paginasi($request);
        $provinsi = (string) $request->query('provinsi', config('tani_muda.wilayah_provinsi_aktif', '33'));

        $q = Wilayah::query()->orderByRaw('lintang IS NULL');
        if ($provinsi !== '' && $provinsi !== 'semua') {
            $q->where('id', 'like', "{$provinsi}.%");
        }

        $cari = trim((string) $request->query('cari'));
        if ($cari !== '') {
            $pola = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $cari);
            $q->where(fn ($w) => $w->where('desa', 'like', "%{$pola}%")->orWhere('kecamatan', 'like', "%{$pola}%"))
                ->orderByRaw('CASE WHEN desa = ? THEN 0 WHEN desa LIKE ? THEN 1 WHEN desa LIKE ? THEN 2 ELSE 3 END', [$cari, "{$pola}%", "%{$pola}%"]);
        }
        $hasil = $q->orderBy('desa')->orderBy('id')->paginate($per, ['*'], 'halaman', $halaman);

        return Respons::halaman($hasil, self::bentuk(...));
    }

    /**
     * GET /wilayah/terdekat?lintang=&bujur=
     * Cari desa terdekat yang punya titik tengah di tabel wilayah (Haversine, tanpa API luar).
     */
    public function terdekat(Request $request): JsonResponse
    {
        $request->validate([
            'lintang' => ['required', 'numeric'],
            'bujur' => ['required', 'numeric'],
        ]);

        $lintang = (float) $request->query('lintang');
        $bujur = (float) $request->query('bujur');

        $daftarWilayah = Wilayah::query()
            ->whereNotNull('lintang')
            ->whereNotNull('bujur')
            ->get();

        if ($daftarWilayah->isEmpty()) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        $terdekat = null;
        $jarakTerkecil = INF;

        foreach ($daftarWilayah as $w) {
            $jarak = Jarak::jarakKm(
                ['lintang' => $lintang, 'bujur' => $bujur],
                ['lintang' => (float) $w->lintang, 'bujur' => (float) $w->bujur]
            );
            if ($jarak < $jarakTerkecil) {
                $jarakTerkecil = $jarak;
                $terdekat = $w;
            }
        }

        $hasil = self::bentuk($terdekat);
        $hasil['jarak_km'] = round($jarakTerkecil, 2);

        return Respons::data($hasil);
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
