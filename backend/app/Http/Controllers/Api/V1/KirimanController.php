<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Hasil;
use App\Domain\Hitung\Kiriman;
use App\Domain\Hitung\Uang;
use App\Domain\Jual\LayananJual;
use App\Domain\Pembayaran\PenyediaPembayaran;
use App\Enums\Peran;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\JawabIdempoten;
use App\Http\Respons;
use App\Models\AlokasiPesanan;
use App\Models\Pengguna;
use App\Models\Pengiriman;
use App\Models\Pesanan;
use App\Models\Rating;
use App\Support\Konfigurasi;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Kiriman, konfirmasi, dan rating (kontrak 3.8; D-01, D-02, D-14, P0-25, P0-26, P0-28). */
class KirimanController extends Controller
{
    public function __construct(private readonly LayananJual $jual, private readonly PenyediaPembayaran $bayar) {}

    /** GET /kiriman/saya (petani) */
    public function saya(Request $request): JsonResponse
    {
        $p = $this->pengguna($request);
        $this->jual->prosesOtomatis();
        $alokasi = AlokasiPesanan::where('petani_id', $p->id)->pluck('id');

        return Respons::data(Pengiriman::whereIn('alokasi_id', $alokasi)->orderBy('tanggal_jadwal')->orderBy('ke')->get()
            ->map(fn ($x) => LayananJual::bentukKiriman($x, $p->id))->all());
    }

    /** GET /kiriman/{id} (petani pemilik alokasi atau pembeli pemilik pesanan) */
    public function ambil(Request $request, string $id): JsonResponse
    {
        $p = $this->pengguna($request);
        $this->jual->prosesOtomatis();

        return Respons::data(LayananJual::bentukKiriman($this->terkait($p, $id), $p->id));
    }

    /** POST /kiriman/{id}/foto-kualitas */
    public function fotoKualitas(Request $request, string $id): JsonResponse
    {
        $p = $this->pengguna($request);
        $x = $this->milikPetani($p, $id);
        if ($x->status->value !== 'terjadwal') {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }
        $foto = $request->input('foto');
        if (! is_string($foto) || $foto === '') {
            throw GalatApi::validasi(['foto' => 'FOTO_WAJIB']);
        }
        $x->forceFill(['foto_kualitas' => $foto])->save();

        return Respons::data(LayananJual::bentukKiriman($x->refresh(), $p->id));
    }

    /** POST /kiriman/{id}/foto-timbangan: opsional; kosong menghapus (D-40). */
    public function fotoTimbangan(Request $request, string $id): JsonResponse
    {
        $p = $this->pengguna($request);
        $x = $this->milikPetani($p, $id);
        if ($x->status->value !== 'terjadwal') {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }
        $foto = $request->input('foto');
        $x->forceFill(['foto_timbangan' => is_string($foto) && $foto !== '' ? $foto : null])->save();

        return Respons::data(LayananJual::bentukKiriman($x->refresh(), $p->id));
    }

    /** POST /kiriman/{id}/dikirim: bagian pembeli ditahan; batas periksa diset (D-01, D-02). */
    public function dikirim(Request $request, string $id): JsonResponse
    {
        $p = $this->pengguna($request);
        $hasil = DB::transaction(function () use ($p, $id) {
            $x = $this->milikPetani($p, $id);
            if ($x->status->value !== 'terjadwal') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            if (! $x->foto_kualitas) {
                throw new GalatApi('FOTO_WAJIB');
            }
            $pesanan = Pesanan::lockForUpdate()->findOrFail($x->pesanan_id);
            if ($pesanan->status->value !== 'berjalan') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $nilai = Uang::bulatkanRupiah($x->jumlah_kg * $x->harga_per_kg);
            $bayar = Hasil::buka(Uang::hitungPembayaranKiriman([
                'nilaiKiriman' => $nilai, 'nilaiDiterima' => $nilai, 'saldoUangMuka' => $pesanan->saldo_uang_muka,
                'persenUangMuka' => Konfigurasi::angka('persen_uang_muka'),
                'kirimanTerakhir' => LayananJual::jumlahKirimanTerbuka($pesanan->id, $x->id) === 0,
            ]));
            $referensi = $this->bayar->tahan((int) $bayar['dibayarPembeli'], "kiriman {$x->id}", "kiriman-{$x->id}");
            $this->jual->catatBayar(['pesanan_id' => $pesanan->id, 'pengiriman_id' => $x->id, 'jenis' => 'kiriman',
                'nominal' => $bayar['dibayarPembeli'], 'status' => 'ditahan', 'referensi' => $referensi]);
            $sekarang = CarbonImmutable::now();
            $jam = ['rutin' => Konfigurasi::angka('jam_periksa_rutin'), 'sekali_panen' => Konfigurasi::angka('jam_periksa_sekali_panen')];
            $batas = Kiriman::statusOtomatis($pesanan->jenis->value, $sekarang->getTimestampMs(), $sekarang->getTimestampMs(), $jam)['batasMs'];
            $x->forceFill(['status' => 'dikirim', 'dikirim_pada' => $sekarang, 'batas_periksa_pada' => CarbonImmutable::createFromTimestampMs($batas)])->save();
            $a = AlokasiPesanan::findOrFail($x->alokasi_id);
            if ($a->status->value === 'disepakati') {
                $a->forceFill(['status' => 'berjalan'])->save();
            }

            return LayananJual::bentukKiriman($x->refresh(), $p->id);
        });

        return Respons::data($hasil);
    }

