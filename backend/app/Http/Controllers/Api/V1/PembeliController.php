<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Angka;
use App\Domain\Hitung\Hasil;
use App\Domain\Hitung\Kiriman;
use App\Domain\Hitung\Uang;
use App\Domain\Jual\LayananJual;
use App\Domain\Jual\Sekitar;
use App\Domain\Pembayaran\PenyediaPembayaran;
use App\Domain\Resep\Resep;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\JawabIdempoten;
use App\Http\Respons;
use App\Models\AlokasiPesanan;
use App\Models\Pembayaran;
use App\Models\Pengguna;
use App\Models\Pengiriman;
use App\Models\Pesanan;
use App\Models\ProfilPembeli;
use App\Models\SiklusTanam;
use App\Support\HariIni;
use App\Support\Konfigurasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Pembeli (kontrak 3.9; P0-02, P0-19, P0-23, P0-27; D-02, D-41). */
class PembeliController extends Controller
{
    public function __construct(private readonly LayananJual $jual, private readonly PenyediaPembayaran $bayar) {}

    /** GET /pembeli/pesanan: dasbor, terbaru dulu. */
    public function pesananSaya(Request $request): JsonResponse
    {
        $p = $this->pembeli($request);
        $this->jual->prosesOtomatis();

        return Respons::data(Pesanan::where('pembeli_id', $p->id)->orderByDesc('dibuat_pada')->orderByDesc('id')->get()
            ->map(fn ($x) => LayananJual::denganKebun($p, $x))->all());
    }

