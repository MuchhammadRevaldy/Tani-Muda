<?php

namespace App\Domain\Jual;

use App\Domain\Hitung\Angka;
use App\Domain\Hitung\Hasil;
use App\Domain\Hitung\Kebun;
use App\Domain\Hitung\Kiriman;
use App\Domain\Hitung\PesananLahan;
use App\Domain\Kebun\LayananKebun;
use App\Domain\Pembayaran\PembayaranTiruan;
use App\Domain\Pembayaran\PenyediaPembayaran;
use App\Domain\Resep\Resep;
use App\Http\Galat\GalatApi;
use App\Models\AlokasiPesanan;
use App\Models\Jurnal;
use App\Models\Lahan;
use App\Models\Pembayaran;
use App\Models\PengaturanPengingat;
use App\Models\Pengguna;
use App\Models\Pengiriman;
use App\Models\Pesanan;
use App\Models\ProfilPembeli;
use App\Models\Rating;
use App\Models\ResepTanam;
use App\Models\Sengketa;
use App\Models\SiklusTanam;
use App\Models\SistemHidroponik;
use App\Models\Wilayah;
use App\Support\HariIni;
use App\Support\Konfigurasi;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Jual di server (klien tiruan fitur/pesanan.ts; kontrak 3.7–3.9; D-01, D-02, D-03, D-39, D-40).
 * Angka uang selalu dari app/Domain/Hitung, tidak dari masukan klien (D-08).
 */
final class LayananJual
{
    public function __construct(private readonly PenyediaPembayaran $bayar) {}

    // ------------------------------------------------------------ bentuk data

    /** @return array<string, mixed> `AlokasiPesanan` dengan daftar petaknya */
    public static function bentukAlokasi(AlokasiPesanan $a): array
    {
        return $a->withoutRelations()->toArray() + [
            'siklus_ids' => SiklusTanam::where('alokasi_pesanan_id', $a->id)->orderBy('petak_ke')->orderBy('id')->pluck('id')->all(),
        ];
    }

    /** @return array<string, mixed> `Pengiriman` dengan nilai yang sudah diberikan pembaca (P0-28) */
    public static function bentukKiriman(Pengiriman $x, ?string $penggunaId): array
    {
        $data = $x->withoutRelations()->toArray();
        unset($data['dibuat_pada']);

        return $data + [
            'rating_saya' => $penggunaId === null ? null : Rating::where('pengiriman_id', $x->id)->where('pemberi_id', $penggunaId)->value('nilai'),
        ];
    }

    /** @return array{pengguna_id: string, rata_rata: float|null, jumlah: int} */
    public static function ringkasanRating(string $penggunaId): array
    {
        $nilai = Rating::where('penerima_id', $penggunaId)->pluck('nilai')->all();

        return [
            'pengguna_id' => $penggunaId,
            'rata_rata' => $nilai === [] ? null : Angka::bulat(array_sum($nilai) / count($nilai), 1),
            'jumlah' => count($nilai),
        ];
    }

    /** Alokasi aktif petani di pesanan ini (satu petani satu alokasi, D-39). */
    public static function alokasiPetani(string $petaniId, string $pesananId): ?AlokasiPesanan
    {
        return AlokasiPesanan::where('pesanan_id', $pesananId)->where('petani_id', $petaniId)
            ->whereIn('status', Sekitar::ALOKASI_AKTIF)->first();
    }

