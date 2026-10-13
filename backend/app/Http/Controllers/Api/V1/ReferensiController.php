<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Angka;
use App\Domain\Hitung\Uang;
use App\Domain\Jual\Sekitar;
use App\Domain\Resep\Resep;
use App\Enums\Peran;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\InputPertanian;
use App\Models\KelayakanSubsidi;
use App\Models\Komoditas;
use App\Models\KonversiSatuan;
use App\Models\LaporanHarga;
use App\Models\MerekInput;
use App\Models\MetodeTanam;
use App\Models\Pengguna;
use App\Models\Pesanan;
use App\Models\Promo;
use App\Models\SistemHidroponik;
use App\Models\Wilayah;
use App\Support\HariIni;
use App\Support\Konfigurasi;
use Collator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Referensi (kontrak 3.2): komoditas, metode, sistem hidroponik, konversi, konfigurasi, promo, subsidi. */
class ReferensiController extends Controller
{
    /** GET /komoditas?jenis_lahan= */
    public function komoditas(Request $request): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();
        $jenisLahan = $request->query('jenis_lahan');
        $berresep = Resep::terlihat()->distinct()->pluck('komoditas_id')->all();
        $radius = Konfigurasi::angka('radius_km');
        $terbuka = $p->peran === Peran::Petani
            ? Pesanan::query()->get()->filter(function (Pesanan $ps) use ($p, $radius) {
                $j = Sekitar::jarakKm($p, $ps);

                return Sekitar::terbuka($ps) && $j !== null && $j <= $radius;
            })
            : collect();

        $hasil = Komoditas::query()->orderBy('dibuat_pada')->get()
            ->filter(fn (Komoditas $k) => ! is_string($jenisLahan) || $jenisLahan === '' || in_array($jenisLahan, $k->jenis_lahan_cocok ?? [], true))
            ->map(fn (Komoditas $k) => self::tanpaWaktu($k->toArray()) + [
                'status_resep' => in_array($k->id, $berresep, true) ? 'tersedia' : 'segera_hadir',
                'jumlah_pesanan_sekitar' => $terbuka->where('komoditas_id', $k->id)->count(),
            ]);

