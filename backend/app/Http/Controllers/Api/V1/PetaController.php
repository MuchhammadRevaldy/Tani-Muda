<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Jarak;
use App\Domain\Hitung\Level;
use App\Enums\Peran;
use App\Enums\StatusAkun;
use App\Enums\StatusStok;
use App\Enums\StatusVerifikasi;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Pengguna;
use App\Models\Stok;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller untuk F-08: Peta Petani di sekitar pembeli (D-64).
 */
class PetaController extends Controller
{
    /**
     * GET /peta/petani?lintang=&bujur=&radius_km=10|15
     */
    public function petaniSekitar(Request $request): JsonResponse
    {
        if (! config('fitur.peta', true)) {
            throw new GalatApi('BELUM_TERSEDIA');
        }

        /** @var Pengguna $pembeli */
        $pembeli = $request->user();

        // 1. Verifikasi peran: hanya pembeli
        if ($pembeli->peran !== Peran::Pembeli) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        // 2. Verifikasi status pembeli: hanya pembeli terverifikasi (F-08, D-64)
        $profil = $pembeli->profilPembeli;
        if (! $profil || $profil->status_verifikasi !== StatusVerifikasi::Terverifikasi) {
            throw new GalatApi('BELUM_TERVERIFIKASI');
        }

        // 3. Tentukan titik pusat pembeli
        $lintang = $request->input('lintang');
        $bujur = $request->input('bujur');

        if ($lintang === null || $bujur === null) {
            // Ambil dari titik desa tempat usaha pembeli
            $titikDesa = Jarak::titik($profil->wilayah);
            if ($titikDesa !== null) {
                $lintang = $titikDesa['lintang'];
                $bujur = $titikDesa['bujur'];
            }
        }

        if ($lintang === null || $bujur === null) {
            throw GalatApi::validasi(['lokasi' => 'VALIDASI']);
        }

        $pusat = [
            'lintang' => (float) $lintang,
            'bujur' => (float) $bujur,
        ];

        $radiusKm = (int) $request->input('radius_km', 10);
        if ($radiusKm !== 15) {
            $radiusKm = 10;
        }

        // 4. Kueri petani yang tampil di peta dan memiliki koordinat perkiraan
        // Titik tampil hanya bila petani punya stok tersedia atau menerima pesanan (F-08)
        $petaniList = Pengguna::query()
            ->where('peran', Peran::Petani->value)
            ->where('status_akun', StatusAkun::Aktif->value)
            ->where('tampil_di_peta', true)
            ->whereNotNull('lokasi_kira_lintang')
            ->whereNotNull('lokasi_kira_bujur')
            ->where(function ($q) {
                $q->whereHas('stok', function ($sq) {
                    $sq->where('status', StatusStok::Tersedia->value)
                        ->where('sisa_kg', '>', 0);
                })->orWhereHas('alokasi', function ($aq) {
                    $aq->whereIn('status', ['menunggu', 'disetujui']);
                });
            })
            ->with(['stok' => function ($sq) {
                $sq->where('status', StatusStok::Tersedia->value)
                    ->where('sisa_kg', '>', 0)
                    ->with('komoditas');
            }])
            ->get();

        $hasil = [];

        foreach ($petaniList as $petani) {
            $titikPetani = [
                'lintang' => (float) $petani->lokasi_kira_lintang,
                'bujur' => (float) $petani->lokasi_kira_bujur,
            ];

            if (! Jarak::dalamRadius($titikPetani, $pusat, $radiusKm)) {
                continue;
            }

            $jarak = Jarak::jarakKm($titikPetani, $pusat);

            // Level petani (F-03)
            $poin = (int) DB::table('tugas')
                ->join('siklus_tanam', 'tugas.siklus_id', '=', 'siklus_tanam.id')
                ->where('siklus_tanam.petani_id', $petani->id)
                ->where('tugas.status', 'selesai')
                ->count() * 10;
            $levelInfo = Level::levelDariPoin($poin);

            $stokTersedia = $petani->stok->map(fn (Stok $s) => [
                'id' => $s->id,
                'komoditas_id' => $s->komoditas_id,
                'komoditas_nama' => $s->komoditas->nama,
                'sisa_kg' => (float) $s->sisa_kg,
                'harga_per_kg' => (int) $s->harga_per_kg,
                'tanggal_panen' => $s->tanggal_panen->toDateString(),
                'foto' => $s->foto,
            ])->values()->all();

            // PENTING: D-64 & F-08: nomor HP TIDAK BOLEH tampil di respon
            $hasil[] = [
                'id' => $petani->id,
                'nama' => $petani->nama ?? 'Petani Tani Muda',
                'level' => [
                    'level' => $levelInfo['level'],
                    'ikon' => $levelInfo['ikon'],
                ],
                'titik' => [
                    'lintang' => (float) $petani->lokasi_kira_lintang,
                    'bujur' => (float) $petani->lokasi_kira_bujur,
                ],
                'jarak_km' => round($jarak, 1),
                'stok_tersedia' => $stokTersedia,
            ];
        }

        // Urutkan dari yang terdekat
        usort($hasil, fn ($a, $b) => $a['jarak_km'] <=> $b['jarak_km']);

        return Respons::data($hasil);
    }
}
