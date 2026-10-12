<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Hasil;
use App\Domain\Hitung\Kebun;
use App\Domain\Kebun\LayananKebun;
use App\Enums\JenisLahan;
use App\Enums\StatusSiklus;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Lahan;
use App\Models\Pengguna;
use App\Models\SiklusTanam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Lahan petani (kontrak 3.4, D-06, D-15, D-56). */
class LahanController extends Controller
{
    /** GET /lahan */
    public function daftar(Request $request): JsonResponse
    {
        return Respons::data(Lahan::where('petani_id', $this->petani($request)->id)->orderBy('dibuat_pada')->orderBy('id')->get()
            ->map(LayananKebun::bentukLahan(...))->all());
    }

    /** POST /lahan */
    public function buat(Request $request): JsonResponse
    {
        $p = $this->petani($request);
        $m = $request->all();
        self::validasi($m, true);
        $luas = Hasil::buka(Kebun::keM2($m['nilai_asli'] ?? null, (string) ($m['satuan_asli'] ?? ''), LayananKebun::konversiWilayah($m['wilayah_id'])), 'nilai_asli');
        $lahan = Lahan::forceCreate([
            'petani_id' => $p->id,
            'nama' => trim((string) $m['nama']),
            'jenis_lahan' => $m['jenis_lahan'],
            'luas_m2' => $luas,
            'satuan_asli' => $m['satuan_asli'],
            'nilai_asli' => $m['nilai_asli'],
            'wilayah_id' => $m['wilayah_id'],
            'lintang' => $m['lintang'] ?? null,
            'bujur' => $m['bujur'] ?? null,
            'kapasitas_lubang' => $m['jenis_lahan'] === JenisLahan::Hidroponik->value ? $m['kapasitas_lubang'] : null,
        ]);

        return Respons::data(LayananKebun::bentukLahan($lahan->refresh()));
    }

    /** PATCH /lahan/{id} */
    public function ubah(Request $request, string $id): JsonResponse
    {
        $lahan = $this->milik($request, $id);
        $m = $request->all();
        $gabung = array_merge([
            'jenis_lahan' => $lahan->jenis_lahan->value, 'kapasitas_lubang' => $lahan->kapasitas_lubang,
            'nilai_asli' => $lahan->nilai_asli, 'satuan_asli' => $lahan->satuan_asli, 'wilayah_id' => $lahan->wilayah_id,
        ], $m);
        self::validasi(['jenis_lahan' => $gabung['jenis_lahan'], 'kapasitas_lubang' => $gabung['kapasitas_lubang']] + $m, false);
        $ubah = array_intersect_key($m, array_flip(['nama', 'jenis_lahan', 'satuan_asli', 'nilai_asli', 'wilayah_id', 'lintang', 'bujur', 'kapasitas_lubang']));
        if (isset($ubah['nama'])) {
            $ubah['nama'] = trim((string) $ubah['nama']);
        }
        if (array_key_exists('nilai_asli', $m) || array_key_exists('satuan_asli', $m)) {
            $ubah['luas_m2'] = Hasil::buka(Kebun::keM2($gabung['nilai_asli'], (string) $gabung['satuan_asli'], LayananKebun::konversiWilayah($gabung['wilayah_id'])), 'nilai_asli');
        }
        $lahan->forceFill($ubah)->save();

        return Respons::data(LayananKebun::bentukLahan($lahan->refresh()));
    }

    /** DELETE /lahan/{id}: ditolak selama lahan dipakai siklus yang belum selesai (P0-04). */
    public function hapus(Request $request, string $id): Response
    {
        $lahan = $this->milik($request, $id);
        if (SiklusTanam::where('lahan_id', $id)->where('status', '!=', StatusSiklus::Selesai->value)->exists()) {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }
        $lahan->delete();

        return response()->noContent();
    }

    /** @param  array<string, mixed>  $m */
    private static function validasi(array $m, bool $lengkap): void
    {
        $salah = [];
        if (($lengkap || array_key_exists('nama', $m)) && trim((string) ($m['nama'] ?? '')) === '') {
            $salah['nama'] = 'VALIDASI';
        }
        if ($lengkap && JenisLahan::tryFrom((string) ($m['jenis_lahan'] ?? '')) === null) {
            $salah['jenis_lahan'] = 'VALIDASI';
        }
        if ($lengkap || array_key_exists('wilayah_id', $m)) {
            if (! AkunController::wilayahAda($m['wilayah_id'] ?? null)) {
                $salah['wilayah_id'] = 'TIDAK_DITEMUKAN';
            } elseif (! AkunController::wilayahTersedia($m['wilayah_id'])) {
                $salah['wilayah_id'] = 'WILAYAH_BELUM_TERSEDIA';
            }
        }
        $lubang = $m['kapasitas_lubang'] ?? null;
        if (($m['jenis_lahan'] ?? null) === JenisLahan::Hidroponik->value && ! (is_int($lubang) && $lubang > 0)) {
            $salah['kapasitas_lubang'] = 'UKURAN_KOSONG';
        }
        if ($salah !== []) {
            throw GalatApi::validasi($salah);
        }
    }

    private function petani(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }

    private function milik(Request $request, string $id): Lahan
    {
        return Lahan::where('id', $id)->where('petani_id', $this->petani($request)->id)->first()
            ?? throw new GalatApi('TIDAK_DITEMUKAN');
    }
}
