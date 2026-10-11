<?php

namespace Database\Seeders;

use Generator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Seluruh desa dan kelurahan Indonesia dari dataset resmi shared/wilayah/wilayah.sql (D-54).
 *
 * Satu baris per desa/kelurahan, dengan nama kecamatan, kabupaten/kota, dan provinsi dari kode
 * induknya, jadi setiap kode di dataset (semua tingkat) terwakili. Titik tengah hanya untuk desa di
 * shared/wilayah/titik-tengah.json, dan ditandai perkiraan; desa lain belum tersedia di pilot (D-56).
 *
 * Isi SQL tidak dijalankan: hanya tupel `('kode','nama')` yang dibaca, per baris. Seeder memakai
 * upsert, jadi aman diulang; titik yang sudah ada tidak ditimpa kosong untuk desa tanpa titik di berkas.
 */
class WilayahSeeder extends Seeder
{
    private const POTONGAN = 1000;

    public function run(): void
    {
        $titik = self::bacaTitik(base_path('../shared/wilayah/titik-tengah.json'));
        $nama = ['desa', 'kecamatan', 'kabupaten', 'provinsi', 'kode_terverifikasi'];

        // Dibaca per baris dan ditulis per potongan, supaya memori tetap kecil (VPS, laptop 2 GB).
        DB::transaction(function () use ($titik, $nama) {
            $induk = [];
            $denganTitik = [];
            $tanpaTitik = [];
            $jumlah = 0;
            foreach (self::bacaDataset(base_path('../shared/wilayah/wilayah.sql')) as $k => $namaWilayah) {
                if (substr_count($k, '.') < 3) {
                    $induk[$k] = $namaWilayah;

                    continue;
                }
                [$pp, $kk, $cc] = explode('.', $k);
                $baris = [
                    'id' => $k,
                    'desa' => $namaWilayah,
                    'kecamatan' => $induk["{$pp}.{$kk}.{$cc}"] ?? throw new RuntimeException("Induk {$k} belum terbaca"),
                    'kabupaten' => $induk["{$pp}.{$kk}"] ?? throw new RuntimeException("Induk {$k} belum terbaca"),
                    'provinsi' => $induk[$pp] ?? throw new RuntimeException("Induk {$k} belum terbaca"),
                    'kode_terverifikasi' => true,
                ];
                $jumlah++;
                if (isset($titik[$k])) {
                    $denganTitik[] = $baris + $titik[$k] + ['koordinat_perkiraan' => true];

                    continue;
                }
                $tanpaTitik[] = $baris;
                if (count($tanpaTitik) >= self::POTONGAN) {
                    DB::table('wilayah')->upsert($tanpaTitik, ['id'], $nama);
                    $tanpaTitik = [];
                }
            }
            if ($jumlah === 0) {
                throw new RuntimeException('Dataset wilayah kosong.');
            }
            if ($tanpaTitik !== []) {
                DB::table('wilayah')->upsert($tanpaTitik, ['id'], $nama);
            }
            if ($denganTitik !== []) {
                DB::table('wilayah')->upsert($denganTitik, ['id'], [...$nama, 'lintang', 'bujur', 'koordinat_perkiraan']);
            }
        });
    }

    /**
     * Kode → nama dari berkas dataset, urut seperti di berkas (induk sebelum anaknya), dibaca per
     * baris. Tanda kutip di nama ditulis `''` (SQL).
     *
     * @return Generator<string, string>
     */
    public static function bacaDataset(string $jalur): Generator
    {
        $berkas = fopen($jalur, 'rb');
        if ($berkas === false) {
            throw new RuntimeException("Dataset wilayah tidak terbaca: {$jalur}");
        }
        try {
            while (($baris = fgets($berkas)) !== false) {
                if (preg_match_all("/\('([0-9.]+)','((?:[^']|'')*)'\)/u", $baris, $m, PREG_SET_ORDER)) {
                    foreach ($m as [, $k, $nama]) {
                        yield $k => str_replace("''", "'", $nama);
                    }
                }
            }
        } finally {
            fclose($berkas);
        }
    }

    /**
     * @return array<string, array{lintang: float, bujur: float}>
     */
    public static function bacaTitik(string $jalur): array
    {
        $isi = json_decode((string) file_get_contents($jalur), true, flags: JSON_THROW_ON_ERROR);
        $hasil = [];
        foreach ($isi['titik'] as $t) {
            $hasil[$t['id']] = ['lintang' => (float) $t['lintang'], 'bujur' => (float) $t['bujur']];
        }

        return $hasil;
    }
}
