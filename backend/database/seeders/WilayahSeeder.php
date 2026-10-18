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
        $titikDesa = self::bacaTitik(base_path('../shared/wilayah/titik-tengah.json'));
        $jateng = self::bacaTitikKecamatanJateng(base_path('../shared/wilayah/titik-kecamatan-jateng.json'));
        $titikKabJateng = $jateng['kabupaten'];
        $titikKecJateng = $jateng['kecamatan'];

        $namaDesa = ['desa', 'kecamatan', 'kabupaten', 'provinsi', 'kabupaten_id', 'kecamatan_id', 'kode_terverifikasi'];
        $sekarang = now();

        // Dibaca per baris dan ditulis per potongan, supaya memori tetap kecil (VPS, laptop 2 GB).
        DB::transaction(function () use ($titikDesa, $titikKabJateng, $titikKecJateng, $namaDesa, $sekarang) {
            $induk = [];
            $batchKab = [];
            $batchKec = [];
            $denganTitik = [];
            $tanpaTitik = [];
            $jumlah = 0;

            foreach (self::bacaDataset(base_path('../shared/wilayah/wilayah.sql')) as $k => $namaWilayah) {
                $tingkat = substr_count($k, '.');

                if ($tingkat === 0) {
                    $induk[$k] = $namaWilayah;
                    continue;
                }

                if ($tingkat === 1) {
                    $induk[$k] = $namaWilayah;
                    [$pp] = explode('.', $k);
                    $kabPoint = $titikKabJateng[$k] ?? null;
                    $batchKab[] = [
                        'id' => $k,
                        'nama' => $namaWilayah,
                        'provinsi_id' => $pp,
                        'lintang' => $kabPoint['lintang'] ?? null,
                        'bujur' => $kabPoint['bujur'] ?? null,
                        'dibuat_pada' => $sekarang,
                        'diperbarui_pada' => $sekarang,
                    ];
                    if (count($batchKab) >= self::POTONGAN) {
                        DB::table('wilayah_kabupaten')->upsert($batchKab, ['id'], ['nama', 'provinsi_id', 'lintang', 'bujur']);
                        $batchKab = [];
                    }
                    continue;
                }

                if ($tingkat === 2) {
                    $induk[$k] = $namaWilayah;
                    [$pp, $kk] = explode('.', $k);
                    $kecPoint = $titikKecJateng[$k] ?? null;
                    $batchKec[] = [
                        'id' => $k,
                        'nama' => $namaWilayah,
                        'kabupaten_id' => "{$pp}.{$kk}",
                        'lintang' => $kecPoint['lintang'] ?? null,
                        'bujur' => $kecPoint['bujur'] ?? null,
                        'koordinat_perkiraan' => true,
                        'dibuat_pada' => $sekarang,
                        'diperbarui_pada' => $sekarang,
                    ];
                    if (count($batchKec) >= self::POTONGAN) {
                        DB::table('wilayah_kecamatan')->upsert($batchKec, ['id'], ['nama', 'kabupaten_id', 'lintang', 'bujur', 'koordinat_perkiraan']);
                        $batchKec = [];
                    }
                    continue;
                }

                [$pp, $kk, $cc] = explode('.', $k);
                $kabId = "{$pp}.{$kk}";
                $kecId = "{$pp}.{$kk}.{$cc}";

                $baris = [
                    'id' => $k,
                    'desa' => $namaWilayah,
                    'kecamatan' => $induk[$kecId] ?? throw new RuntimeException("Induk {$k} belum terbaca"),
                    'kabupaten' => $induk[$kabId] ?? throw new RuntimeException("Induk {$k} belum terbaca"),
                    'provinsi' => $induk[$pp] ?? throw new RuntimeException("Induk {$k} belum terbaca"),
                    'kabupaten_id' => $kabId,
                    'kecamatan_id' => $kecId,
                    'kode_terverifikasi' => true,
                ];
                $jumlah++;

                if (isset($titikDesa[$k])) {
                    $denganTitik[] = $baris + $titikDesa[$k] + ['koordinat_perkiraan' => true];
                } elseif ($pp === '33' && isset($titikKecJateng[$kecId]) && $titikKecJateng[$kecId]['lintang'] !== null) {
                    // Desa di Jawa Tengah yang belum punya koordinat sendiri memakai titik tengah kecamatannya (AG-41)
                    $denganTitik[] = $baris + [
                        'lintang' => $titikKecJateng[$kecId]['lintang'],
                        'bujur' => $titikKecJateng[$kecId]['bujur'],
                        'koordinat_perkiraan' => true,
                    ];
                } else {
                    $tanpaTitik[] = $baris;
                }

                if (count($denganTitik) >= self::POTONGAN) {
                    DB::table('wilayah')->upsert($denganTitik, ['id'], [...$namaDesa, 'lintang', 'bujur', 'koordinat_perkiraan']);
                    $denganTitik = [];
                }

                if (count($tanpaTitik) >= self::POTONGAN) {
                    DB::table('wilayah')->upsert($tanpaTitik, ['id'], $namaDesa);
                    $tanpaTitik = [];
                }
            }

            if ($jumlah === 0) {
                throw new RuntimeException('Dataset wilayah kosong.');
            }
            if ($batchKab !== []) {
                DB::table('wilayah_kabupaten')->upsert($batchKab, ['id'], ['nama', 'provinsi_id', 'lintang', 'bujur']);
            }
            if ($batchKec !== []) {
                DB::table('wilayah_kecamatan')->upsert($batchKec, ['id'], ['nama', 'kabupaten_id', 'lintang', 'bujur', 'koordinat_perkiraan']);
            }
            if ($tanpaTitik !== []) {
                DB::table('wilayah')->upsert($tanpaTitik, ['id'], $namaDesa);
            }
            if ($denganTitik !== []) {
                DB::table('wilayah')->upsert($denganTitik, ['id'], [...$namaDesa, 'lintang', 'bujur', 'koordinat_perkiraan']);
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

    /**
     * @return array{kabupaten: array<string, mixed>, kecamatan: array<string, mixed>}
     */
    public static function bacaTitikKecamatanJateng(string $jalur): array
    {
        if (! file_exists($jalur)) {
            return ['kabupaten' => [], 'kecamatan' => []];
        }
        $isi = json_decode((string) file_get_contents($jalur), true, flags: JSON_THROW_ON_ERROR);

        return [
            'kabupaten' => $isi['kabupaten'] ?? [],
            'kecamatan' => $isi['kecamatan'] ?? [],
        ];
    }
}