    /** @return array<string, mixed> `PesananUntukPetani` (tanpa titik lahan, D-06) */
    public static function untukPetani(Pengguna $petani, Pesanan $p): array
    {
        $saya = self::alokasiPetani($petani->id, $p->id);
        $profil = ProfilPembeli::find($p->pembeli_id);
        $w = Wilayah::find($p->wilayah_id);
        $rating = self::ringkasanRating($p->pembeli_id);

        return [
            'id' => $p->id,
            'jenis' => $p->jenis->value,
            'komoditas_id' => $p->komoditas_id,
            'nama_pembeli' => $profil->nama_usaha ?? LayananKebun::namaPengguna($p->pembeli_id),
            'jenis_usaha' => $profil?->jenis_usaha->value ?? 'lainnya',
            'desa_antar' => $w->desa ?? '',
            'kecamatan_antar' => $w->kecamatan ?? '',
            'titik_desa_antar' => $w && $w->lintang !== null && $w->bujur !== null ? ['lintang' => (float) $w->lintang, 'bujur' => (float) $w->bujur] : null,
            'alamat_antar' => $saya ? $p->alamat_antar : null,
            'patokan' => $saya ? $p->patokan : null,
            'jarak_km' => Sekitar::jarakKm($petani, $p) ?? 0,
            'jumlah_per_kiriman_kg' => $p->jumlah_per_kiriman_kg,
            'frekuensi_hari' => $p->frekuensi_hari,
            'jumlah_kiriman' => $p->jumlah_kiriman,
            'jumlah_total_kg' => $p->jumlah_total_kg,
            'sisa_kg' => Sekitar::sisaKg($p),
            'tanggal_mulai' => $p->tanggal_mulai?->toDateString(),
            'perkiraan_bulan_panen' => $p->perkiraan_bulan_panen,
            'batas_jam_antar' => $p->batas_jam_antar,
            'harga_per_kg' => $p->harga_per_kg,
            'standar_kualitas' => $p->standar_kualitas ?? [],
            'boleh_ambil_sebagian' => true,
            'uang_muka_diterima' => $p->status->value !== 'menunggu_pembayaran',
            'rating_pembeli' => ['rata_rata' => $rating['rata_rata'], 'jumlah' => $rating['jumlah']],
            'alokasi_saya' => $saya ? self::bentukAlokasi($saya) : null,
            'dibuat_pada' => $p->toArray()['dibuat_pada'],
        ];
    }

    /** @return array<string, mixed> `PesananDenganKebun` untuk dasbor pembeli (D-06: tanpa titik lahan) */
    public static function denganKebun(Pengguna $pembeli, Pesanan $x): array
    {
        $kiriman = Pengiriman::where('pesanan_id', $x->id)->orderBy('tanggal_jadwal')->orderBy('ke')->get();
        $hariIni = HariIni::untuk($pembeli);
        $kebun = AlokasiPesanan::where('pesanan_id', $x->id)->whereIn('status', Sekitar::ALOKASI_AKTIF)->orderBy('dibuat_pada')->get()
            ->map(function (AlokasiPesanan $a) use ($x, $hariIni) {
                $petani = Pengguna::findOrFail($a->petani_id);
                $semua = SiklusTanam::where('alokasi_pesanan_id', $a->id)->orderBy('petak_ke')->orderBy('id')->get();
                // Petak yang paling dulu dipanen di antara yang sudah ditanam; foto dari semua petaknya.
                $siklus = $semua->first(fn ($s) => $s->status->value === 'aktif' && $s->tanggal_tanam && $s->tanggal_tanam->toDateString() <= $hariIni) ?? $semua->first();
                $umur = $siklus ? ResepTanam::whereKey($siklus->resep_id)->value('umur_panen_hari') : null;
                $tanam = $siklus?->tanggal_tanam?->toDateString();
                $foto = Jurnal::whereIn('siklus_id', $semua->pluck('id'))->whereNotNull('foto')->orderByDesc('tanggal')->value('foto');

                return [
                    'alokasi_id' => $a->id,
                    'nama_petani' => $petani->nama ?? '',
                    'desa' => Wilayah::find($petani->wilayah_id)->desa ?? '',
                    'jarak_km' => Sekitar::jarakKm($petani, $x) ?? 0,
                    'jumlah_kg' => $a->jumlah_kg,
                    'hari_ke' => $tanam ? Angka::selisihHari($tanam, $hariIni) : null,
                    'hari_panen' => $umur,
                    'perkiraan_tanggal_panen' => $tanam && $umur !== null ? Angka::tambahHari($tanam, (int) $umur) : null,
                    'foto_terbaru' => $foto,
                ];
            })->values()->all();
        $berikutnya = $kiriman->first(fn ($y) => $y->status->value === 'terjadwal');

        return $x->withoutRelations()->toArray() + [
            'kebun' => $kebun,
            'kiriman_berikutnya' => $berikutnya ? self::bentukKiriman($berikutnya, $pembeli->id) : null,
            'kiriman_menunggu' => $kiriman->filter(fn ($y) => $y->status->value === 'dikirim')->map(fn ($y) => self::bentukKiriman($y, $pembeli->id))->values()->all(),
        ];
    }

    // ------------------------------------------------------------ pembayaran

    /** @param  array<string, mixed>  $b */
    public function catatBayar(array $b): Pembayaran
    {
        $baris = Pembayaran::forceCreate($b + ['mode_uji_coba' => $this->bayar->modeUjiCoba()]);
        if ($this->bayar instanceof PembayaranTiruan) {
            $this->bayar->sudahDicatat($b['referensi']);
        }

        return $baris->refresh();
    }