        return Respons::data($hasil->values()->all());
    }

    /** GET /metode */
    public function metode(): JsonResponse
    {
        return Respons::data(MetodeTanam::query()->orderBy('dibuat_pada')->get()->map(fn ($m) => self::tanpaWaktu($m->toArray()))->all());
    }

    /** GET /sistem-hidroponik */
    public function sistemHidroponik(): JsonResponse
    {
        return Respons::data(SistemHidroponik::query()->orderBy('dibuat_pada')->get()->map(fn ($m) => self::tanpaWaktu($m->toArray()))->all());
    }

    /** GET /konversi-satuan?wilayah_id= */
    public function konversiSatuan(Request $request): JsonResponse
    {
        $wilayahId = (string) $request->query('wilayah_id');
        if (! Wilayah::whereKey($wilayahId)->exists()) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        return Respons::data(KonversiSatuan::where('wilayah_id', $wilayahId)->orderBy('nomor')->get()
            ->map(fn ($k) => ['wilayah_id' => $k->wilayah_id, 'satuan' => $k->satuan, 'nilai_m2' => $k->nilai_m2])->all());
    }

    /** GET /konfigurasi (publik) */
    public function konfigurasi(): JsonResponse
    {
        return Respons::data(Konfigurasi::semua());
    }

    /** GET /promo: berlaku hari ini di kecamatan pengguna (P0-35). */
    public function promo(Request $request): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();
        $hariIni = HariIni::untuk($p);
        $kecamatan = Wilayah::find($p->wilayah_id)?->kecamatan;
        $hasil = Promo::with('wilayah')->get()->filter(fn (Promo $x) => $x->wilayah?->kecamatan === $kecamatan
            && $x->berlaku_mulai->toDateString() <= $hariIni && $hariIni <= $x->berlaku_sampai->toDateString());

        return Respons::data($hasil->map(fn ($x) => self::tanpaWaktu($x->withoutRelations()->toArray()))->values()->all());
    }

    /** GET /kelayakan-subsidi?komoditas_id= */
    public function kelayakanSubsidi(Request $request): JsonResponse
    {
        return Respons::data(KelayakanSubsidi::where('komoditas_id', (string) $request->query('komoditas_id'))->orderBy('nomor')->get()
            ->map(fn ($k) => array_diff_key($k->toArray(), array_flip(['nomor', 'dibuat_pada'])))->all());
    }

    /** GET /harga-sekitar?input_id= : rata-rata laporan di kecamatan pengguna (P1-02, D-38). */
    public function hargaSekitar(Request $request): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();
        $inputId = (string) $request->query('input_id');
        $isi = MerekInput::where('input_id', $inputId)->pluck('isi_kemasan', 'id')->map(fn ($x) => (float) $x)->all();
        $laporan = LaporanHarga::whereIn('merek_id', array_keys($isi))->get()
            ->map(fn ($l) => ['merek_id' => $l->merek_id, 'harga_kemasan' => $l->harga_kemasan, 'kecamatan' => $l->kecamatan, 'tanggal' => $l->tanggal->toDateString()])
            ->all();
        $kecamatan = (string) Wilayah::find($p->wilayah_id)?->kecamatan;
        $hariIni = HariIni::untuk($p);
        $rentang = (int) Konfigurasi::angka('laporan_harga_rentang_hari');
        $jumlah = count(array_filter($laporan, function ($l) use ($kecamatan, $hariIni, $rentang) {
            $umur = Angka::selisihHari($l['tanggal'], $hariIni);

            return $l['kecamatan'] === $kecamatan && $umur >= 0 && $umur <= $rentang;
        }));

        return Respons::data([
            'input_id' => $inputId,
            'harga_per_satuan' => Uang::rataRataSekitar($laporan, $isi, $kecamatan, $hariIni, $rentang, (int) Konfigurasi::angka('laporan_harga_minimal')),
            'jumlah_laporan' => $jumlah,
        ]);
    }

    /**
     * GET /input/{id}/merek: merek terurut laporan terbaru di kecamatan pengguna, lalu jumlah pelapor,
     * lalu nama; merek tanpa laporan di akhir (P0-34, urutkanMerek di lib/harga-item.ts) ([AG-19]).
     */
    public function merek(Request $request, string $id): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();
        if (! InputPertanian::whereKey($id)->exists()) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }
        $kecamatan = (string) Wilayah::find($p->wilayah_id)?->kecamatan;
        $hariIni = HariIni::untuk($p);
        $merek = MerekInput::where('input_id', $id)->orderBy('id')->get();
        $laporan = LaporanHarga::whereIn('merek_id', $merek->pluck('id'))->where('kecamatan', $kecamatan)
            ->orderBy('id')->get()
            ->filter(fn (LaporanHarga $l) => Angka::selisihHari($l->tanggal->toDateString(), $hariIni) >= 0);
        $ringkas = $merek->map(function (MerekInput $m) use ($laporan, $hariIni) {
            $milik = $laporan->where('merek_id', $m->id)->sortByDesc(fn (LaporanHarga $l) => $l->tanggal->toDateString())->values();
            /** @var LaporanHarga|null $terbaru */
            $terbaru = $milik->first();

            return [
                'merek' => self::tanpaWaktu($m->toArray()),
                'harga_kemasan' => $terbaru?->harga_kemasan,
                'harga_per_satuan' => $terbaru && $m->isi_kemasan > 0 ? $terbaru->harga_kemasan / $m->isi_kemasan : null,
                'jumlah_pelapor' => $milik->pluck('pelapor_id')->unique()->count(),
                'hari_lalu' => $terbaru ? Angka::selisihHari($terbaru->tanggal->toDateString(), $hariIni) : null,
                'terbaru' => $terbaru?->tanggal->toDateString(),
            ];
        })->all();
        $kolator = new Collator('id');
        usort($ringkas, function (array $a, array $b) use ($kolator) {
            if ($a['terbaru'] !== $b['terbaru']) {
                return $a['terbaru'] === null ? 1 : ($b['terbaru'] === null ? -1 : strcmp($b['terbaru'], $a['terbaru']));
            }

            return ($b['jumlah_pelapor'] <=> $a['jumlah_pelapor']) ?: (int) $kolator->compare($a['merek']['nama'], $b['merek']['nama']);
        });

        return Respons::data(array_map(function (array $r) {
            unset($r['terbaru']);

            return $r;
        }, $ringkas));
    }

    /** @param  array<string, mixed>  $data */
    public static function tanpaWaktu(array $data): array
    {
        unset($data['dibuat_pada']);

        return $data;
    }
}