    /** POST /kiriman/{id}/konfirmasi (idempoten, pembeli) */
    public function konfirmasi(Request $request, string $id): JsonResponse
    {
        $p = $this->pengguna($request);
        $this->jual->prosesOtomatis();

        return JawabIdempoten::jalankan($request, $p, "konfirmasi:{$id}", function () use ($request, $p, $id) {
            $x = Pengiriman::whereKey($id)->lockForUpdate()->first();
            if ($x === null || Pesanan::whereKey($x->pesanan_id)->value('pembeli_id') !== $p->id) {
                throw new GalatApi('TIDAK_DITEMUKAN');
            }
            if ($x->status->value !== 'dikirim') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $keputusan = ['jenis' => 'terima_semua'];
            $tolak = $request->input('keputusan') === 'tolak_sebagian';
            if ($tolak) {
                $alasan = $request->input('alasan_penolakan');
                $alasanSah = Hasil::buka(Kiriman::validasiAlasan($alasan, $request->input('keterangan_penolakan')),
                    $alasan === 'lainnya' ? 'keterangan_penolakan' : 'alasan_penolakan');
                $keputusan = ['jenis' => 'tolak_sebagian', 'jumlahDitolakKg' => $request->input('jumlah_ditolak_kg'),
                    'alasan' => $alasanSah, 'keterangan' => $request->input('keterangan_penolakan')];
            }

            return $this->jual->terapkanKonfirmasi($x, $keputusan, $tolak ? $request->input('foto_penolakan') : null, false);
        });
    }

    /** POST /kiriman/{id}/rating: sekali per pemberi per kiriman. */
    public function rating(Request $request, string $id): JsonResponse
    {
        $p = $this->pengguna($request);
        $x = $this->terkait($p, $id);
        if (! in_array($x->status->value, ['diterima', 'ditolak_sebagian'], true)) {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }
        $nilai = $request->input('nilai');
        if (! is_int($nilai) || $nilai < 1 || $nilai > 5) {
            throw GalatApi::validasi(['nilai' => 'VALIDASI']);
        }
        if (Rating::where('pengiriman_id', $id)->where('pemberi_id', $p->id)->exists()) {
            throw new GalatApi('SUDAH_DINILAI');
        }
        $petaniId = AlokasiPesanan::whereKey($x->alokasi_id)->value('petani_id');
        $r = Rating::forceCreate([
            'pengiriman_id' => $id, 'pemberi_id' => $p->id,
            'penerima_id' => $p->id === $petaniId ? Pesanan::whereKey($x->pesanan_id)->value('pembeli_id') : $petaniId,
            'nilai' => $nilai, 'komentar' => trim((string) $request->input('komentar')) ?: null,
        ]);

        return Respons::data($r->refresh()->toArray());
    }

    /** GET /pengguna/{id}/rating */
    public function ringkasanRating(string $id): JsonResponse
    {
        if (! Pengguna::whereKey($id)->exists()) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        return Respons::data(LayananJual::ringkasanRating($id));
    }

    private function terkait(Pengguna $p, string $id): Pengiriman
    {
        $x = Pengiriman::find($id);
        $boleh = $x !== null && (
            ($p->peran === Peran::Petani && AlokasiPesanan::whereKey($x->alokasi_id)->value('petani_id') === $p->id)
            || ($p->peran === Peran::Pembeli && Pesanan::whereKey($x->pesanan_id)->value('pembeli_id') === $p->id)
        );

        return $boleh ? $x : throw new GalatApi('TIDAK_DITEMUKAN');
    }

    private function milikPetani(Pengguna $p, string $id): Pengiriman
    {
        $x = Pengiriman::whereKey($id)->lockForUpdate()->first();

        return $x !== null && AlokasiPesanan::whereKey($x->alokasi_id)->value('petani_id') === $p->id ? $x : throw new GalatApi('TIDAK_DITEMUKAN');
    }

    private function pengguna(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }
}
