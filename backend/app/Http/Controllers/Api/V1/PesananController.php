<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Angka;
use App\Domain\Hitung\Hasil;
use App\Domain\Hitung\Kiriman;
use App\Domain\Hitung\PesananLahan;
use App\Domain\Hitung\Uang;
use App\Domain\Jual\LayananJual;
use App\Domain\Jual\Sekitar;
use App\Domain\Kebun\LayananKebun;
use App\Domain\Pembayaran\PenyediaPembayaran;
use App\Domain\Resep\Resep;
use App\Enums\StatusAkun;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\JawabIdempoten;
use App\Http\Respons;
use App\Models\AlokasiPesanan;
use App\Models\CatatanPetani;
use App\Models\Lahan;
use App\Models\Pengguna;
use App\Models\Pengiriman;
use App\Models\Pesanan;
use App\Models\ResepTanam;
use App\Models\SiklusTanam;
use App\Support\HariIni;
use App\Support\Konfigurasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** Pesanan untuk petani (kontrak 3.7; D-03, D-06, D-13, D-34, D-39, D-40). */
class PesananController extends Controller
{
    public function __construct(private readonly LayananJual $jual, private readonly PenyediaPembayaran $bayar) {}

    /** GET /pesanan/sekitar?jenis=&radius_km= : terbuka, berresep, dalam radius, terdekat dulu. */
    public function sekitar(Request $request): JsonResponse
    {
        $petani = $this->petani($request);
        $radius = $request->has('radius_km') ? (float) $request->query('radius_km') : Konfigurasi::angka('radius_km');
        if (! ($radius > 0) || $radius > Konfigurasi::angka('radius_maks_km')) {
            throw GalatApi::validasi(['radius_km' => 'VALIDASI']);
        }
        $berresep = Resep::terlihat()->distinct()->pluck('komoditas_id')->all();
        $jenis = $request->query('jenis');
        $daftar = Pesanan::orderBy('dibuat_pada')->orderBy('id')->get()
            ->filter(fn (Pesanan $x) => Sekitar::terbuka($x) && in_array($x->komoditas_id, $berresep, true) && (! $jenis || $x->jenis->value === $jenis))
            ->map(fn (Pesanan $x) => ['x' => $x, 'jarak' => Sekitar::jarakKm($petani, $x)])
            ->filter(fn ($x) => $x['jarak'] !== null && $x['jarak'] <= $radius)
            ->values()
            ->sortBy([['jarak', 'asc']])
            ->map(fn ($x) => LayananJual::untukPetani($petani, $x['x']))
            ->values();
        ['halaman' => $halaman, 'per_halaman' => $per] = Respons::paginasi($request);

        return Respons::halaman(new LengthAwarePaginator($daftar->forPage($halaman, $per)->values(), $daftar->count(), $per, $halaman));
    }

    /** GET /pesanan/{id}: yang belum dibayar uang mukanya → 404. */
    public function ambil(Request $request, string $id): JsonResponse
    {
        return Respons::data(LayananJual::untukPetani($this->petani($request), $this->pesananTerbayar($id)));
    }

