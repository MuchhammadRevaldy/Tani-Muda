<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Resep\Resep;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Komoditas;
use App\Models\MetodeTanam;
use App\Models\Pengguna;
use App\Models\PermintaanResep;
use App\Models\ResepTanam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Resep (kontrak 3.3, D-12, D-44, D-45). */
class ResepController extends Controller
{
    /** Pasangan komoditas dan cara tanam contoh perhitungan halaman depan (lib/contoh-landing.ts). */
    private const PASANGAN_CONTOH_PUBLIK = [['sawi', 'bedengan'], ['padi', 'sawah'], ['bayam', 'bedengan']];

    /** GET /resep?komoditas_id=&metode_id= : versi terbaru yang terlihat. */
    public function daftar(Request $request): JsonResponse
    {
        $q = Resep::terlihat()->with(['input', 'tugas']);
        foreach (['komoditas_id', 'metode_id'] as $kolom) {
            if (is_string($request->query($kolom)) && $request->query($kolom) !== '') {
                $q->where($kolom, $request->query($kolom));
            }
        }

        return Respons::data(Resep::terbaru($q->orderBy('dibuat_pada')->get())->map(Resep::bentuk(...))->all());
    }

    /** GET /resep/{id} */
    public function ambil(Request $request, string $id): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();
        $r = ResepTanam::find($id);
        if ($r === null || ! Resep::bolehDibuka($r, $p)) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        return Respons::data(Resep::bentuk($r));
    }

    /** GET /publik/contoh (tanpa masuk): potongan resep untuk contoh perhitungan halaman depan. */
    public function contohPublik(): JsonResponse
    {
        $resep = Resep::terbaru(Resep::terlihat()->with(['input', 'tugas'])->get());
        $komoditas = Komoditas::query()->orderBy('dibuat_pada')->get();
        $contoh = [];
        foreach (self::PASANGAN_CONTOH_PUBLIK as [$komoditasId, $metodeId]) {
            $r = $resep->first(fn (ResepTanam $x) => $x->komoditas_id === $komoditasId && $x->metode_id === $metodeId);
            $kom = $komoditas->firstWhere('id', $komoditasId);
            if ($r === null || ! $kom?->harga_jual_contoh) {
                continue;
            }
            $contoh[] = [
                'komoditas_id' => $r->komoditas_id,
                'metode_id' => $r->metode_id,
                'contoh' => $r->contoh,
                'harga_jual_contoh' => $kom->harga_jual_contoh,
                'hasil_per_satuan' => $r->hasil_per_satuan,
                'dasar_ukuran' => $r->dasar_ukuran,
                'umur_panen_hari' => $r->umur_panen_hari,
                'input' => $r->input->sortBy('urutan')->map(fn ($i) => [
                    'id' => $i->id, 'nama' => $i->nama, 'grup' => $i->grup, 'dosis' => $i->dosis,
                    'satuan_dosis' => $i->satuan_dosis, 'dasar_dosis' => $i->dasar_dosis, 'satuan_beli' => $i->satuan_beli,
                    'isi_satuan_beli' => $i->isi_satuan_beli, 'ukuran_kemasan' => $i->ukuran_kemasan,
                    'alat_sekali_beli' => $i->alat_sekali_beli, 'harga_contoh' => $i->harga_contoh,
                ])->values()->all(),
                'tugas' => $r->tugas->sortBy('urutan')->map(fn ($t) => [
                    'id' => $t->id, 'tipe' => $t->tipe, 'judul' => $t->judul, 'hst_mulai' => $t->hst_mulai,
                    'hst_selesai' => $t->hst_selesai, 'interval' => $t->interval,
                    'langkah_pertama' => $t->cara_mengerjakan[0] ?? null,
                ])->values()->all(),
            ];
        }
        $berresep = $resep->pluck('komoditas_id')->all();

        return Respons::data([
            'komoditas' => $komoditas->map(fn (Komoditas $k) => [
                'id' => $k->id, 'nama' => $k->nama, 'satuan_panen' => $k->satuan_panen,
                'status_resep' => in_array($k->id, $berresep, true) ? 'tersedia' : 'segera_hadir',
            ])->all(),
            'contoh' => $contoh,
        ]);
    }

    /** POST /permintaan-resep (petani): tidak ganda per komoditas + metode. */
    public function minta(Request $request): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();
        $komoditasId = $request->input('komoditas_id');
        $metodeId = $request->input('metode_id');
        if (! is_string($komoditasId) || ! Komoditas::whereKey($komoditasId)->exists()) {
            throw GalatApi::validasi(['komoditas_id' => 'TIDAK_DITEMUKAN']);
        }
        if ($metodeId !== null && (! is_string($metodeId) || ! MetodeTanam::whereKey($metodeId)->exists())) {
            throw GalatApi::validasi(['metode_id' => 'TIDAK_DITEMUKAN']);
        }
        $lama = PermintaanResep::where('pengguna_id', $p->id)->where('komoditas_id', $komoditasId)
            ->where('metode_id', $metodeId)->first();
        if ($lama !== null) {
            return Respons::data(['permintaan' => self::permintaan($lama), 'sudah_diminta' => true]);
        }
        $baru = PermintaanResep::forceCreate([
            'pengguna_id' => $p->id, 'komoditas_id' => $komoditasId, 'metode_id' => $metodeId, 'wilayah_id' => $p->wilayah_id,
        ]);

        return Respons::data(['permintaan' => self::permintaan($baru->refresh()), 'sudah_diminta' => false]);
    }

    /** GET /permintaan-resep/saya (petani) */
    public function permintaanSaya(Request $request): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();

        return Respons::data(PermintaanResep::where('pengguna_id', $p->id)->orderBy('dibuat_pada')->get()->map(self::permintaan(...))->all());
    }

    /** @return array<string, mixed> */
    private static function permintaan(PermintaanResep $x): array
    {
        $data = $x->toArray();
        unset($data['metode_kunci']);

        return $data;
    }
}