    /** Referensi uang muka yang benar-benar masuk (bukan gagal atau menunggu). */
    public static function refUangMuka(string $pesananId): ?string
    {
        return Pembayaran::where('pesanan_id', $pesananId)->where('jenis', 'uang_muka')
            ->whereNotIn('status', ['gagal', 'menunggu'])->orderBy('dibuat_pada')->value('referensi');
    }

    /** Kiriman yang masih terbuka (terjadwal atau dikirim) di pesanan ini. */
    public static function jumlahKirimanTerbuka(string $pesananId, ?string $kecuali = null): int
    {
        return Pengiriman::where('pesanan_id', $pesananId)->when($kecuali, fn ($q) => $q->where('id', '!=', $kecuali))
            ->whereIn('status', ['terjadwal', 'dikirim'])->count();
    }

    /** @return array<string, mixed> `Pembayaran` */
    public static function bentukBayar(Pembayaran $b): array
    {
        return $b->withoutRelations()->toArray();
    }

    /**
     * Konfirmasi pembeli atau konfirmasi otomatis (D-01, D-02, P0-25, P0-26).
     *
     * @param  array<string, mixed>  $keputusan  `{ jenis: 'terima_semua' }` atau tolak sebagian
     * @return array{pengiriman: array<string, mixed>, pembayaran: list<array<string, mixed>>, sengketa: array<string, mixed>|null}
     */
    public function terapkanKonfirmasi(Pengiriman $kiriman, array $keputusan, ?string $foto, bool $otomatis): array
    {
        $pesanan = Pesanan::lockForUpdate()->findOrFail($kiriman->pesanan_id);
        $terakhir = self::jumlahKirimanTerbuka($pesanan->id, $kiriman->id) === 0;
        $r = Hasil::buka(Kiriman::konfirmasiKiriman([
            'jumlahDikirimKg' => $kiriman->jumlah_kg,
            'hargaPerKg' => $kiriman->harga_per_kg,
            'saldoUangMuka' => $pesanan->saldo_uang_muka,
            'kirimanTerakhir' => $terakhir,
        ], $keputusan, Konfigurasi::angka('persen_uang_muka')), $keputusan['jenis'] === 'tolak_sebagian' ? 'jumlah_ditolak_kg' : null);
        $barisKiriman = Pembayaran::where('pengiriman_id', $kiriman->id)->where('jenis', 'kiriman')->first();
        $baru = [];
        if ($barisKiriman && $r['dibayarPembeli'] > 0) {
            $this->bayar->cairkan($barisKiriman->referensi, $r['dibayarPembeli']);
            $baru[] = $this->catatBayar(['pesanan_id' => $pesanan->id, 'pengiriman_id' => $kiriman->id, 'jenis' => 'pencairan',
                'nominal' => $r['dibayarPembeli'], 'status' => 'cair', 'referensi' => $barisKiriman->referensi]);
        }
        $um = self::refUangMuka($pesanan->id);
        if ($um && $r['dariUangMuka'] > 0) {
            $this->bayar->cairkan($um, $r['dariUangMuka']);
            $baru[] = $this->catatBayar(['pesanan_id' => $pesanan->id, 'pengiriman_id' => $kiriman->id, 'jenis' => 'pencairan',
                'nominal' => $r['dariUangMuka'], 'status' => 'cair', 'referensi' => $um]);
        }
        $sengketa = null;
        if ($barisKiriman) {
            $sisa = $barisKiriman->nominal - $r['dibayarPembeli'];
            if ($sisa > 0 && ! $r['perluSengketa']) {
                $this->bayar->kembalikan($barisKiriman->referensi, $sisa);
                $baru[] = $this->catatBayar(['pesanan_id' => $pesanan->id, 'pengiriman_id' => $kiriman->id, 'jenis' => 'pengembalian',
                    'nominal' => $sisa, 'status' => 'dikembalikan', 'referensi' => $barisKiriman->referensi]);
            }
            // Bagian yang ditolak tetap ditahan sampai admin memutus sengketa.
            $barisKiriman->forceFill(['status' => $r['perluSengketa'] && $sisa > 0 ? 'ditahan' : 'cair'])->save();
        }
        if ($r['perluSengketa']) {
            $sengketa = Sengketa::forceCreate(['pengiriman_id' => $kiriman->id, 'status' => 'terbuka']);
        }
        $tolak = $keputusan['jenis'] === 'tolak_sebagian';
        $kiriman->forceFill([
            'status' => $r['status'],
            'dikonfirmasi_pada' => now(),
            'dianggap_diterima' => $otomatis,
            'jumlah_ditolak_kg' => $r['jumlahDitolakKg'],
            'alasan_penolakan' => $tolak ? $keputusan['alasan'] : null,
            'keterangan_penolakan' => $tolak ? (trim((string) ($keputusan['keterangan'] ?? '')) ?: null) : null,
            'foto_penolakan' => $foto,
            'nilai_diterima' => $r['danaCairPetani'],
        ])->save();
        $pesanan->forceFill(['saldo_uang_muka' => $r['sisaSaldoUangMuka']])->save();
        if (self::jumlahKirimanTerbuka($pesanan->id) === 0 && $pesanan->status->value === 'berjalan') {
            $pesanan->forceFill(['status' => 'selesai'])->save();
            AlokasiPesanan::where('pesanan_id', $pesanan->id)->whereIn('status', Sekitar::ALOKASI_AKTIF)->update(['status' => 'selesai']);
        }

        return [
            'pengiriman' => self::bentukKiriman($kiriman->refresh(), null),
            'pembayaran' => array_map(self::bentukBayar(...), $baru),
            'sengketa' => $sengketa ? $sengketa->refresh()->toArray() : null,
        ];
    }