    /** POST /pembeli/pesanan: berstatus menunggu pembayaran; angka uang dari rumus server. */
    public function buatPesanan(Request $request): JsonResponse
    {
        $p = $this->pembeli($request);
        if (ProfilPembeli::find($p->id)?->status_verifikasi->value !== 'terverifikasi') {
            throw new GalatApi('BELUM_TERVERIFIKASI');
        }
        $m = $request->all();
        $jenis = $m['jenis'] ?? null;
        $salah = [];
        if (! in_array($jenis, ['rutin', 'sekali_panen'], true)) {
            $salah['jenis'] = 'VALIDASI';
        }
        if (! Resep::terlihat()->where('komoditas_id', (string) ($m['komoditas_id'] ?? ''))->exists()) {
            $salah['komoditas_id'] = 'VALIDASI';
        }
        if (! AkunController::wilayahAda($m['wilayah_id'] ?? null)) {
            $salah['wilayah_id'] = 'TIDAK_DITEMUKAN';
        } elseif (! AkunController::wilayahTersedia($m['wilayah_id'])) {
            $salah['wilayah_id'] = 'WILAYAH_BELUM_TERSEDIA';
        }
        if (trim((string) ($m['alamat_antar'] ?? '')) === '') {
            $salah['alamat_antar'] = 'VALIDASI';
        }
        if (! empty($m['batas_jam_antar']) && ! preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string) $m['batas_jam_antar'])) {
            $salah['batas_jam_antar'] = 'VALIDASI';
        }
        $positif = fn ($v) => is_numeric($v) && $v > 0;
        if (! $positif($m['harga_per_kg'] ?? null)) {
            $salah['harga_per_kg'] = 'HARGA_KOSONG';
        }
        if ($jenis === 'rutin' && ! $positif($m['jumlah_per_kiriman_kg'] ?? null)) {
            $salah['jumlah_per_kiriman_kg'] = 'JUMLAH_KOSONG';
        }
        if ($jenis === 'rutin' && ! KebunController::tanggalSah($m['tanggal_mulai'] ?? null)) {
            $salah['tanggal_mulai'] = 'VALIDASI';
        }
        if ($jenis === 'sekali_panen' && ! $positif($m['jumlah_total_kg'] ?? null)) {
            $salah['jumlah_total_kg'] = 'JUMLAH_KOSONG';
        }
        if ($jenis === 'sekali_panen' && ! preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', (string) ($m['perkiraan_bulan_panen'] ?? ''))) {
            $salah['perkiraan_bulan_panen'] = 'VALIDASI';
        }
        if ($salah !== []) {
            throw GalatApi::validasi($salah);
        }
        $rutin = $jenis === 'rutin';
        $jumlahKiriman = $rutin
            ? Hasil::buka(Uang::jumlahKirimanRutin($m['frekuensi_hari'] ?? null, $m['durasi_hari'] ?? null, (int) Konfigurasi::angka('maks_durasi_rutin_hari')), 'durasi_hari')
            : 1;
        $nilai = Hasil::buka(Uang::hitungNilaiPesanan(
            $rutin
                ? ['jenis' => 'rutin', 'jumlahPerKirimanKg' => $m['jumlah_per_kiriman_kg'], 'jumlahKiriman' => $jumlahKiriman, 'hargaPerKg' => $m['harga_per_kg']]
                : ['jenis' => 'sekali_panen', 'jumlahTotalKg' => $m['jumlah_total_kg'], 'hargaPerKg' => $m['harga_per_kg']],
            ['persenUangMuka' => Konfigurasi::angka('persen_uang_muka'), 'persenLayanan' => Konfigurasi::angka('persen_layanan')],
        ));
        $x = Pesanan::forceCreate([
            'pembeli_id' => $p->id,
            'jenis' => $jenis,
            'komoditas_id' => $m['komoditas_id'],
            'jumlah_per_kiriman_kg' => $rutin ? $m['jumlah_per_kiriman_kg'] : null,
            'frekuensi_hari' => $rutin ? $m['frekuensi_hari'] : null,
            'jumlah_kiriman' => $jumlahKiriman,
            'jumlah_total_kg' => $nilai['jumlahTotalKg'],
            'tanggal_mulai' => $rutin ? $m['tanggal_mulai'] : null,
            'tanggal_selesai' => $rutin ? Angka::tambahHari($m['tanggal_mulai'], ($jumlahKiriman - 1) * $m['frekuensi_hari']) : null,
            'perkiraan_bulan_panen' => $rutin ? null : $m['perkiraan_bulan_panen'],
            'harga_per_kg' => $m['harga_per_kg'],
            'standar_kualitas' => array_values((array) ($m['standar_kualitas'] ?? [])),
            'wilayah_id' => $m['wilayah_id'],
            'alamat_antar' => trim((string) $m['alamat_antar']),
            'patokan' => $m['patokan'] ?? null,
            'batas_jam_antar' => ($m['batas_jam_antar'] ?? null) ?: null,
            'status' => 'menunggu_pembayaran',
            'nilai_pesanan' => $nilai['nilaiPesanan'],
            'uang_muka' => $nilai['uangMuka'],
            'biaya_layanan' => $nilai['biayaLayanan'],
            'saldo_uang_muka' => 0,
            'terambil_kg' => 0,
        ]);

        return Respons::data($x->refresh()->toArray());
    }

    /**
     * POST /pembeli/pesanan/{id}/bayar-uang-muka (idempoten). Di mode uji coba `simulasi` gagal
     * atau menunggu bisa diperagakan (D-41). Percobaan gagal dicatat di transaksinya sendiri tanpa
     * memakai atau mengunci kunci idempoten (D-57), jadi kunci yang sama tetap bisa dipakai lagi.
     */
    public function bayarUangMuka(Request $request, string $id): JsonResponse
    {
        $p = $this->pembeli($request);
        $simulasi = $this->bayar->modeUjiCoba() ? ($request->input('simulasi') ?? 'berhasil') : 'berhasil';
        if ($simulasi === 'gagal') {
            DB::transaction(function () use ($p, $id) {
                $x = $this->milik($p, $id, true);
                if ($x->status->value !== 'menunggu_pembayaran') {
                    throw new GalatApi('STATUS_TIDAK_SESUAI');
                }
                $this->jual->catatBayar(['pesanan_id' => $id, 'jenis' => 'uang_muka', 'nominal' => $x->uang_muka, 'status' => 'gagal',
                    'referensi' => 'TIRUAN-GAGAL-'.(Pembayaran::count() + 1)]);
            });
            throw new GalatApi('PEMBAYARAN_GAGAL');
        }

        return JawabIdempoten::jalankan($request, $p, "bayar-uang-muka:{$id}", function () use ($p, $id, $simulasi) {
            $x = $this->milik($p, $id, true);
            if ($x->status->value !== 'menunggu_pembayaran') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $menunggu = Pembayaran::where('pesanan_id', $id)->where('jenis', 'uang_muka')->where('status', 'menunggu')->first();
            if ($simulasi === 'menunggu') {
                $baris = $menunggu ?? $this->jual->catatBayar(['pesanan_id' => $id, 'jenis' => 'uang_muka', 'nominal' => $x->uang_muka,
                    'status' => 'menunggu', 'referensi' => 'TIRUAN-MENUNGGU-'.(Pembayaran::count() + 1)]);

                return [LayananJual::bentukBayar($baris)];
            }
            $um = $this->bayar->tahan($x->uang_muka, "uang muka {$id}", "uang-muka-{$id}");
            $layanan = $this->bayar->tahan($x->biaya_layanan, "biaya layanan {$id}", "layanan-{$id}");
            $this->bayar->cairkan($layanan, $x->biaya_layanan);
            // Pembayaran yang tadinya menunggu menjadi berhasil: barisnya diperbarui, bukan ditambah.
            if ($menunggu) {
                $menunggu->forceFill(['status' => 'ditahan', 'referensi' => $um])->save();
            }
            $baris = [
                $menunggu?->refresh() ?? $this->jual->catatBayar(['pesanan_id' => $id, 'jenis' => 'uang_muka', 'nominal' => $x->uang_muka,
                    'status' => 'ditahan', 'referensi' => $um]),
                $this->jual->catatBayar(['pesanan_id' => $id, 'jenis' => 'biaya_layanan', 'nominal' => $x->biaya_layanan,
                    'status' => 'cair', 'referensi' => $layanan]),
            ];
            $x->forceFill(['status' => 'mencari_petani', 'saldo_uang_muka' => $x->uang_muka])->save();

            return array_map(LayananJual::bentukBayar(...), $baris);
        });
    }

    /** POST /pembeli/pesanan/{id}/batalkan: setelah petani menanam, uang muka menjadi kompensasi (P0-27). */
    public function batalkan(Request $request, string $id): JsonResponse
    {
        $p = $this->pembeli($request);
        $hasil = DB::transaction(function () use ($p, $id) {
            $x = $this->milik($p, $id, true);
            if (in_array($x->status->value, ['selesai', 'dibatalkan'], true)) {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $aktif = AlokasiPesanan::where('pesanan_id', $id)->whereIn('status', Sekitar::ALOKASI_AKTIF)->pluck('id');
            $hariIni = HariIni::untuk($p);
            $menanam = SiklusTanam::whereIn('alokasi_pesanan_id', $aktif)->where('status', 'aktif')
                ->whereNotNull('tanggal_tanam')->where('tanggal_tanam', '<=', $hariIni)->exists();
            $r = Kiriman::pembatalanPembeli($menanam, $x->saldo_uang_muka);
            $um = LayananJual::refUangMuka($id);
            if ($um && $r['kompensasiPetani'] > 0) {
                $this->bayar->cairkan($um, (int) $r['kompensasiPetani']);
                $this->jual->catatBayar(['pesanan_id' => $id, 'jenis' => 'kompensasi', 'nominal' => $r['kompensasiPetani'], 'status' => 'cair', 'referensi' => $um]);
            }
            if ($um && $r['dikembalikanKePembeli'] > 0) {
                $this->bayar->kembalikan($um, (int) $r['dikembalikanKePembeli']);
                $this->jual->catatBayar(['pesanan_id' => $id, 'jenis' => 'pengembalian', 'nominal' => $r['dikembalikanKePembeli'], 'status' => 'dikembalikan', 'referensi' => $um]);
            }
            $x->forceFill(['status' => 'dibatalkan', 'saldo_uang_muka' => 0])->save();
            AlokasiPesanan::whereIn('id', $aktif)->update(['status' => 'dibatalkan']);
            PesananController::segarkanTerambil($x);
            Pengiriman::where('pesanan_id', $id)->where('status', 'terjadwal')->update(['status' => 'gagal']);

            return ['pesanan' => $x->refresh()->toArray(), 'kompensasi_petani' => $r['kompensasiPetani'], 'dikembalikan_ke_pembeli' => $r['dikembalikanKePembeli']];
        });

        return Respons::data($hasil);
    }

    /** GET /pembeli/pembayaran (berhalaman), terbaru dulu. */
    public function pembayaran(Request $request): JsonResponse
    {
        $p = $this->pembeli($request);
        $this->jual->prosesOtomatis();
        ['halaman' => $halaman, 'per_halaman' => $per] = Respons::paginasi($request);
        $q = Pembayaran::whereIn('pesanan_id', Pesanan::where('pembeli_id', $p->id)->pluck('id'))
            ->orderByDesc('dibuat_pada')->orderByDesc('id');

        return Respons::halaman($q->paginate($per, ['*'], 'halaman', $halaman), fn ($b) => LayananJual::bentukBayar($b));
    }

    private function milik(Pengguna $p, string $id, bool $kunci = false): Pesanan
    {
        $q = Pesanan::where('id', $id)->where('pembeli_id', $p->id);

        return ($kunci ? $q->lockForUpdate() : $q)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');
    }

    private function pembeli(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }
}
