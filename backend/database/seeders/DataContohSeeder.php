<?php

namespace Database\Seeders;

use App\Support\TanggalRelatif;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Data contoh dari shared/data-contoh/*.json (T5.08), sama persis dengan klien tiruan.
 *
 * Tanggal relatif ("H-13", "H+0T07:00", "B+2") diselesaikan terhadap hari ini di zona tampilan
 * bawaan, dan "J±n" terhadap saat seeder dijalankan, seperti "Atur ulang data demo" di klien tiruan
 * (D-47). Tabel diisi berurutan mengikuti kunci asing, dengan pemeriksaan kunci asing tetap menyala.
 */
class DataContohSeeder extends Seeder
{
    /** [berkas, kunci di berkas (null = seluruh berkas), tabel], urut kunci asing. */
    public const URUTAN = [
        ['referensi', 'komoditas', 'komoditas'],
        ['referensi', 'metode', 'metode_tanam'],
        ['referensi', 'sistem_hidroponik', 'sistem_hidroponik'],
        ['referensi', 'konversi_satuan', 'konversi_satuan'],
        ['referensi', 'input_pertanian', 'input_pertanian'],
        ['referensi', 'merek_input', 'merek_input'],
        ['pengguna', 'pengguna', 'pengguna'],
        ['pengguna', 'profil_pembeli', 'profil_pembeli'],
        ['referensi', 'laporan_harga', 'laporan_harga'],
        ['referensi', 'kelayakan_subsidi', 'kelayakan_subsidi'],
        ['referensi', 'promo', 'promo'],
        ['resep', null, 'resep_tanam'],
        ['modul', null, 'modul'],
        ['kebun', 'lahan', 'lahan'],
        ['pesanan', 'pesanan', 'pesanan'],
        ['pesanan', 'alokasi', 'alokasi_pesanan'],
        ['kebun', 'siklus', 'siklus_tanam'],
        ['kebun', 'rencana_item', 'rencana_item'],
        ['kebun', 'tugas', 'tugas'],
        ['kebun', 'hasil_pengukuran', 'hasil_pengukuran'],
        ['kebun', 'pengeluaran', 'pengeluaran'],
        ['kebun', 'jurnal', 'jurnal'],
        ['kebun', 'pengaturan_pengingat', 'pengaturan_pengingat'],
        ['kebun', 'progres_modul', 'progres_modul'],
        ['pesanan', 'pengiriman', 'pengiriman'],
        ['pesanan', 'pembayaran', 'pembayaran'],
        ['pesanan', 'rating', 'rating'],
        ['pesanan', 'sengketa', 'sengketa'],
        ['pengguna', 'catatan_petani', 'catatan_petani'],
        ['pesanan', 'permintaan_resep', 'permintaan_resep'],
        ['stok', 'stok', 'stok'],
        ['chat', 'percakapan', 'percakapan'],
        ['chat', 'pesan', 'pesan'],
    ];

    /** Tabel referensi yang juga dipakai seeder produksi (tanpa resep contoh dan pengguna uji, D-12). */
    public const REFERENSI_PRODUKSI = ['komoditas', 'metode_tanam', 'sistem_hidroponik', 'konversi_satuan', 'input_pertanian', 'modul'];

    private const POTONGAN = 500;

    public function run(): void
    {
        self::isi(CarbonImmutable::now());
    }

    /** Isi semua tabel data contoh dengan waktu relatif terhadap `$sekarang`. */
    public static function isi(CarbonImmutable $sekarang, bool $hanyaProduksi = false): void
    {
        $zona = (string) config('app.zona_waktu_tampilan', 'Asia/Jakarta');
        $hariIni = $sekarang->setTimezone($zona)->toDateString();
        $baca = fn (string $berkas) => TanggalRelatif::selesaikan(self::bacaBerkas($berkas), $hariIni, $zona, $sekarang);

        DB::transaction(function () use ($baca, $hanyaProduksi) {
            self::isiWilayah($baca('wilayah'));
            self::isiKonfigurasi($baca('konfigurasi'));
            $berkas = [];
            foreach (self::URUTAN as [$nama, $kunci, $tabel]) {
                if ($hanyaProduksi && ! in_array($tabel, self::REFERENSI_PRODUKSI, true)) {
                    continue;
                }
                $berkas[$nama] ??= $baca($nama);
                $baris = $kunci === null ? $berkas[$nama] : $berkas[$nama][$kunci];
                if ($tabel === 'resep_tanam') {
                    self::isiResep($baris);

                    continue;
                }
                if ($tabel === 'rencana_item') {
                    $baris = self::denganUrutan($baris, 'siklus_id');
                }
                if ($tabel === 'siklus_tanam') {
                    $baris = array_map(fn ($b, $i) => $b + ['urutan' => $i + 1], $baris, array_keys($baris));
                }
                self::sisipkan($tabel, $baris);
            }
        });
    }