    /** Kiriman yang melewati batas periksa dianggap diterima (D-01); dijalankan sebelum membaca. */
    public function prosesOtomatis(): void
    {
        $jam = ['rutin' => Konfigurasi::angka('jam_periksa_rutin'), 'sekali_panen' => Konfigurasi::angka('jam_periksa_sekali_panen')];
        $sekarang = CarbonImmutable::now()->getTimestampMs();
        foreach (Pengiriman::where('status', 'dikirim')->whereNotNull('dikirim_pada')->get() as $x) {
            $jenis = Pesanan::findOrFail($x->pesanan_id)->jenis->value;
            $s = Kiriman::statusOtomatis($jenis, $x->dikirim_pada->getTimestampMs(), $sekarang, $jam);
            if ($s['dianggapDiterima']) {
                DB::transaction(fn () => $this->terapkanKonfirmasi($x, ['jenis' => 'terima_semua'], null, true));
            }
        }
    }

    // ------------------------------------------------------------ ambil pesanan

    /**
     * Kiriman pesanan yang terkejar bila mulai tanam hari ini (D-39).
     *
     * @return list<array{ke: int, tanggal: string}>
     */
    public static function jadwalTerkejar(Pengguna $petani, Pesanan $p, int $umurPanenHari): array
    {
        return PesananLahan::kirimanTerkejar(
            PesananLahan::jadwalKirimPesanan($p->jenis->value, $p->tanggal_mulai?->toDateString(), $p->frekuensi_hari, $p->jumlah_kiriman, $p->perkiraan_bulan_panen),
            HariIni::untuk($petani),
            $umurPanenHari,
        );
    }