    /** POST /pesanan/{id}/ambil (idempoten): pesanan dikunci baris supaya alokasi tidak melebihi sisa. */
    public function ambilPesanan(Request $request, string $id): JsonResponse
    {
        $petani = $this->petani($request);

        return JawabIdempoten::jalankan($request, $petani, "ambil-pesanan:{$id}", function () use ($request, $petani, $id) {
            if ($petani->status_akun !== StatusAkun::Aktif) {
                throw new GalatApi('AKUN_NONAKTIF');
            }
            $pesanan = Pesanan::whereKey($id)->where('status', '!=', 'menunggu_pembayaran')->lockForUpdate()->first()
                ?? throw new GalatApi('TIDAK_DITEMUKAN');
            if (! Sekitar::terbuka($pesanan) || LayananJual::alokasiPetani($petani->id, $id)) {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $lahan = Lahan::where('id', (string) $request->input('lahan_id'))->where('petani_id', $petani->id)->first()
                ?? throw new GalatApi('TIDAK_DITEMUKAN');
            $jumlah = $request->input('jumlah_kg');
            if (! is_numeric($jumlah) || ! ($jumlah > 0)) {
                throw GalatApi::validasi(['jumlah_kg' => 'JUMLAH_KOSONG']);
            }
            Hasil::buka(PesananLahan::batasAlokasi(
                $pesanan->jumlah_per_kiriman_kg ?? $pesanan->jumlah_total_kg,
                AlokasiPesanan::where('pesanan_id', $id)->whereIn('status', Sekitar::ALOKASI_AKTIF)->pluck('jumlah_kg')->map(fn ($x) => (float) $x)->all(),
                $jumlah,
            ), 'jumlah_kg');
            $resep = self::resepUntuk($pesanan->komoditas_id, $lahan) ?? throw GalatApi::validasi(['lahan_id' => 'STATUS_TIDAK_SESUAI']);
            $alokasi = new AlokasiPesanan;
            $alokasi->forceFill(['pesanan_id' => $id, 'petani_id' => $petani->id, 'jumlah_kg' => $jumlah, 'status' => 'menunggu_kesepakatan']);
            $alokasi->id = Str::lower((string) Str::ulid());
            $alokasi->save();
            $siklus = LayananJual::buatSiklusPesanan($petani, $pesanan, $lahan, $resep, (float) $jumlah, $alokasi->id);
            self::segarkanTerambil($pesanan);

            return ['alokasi' => LayananJual::bentukAlokasi($alokasi->refresh()), 'siklus_ids' => array_map(fn ($s) => $s->id, $siklus)];
        });
    }

    /** PATCH /alokasi/{id}: jumlah diubah sebelum setuju; petak dibuat ulang (D-40). */
    public function ubahAlokasi(Request $request, string $id): JsonResponse
    {
        $petani = $this->petani($request);
        $hasil = DB::transaction(function () use ($request, $petani, $id) {
            $a = $this->alokasi($petani, $id);
            if ($a->status->value !== 'menunggu_kesepakatan') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $jumlah = $request->input('jumlah_kg');
            if (! is_numeric($jumlah) || ! ($jumlah > 0)) {
                throw GalatApi::validasi(['jumlah_kg' => 'JUMLAH_KOSONG']);
            }
            $pesanan = Pesanan::lockForUpdate()->findOrFail($a->pesanan_id);
            Hasil::buka(PesananLahan::batasAlokasi(
                $pesanan->jumlah_per_kiriman_kg ?? $pesanan->jumlah_total_kg,
                AlokasiPesanan::where('pesanan_id', $pesanan->id)->where('id', '!=', $a->id)->whereIn('status', Sekitar::ALOKASI_AKTIF)->pluck('jumlah_kg')->map(fn ($x) => (float) $x)->all(),
                $jumlah,
            ), 'jumlah_kg');
            $lama = SiklusTanam::where('alokasi_pesanan_id', $a->id)->orderBy('petak_ke')->get();
            $pertama = $lama->first() ?? throw new GalatApi('STATUS_TIDAK_SESUAI');
            $lahan = Lahan::findOrFail($pertama->lahan_id);
            $resep = ResepTanam::findOrFail($pertama->resep_id);
            // Petak lama dilepas dulu supaya kapasitas dihitung tanpa dirinya; transaksi memulihkan bila gagal.
            $lama->each(fn ($s) => LayananJual::hapusSiklus($s));
            $siklus = LayananJual::buatSiklusPesanan($petani, $pesanan, $lahan, $resep, (float) $jumlah, $a->id);
            $a->forceFill(['jumlah_kg' => $jumlah])->save();
            self::segarkanTerambil($pesanan);

            return ['alokasi' => LayananJual::bentukAlokasi($a->refresh()), 'siklus_ids' => array_map(fn ($s) => $s->id, $siklus)];
        });

        return Respons::data($hasil);
    }

    /** POST /alokasi/{id}/setuju: petak terkejar menjadi aktif dengan tugasnya; jadwal kiriman dibuat (D-39, D-40). */
    public function setujui(Request $request, string $id): JsonResponse
    {
        $petani = $this->petani($request);
        $hasil = DB::transaction(function () use ($petani, $id) {
            $a = $this->alokasi($petani, $id);
            if ($a->status->value !== 'menunggu_kesepakatan') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $p = Pesanan::lockForUpdate()->findOrFail($a->pesanan_id);
            $siklus = SiklusTanam::where('alokasi_pesanan_id', $a->id)->orderBy('petak_ke')->get();
            $umur = $siklus->isEmpty() ? 0 : (int) ResepTanam::whereKey($siklus->first()->resep_id)->value('umur_panen_hari');
            $jadwal = LayananJual::jadwalTerkejar($petani, $p, $umur);
            if ($jadwal === []) {
                throw new GalatApi('JADWAL_TERLALU_DEKAT');
            }
            $a->forceFill(['status' => 'disepakati', 'disetujui_pada' => now()])->save();
            if ($p->jenis->value === 'rutin') {
                $terkejar = array_column($jadwal, 'ke');
                foreach ($siklus as $s) {
                    if ($s->petak_ke === null || ! in_array($s->petak_ke, $terkejar, true)) {
                        LayananJual::hapusSiklus($s);

                        continue;
                    }
                    $s->forceFill(['status' => 'aktif'])->save();
                    LayananKebun::buatTugas($s, $s->tanggal_tanam->toDateString());
                }
            } elseif ($siklus->first()?->status->value === 'rencana') {
                $s = $siklus->first();
                $tanam = Angka::tambahHari($jadwal[0]['tanggal'], -$umur);
                $s->forceFill(['status' => 'aktif', 'tanggal_tanam' => $tanam])->save();
                LayananKebun::buatTugas($s, $tanam);
            }
            $dipenuhi = SiklusTanam::where('alokasi_pesanan_id', $a->id)->pluck('petak_ke')->all();
            foreach ($jadwal as $j) {
                if ($p->jenis->value === 'rutin' && ! in_array($j['ke'], $dipenuhi, true)) {
                    continue;
                }
                Pengiriman::forceCreate([
                    'alokasi_id' => $a->id, 'pesanan_id' => $p->id, 'ke' => $j['ke'], 'tanggal_jadwal' => $j['tanggal'],
                    'jumlah_kg' => $a->jumlah_kg, 'harga_per_kg' => $p->harga_per_kg, 'status' => 'terjadwal',
                    'dianggap_diterima' => false, 'jumlah_ditolak_kg' => 0,
                ]);
            }
            if ($p->status->value === 'mencari_petani') {
                $p->forceFill(['status' => 'berjalan'])->save();
            }

            return LayananJual::bentukAlokasi($a->refresh());
        });

        return Respons::data($hasil);
    }

    /** GET /alokasi/saya */
    public function alokasiSaya(Request $request): JsonResponse
    {
        $petani = $this->petani($request);
        $this->jual->prosesOtomatis();

        return Respons::data(AlokasiPesanan::where('petani_id', $petani->id)->orderBy('dibuat_pada')->get()->map(LayananJual::bentukAlokasi(...))->all());
    }

    /** POST /alokasi/{id}/gagal-panen: tanpa denda; uang muka bagian itu dikembalikan (D-03). */
    public function gagalPanen(Request $request, string $id): JsonResponse
    {
        $petani = $this->petani($request);
        $hasil = DB::transaction(function () use ($request, $petani, $id) {
            $a = $this->alokasi($petani, $id);
            $kiriman = Pengiriman::where('id', (string) $request->input('pengiriman_id'))->where('alokasi_id', $a->id)->first()
                ?? throw new GalatApi('TIDAK_DITEMUKAN');
            if ($kiriman->status->value !== 'terjadwal') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            if (trim((string) $request->input('alasan')) === '') {
                throw GalatApi::validasi(['alasan' => 'VALIDASI']);
            }
            $p = Pesanan::lockForUpdate()->findOrFail($a->pesanan_id);
            $nilaiBagian = Uang::bulatkanRupiah($kiriman->jumlah_kg * $kiriman->harga_per_kg);
            $bagianUangMuka = min($p->saldo_uang_muka, Uang::bulatkanRupiah($nilaiBagian * Konfigurasi::angka('persen_uang_muka') / 100));
            $batas = (int) Konfigurasi::angka('hari_kabar_gagal_panen');
            $r = Kiriman::aturanGagalPanen($kiriman->tanggal_jadwal->toDateString(), HariIni::untuk($petani), $batas, false, $bagianUangMuka);
            $um = LayananJual::refUangMuka($p->id);
            if ($um && $r['dikembalikan'] > 0) {
                $this->bayar->kembalikan($um, (int) $r['dikembalikan']);
                $this->jual->catatBayar(['pesanan_id' => $p->id, 'pengiriman_id' => $kiriman->id, 'jenis' => 'pengembalian',
                    'nominal' => $r['dikembalikan'], 'status' => 'dikembalikan', 'referensi' => $um]);
                $p->forceFill(['saldo_uang_muka' => $p->saldo_uang_muka - $r['dikembalikan']])->save();
            }
            if ($r['catatanProfil']) {
                CatatanPetani::forceCreate(['petani_id' => $petani->id, 'jenis' => 'tidak_memberi_kabar', 'pengiriman_id' => $kiriman->id,
                    'isi' => "Kabar gagal panen kurang dari {$batas} hari sebelum jadwal kirim."]);
            }
            $kiriman->forceFill(['status' => 'gagal'])->save();
            if (! Pengiriman::where('alokasi_id', $a->id)->whereIn('status', ['terjadwal', 'dikirim'])->exists()) {
                $a->forceFill(['status' => 'gagal'])->save();
            }
            self::segarkanTerambil($p);

            return ['tepat_waktu' => $r['tepatWaktu'], 'dikembalikan' => $r['dikembalikan'], 'catatan_profil' => $r['catatanProfil'], 'alokasi' => LayananJual::bentukAlokasi($a->refresh())];
        });

        return Respons::data($hasil);
    }

    /** `terambil_kg` = Σ alokasi aktif (invarian D-53). */
    public static function segarkanTerambil(Pesanan $p): void
    {
        $p->forceFill(['terambil_kg' => round((float) AlokasiPesanan::where('pesanan_id', $p->id)->whereIn('status', Sekitar::ALOKASI_AKTIF)->sum('jumlah_kg'), 2)])->save();
    }

    /** Resep terlihat terbaru untuk komoditas pesanan dengan metode lahan (lib/pesanan-tampil.ts metodeUntukLahan). */
    private static function resepUntuk(string $komoditasId, Lahan $lahan): ?ResepTanam
    {
        $metode = match ($lahan->jenis_lahan->value) {
            'sawah' => 'sawah',
            'hidroponik' => 'hidroponik',
            default => 'bedengan',
        };

        return Resep::terbaruUntuk($komoditasId, $metode);
    }

    private function pesananTerbayar(string $id): Pesanan
    {
        return Pesanan::whereKey($id)->where('status', '!=', 'menunggu_pembayaran')->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');
    }

    private function alokasi(Pengguna $petani, string $id): AlokasiPesanan
    {
        return AlokasiPesanan::where('id', $id)->where('petani_id', $petani->id)->lockForUpdate()->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');
    }

    private function petani(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }
}