    /** @return array<mixed> */
    public static function bacaBerkas(string $nama): array
    {
        $jalur = base_path("../shared/data-contoh/{$nama}.json");
        $isi = file_get_contents($jalur);
        if ($isi === false) {
            throw new RuntimeException("Data contoh tidak terbaca: {$jalur}");
        }

        return json_decode($isi, true, flags: JSON_THROW_ON_ERROR);
    }

    /**
     * Baris JSON menjadi baris tabel: larik dan objek menjadi JSON, waktu ISO UTC menjadi format
     * DATETIME (koneksi basis data memakai UTC).
     *
     * @param  array<string, mixed>  $baris
     * @return array<string, mixed>
     */
    public static function keBaris(array $baris): array
    {
        return array_map(function ($nilai) {
            if (is_array($nilai)) {
                return json_encode($nilai, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
            }
            if (is_string($nilai) && preg_match('/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(\.\d+)?Z$/', $nilai, $m)) {
                return "{$m[1]} {$m[2]}";
            }

            return $nilai;
        }, $baris);
    }

    /** @param  list<array<string, mixed>>  $baris */
    private static function sisipkan(string $tabel, array $baris): void
    {
        foreach (array_chunk(array_map(self::keBaris(...), $baris), self::POTONGAN) as $potongan) {
            DB::table($tabel)->insert($potongan);
        }
    }

    /**
     * Nomor urut per induk mengikuti urutan baris di JSON (urutan tampil klien tiruan).
     *
     * @param  list<array<string, mixed>>  $baris
     * @return list<array<string, mixed>>
     */
    private static function denganUrutan(array $baris, string $induk): array
    {
        $hitung = [];

        return array_map(function ($b) use (&$hitung, $induk) {
            $hitung[$b[$induk]] = ($hitung[$b[$induk]] ?? 0) + 1;

            return $b + ['urutan' => $hitung[$b[$induk]]];
        }, $baris);
    }

    /**
     * Wilayah data contoh: upsert, karena seluruh wilayah resmi mungkin sudah diisi WilayahSeeder.
     *
     * @param  list<array<string, mixed>>  $baris
     */
    private static function isiWilayah(array $baris): void
    {
        $sekarang = now();
        $kabupaten = [];
        $kecamatan = [];
        $desa = [];

        foreach ($baris as $w) {
            [$pp, $kk, $cc] = explode('.', $w['id']);
            $kabId = "{$pp}.{$kk}";
            $kecId = "{$pp}.{$kk}.{$cc}";

            $kabupaten[$kabId] = [
                'id' => $kabId,
                'nama' => $w['kabupaten'],
                'provinsi_id' => $pp,
                'dibuat_pada' => $sekarang,
                'diperbarui_pada' => $sekarang,
            ];

            $kecamatan[$kecId] = [
                'id' => $kecId,
                'nama' => $w['kecamatan'],
                'kabupaten_id' => $kabId,
                'dibuat_pada' => $sekarang,
                'diperbarui_pada' => $sekarang,
            ];

            $desa[] = $w + [
                'kabupaten_id' => $kabId,
                'kecamatan_id' => $kecId,
                'koordinat_perkiraan' => $w['lintang'] !== null,
            ];
        }

        DB::table('wilayah_kabupaten')->upsert(array_values($kabupaten), ['id'], ['nama', 'provinsi_id']);
        DB::table('wilayah_kecamatan')->upsert(array_values($kecamatan), ['id'], ['nama', 'kabupaten_id']);
        DB::table('wilayah')->upsert($desa, ['id']);
    }

    /** @param  array<string, mixed>  $konfigurasi */
    private static function isiKonfigurasi(array $konfigurasi): void
    {
        $diperbarui = self::keBaris(['w' => $konfigurasi['diperbarui_pada']])['w'];
        unset($konfigurasi['diperbarui_pada']);
        $baris = [];
        foreach ($konfigurasi as $kunci => $nilai) {
            $baris[] = [
                'kunci' => $kunci,
                'nilai' => json_encode($nilai, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                'dibuat_pada' => $diperbarui,
                'diperbarui_pada' => $diperbarui,
            ];
        }
        DB::table('konfigurasi')->upsert($baris, ['kunci']);
    }

    /**
     * Resep beserta input dan tugasnya (urutan sesuai larik di JSON, mulai 1).
     *
     * @param  list<array<string, mixed>>  $resep
     */
    private static function isiResep(array $resep): void
    {
        foreach ($resep as $r) {
            $input = $r['input'];
            $tugas = $r['tugas'];
            unset($r['input'], $r['tugas']);
            self::sisipkan('resep_tanam', [$r]);
            self::sisipkan('resep_input', array_map(
                fn ($x, $i) => ['resep_id' => $r['id'], 'urutan' => $i + 1] + $x,
                $input,
                array_keys($input),
            ));
            self::sisipkan('resep_tugas', array_map(
                fn ($x, $i) => ['resep_id' => $r['id'], 'urutan' => $i + 1] + $x,
                $tugas,
                array_keys($tugas),
            ));
        }
    }
}