    /**
     * Rencana siklus dari pesanan (D-40): rutin satu petak per kiriman yang terkejar, sekali panen
     * satu siklus, berharga kesepakatan (P0-21), lengkap dengan rencana item dari resep.
     *
     * @return list<SiklusTanam>
     */
    public static function buatSiklusPesanan(Pengguna $petani, Pesanan $pesanan, Lahan $lahan, ResepTanam $resep, float $jumlahKg, string $alokasiId): array
    {
        $jadwal = self::jadwalTerkejar($petani, $pesanan, $resep->umur_panen_hari);
        if ($jadwal === []) {
            throw new GalatApi('JADWAL_TERLALU_DEKAT');
        }
        $rutin = $pesanan->jenis->value === 'rutin';
        $butuh = Hasil::buka(PesananLahan::kebutuhanLahanPesanan([
            'jenis' => $pesanan->jenis->value, 'jumlahKg' => $jumlahKg, 'hasilPerSatuan' => $resep->hasil_per_satuan,
            'frekuensiHari' => $pesanan->frekuensi_hari, 'umurPanenHari' => $resep->umur_panen_hari,
        ]), 'jumlah_kg');
        $hidro = $lahan->jenis_lahan->value === 'hidroponik';
        $mentah = $rutin ? $jumlahKg / $resep->hasil_per_satuan : $butuh['luasTotal'];
        $ukuran = $hidro ? (int) ceil($mentah - 1e-9) : ceil($mentah * 100 - 1e-9) / 100;
        $literNft = SistemHidroponik::whereKey('nft')->value('liter_tandon_per_lubang');
        $volume = $hidro && $literNft !== null ? Kebun::saranVolumeTandon($ukuran, (float) $literNft) : null;
        $petak = $rutin
            ? array_map(fn ($j) => ['ke' => $j['ke'], 'tanam' => Angka::tambahHari($j['tanggal'], -$resep->umur_panen_hari)], $jadwal)
            : [['ke' => null, 'tanam' => null]];
        $perkiraan = Hasil::buka(Kebun::perkiraanPanen($resep->dasar_ukuran->value, $ukuran, $resep->hasil_per_satuan));
        $urutan = LayananKebun::urutanBerikutnya();
        $siklus = array_map(function ($x) use ($petani, $lahan, $resep, $hidro, $ukuran, $volume, $pesanan, $perkiraan, $alokasiId, &$urutan) {
            $s = new SiklusTanam;
            $s->forceFill([
                'petani_id' => $petani->id, 'lahan_id' => $lahan->id, 'resep_id' => $resep->id, 'resep_versi' => $resep->versi,
                'komoditas_id' => $resep->komoditas_id, 'metode_id' => $resep->metode_id, 'status' => 'rencana',
                'luas_m2' => $hidro ? null : $ukuran, 'jumlah_lubang' => $hidro ? $ukuran : null, 'jumlah_polybag' => null,
                'volume_tandon_liter' => $volume, 'sistem_hidroponik' => $hidro ? 'nft' : null, 'vertikultur' => false,
                'satuan_asli' => $hidro ? 'lubang' : 'm2', 'nilai_asli' => $ukuran,
                // Petak rutin menyimpan tanggal tanam rencananya; aktif setelah kesepakatan disetujui.
                'tanggal_tanam' => $x['tanam'], 'dapat_subsidi' => false, 'harga_jual' => $pesanan->harga_per_kg,
                'perkiraan_panen_kg' => $perkiraan, 'alokasi_pesanan_id' => $alokasiId, 'petak_ke' => $x['ke'],
                'urutan' => $urutan++,
            ]);
            $s->id = Str::lower((string) Str::ulid());

            return $s;
        }, $petak);
        if ($rutin) {
            LayananKebun::periksaKapasitasPetak($lahan, array_map(LayananKebun::siklusDomain(...), $siklus));
        } else {
            LayananKebun::periksaKapasitas($siklus[0]);
        }
        $bentukResep = Resep::bentuk($resep);
        $kebutuhan = Hasil::buka(Kebun::hitungKebutuhanResep($bentukResep, $resep->dasar_ukuran->value, [
            'luasM2' => $hidro ? null : $ukuran, 'jumlahTanaman' => $hidro ? $ukuran : null, 'volumeLarutanLiter' => $volume,
        ]));
        $inputId = array_column($bentukResep['input'], 'input_id', 'id');
        foreach ($siklus as $s) {
            $s->save();
            foreach ($kebutuhan as $i => $kb) {
                DB::table('rencana_item')->insert([
                    'id' => "{$s->id}:{$kb['inputId']}", 'siklus_id' => $s->id, 'resep_input_id' => $kb['inputId'],
                    'input_id' => $inputId[$kb['inputId']] ?? null, 'merek_id' => null, 'nama' => $kb['nama'], 'grup' => $kb['grup'],
                    'jumlah' => $kb['jumlahBeli'], 'satuan' => $kb['satuanBeli'], 'harga_satuan' => $kb['hargaContoh'], 'asal' => 'resep',
                    'alat_sekali_beli' => $kb['alatSekaliBeli'], 'jumlah_siklus_pembagian' => $kb['alatSekaliBeli'] ? 10 : 1,
                    'urutan' => $i + 1, 'dibuat_pada' => now(),
                ]);
            }
            PengaturanPengingat::forceCreate(['siklus_id' => $s->id, 'jam_pagi' => '06:00', 'pengingat_sore' => true,
                'tipe_aktif' => ['sekali' => true, 'berulang' => true, 'ukur' => true]]);
        }

        return $siklus;
    }

    /** Hapus siklus rencana beserta rencana item, tugas, dan pengaturan pengingatnya. */
    public static function hapusSiklus(SiklusTanam $s): void
    {
        DB::table('rencana_item')->where('siklus_id', $s->id)->delete();
        DB::table('tugas')->where('siklus_id', $s->id)->delete();
        DB::table('pengaturan_pengingat')->where('siklus_id', $s->id)->delete();
        DB::table('siklus_tanam')->where('id', $s->id)->delete();
    }
}
