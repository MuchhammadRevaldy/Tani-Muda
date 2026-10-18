<?php

use Database\Seeders\WilayahSeeder;
use Illuminate\Support\Facades\DB;

/*
 * Seeder wilayah dari dataset resmi (D-54). Kecocokan kode dan nama desa di data contoh dengan
 * dataset dites di frontend (src/api/tiruan/data/data.test.ts).
 */

it('mengimpor semua desa dan kelurahan dengan nama induknya; titik hanya untuk desa pilot, ditandai perkiraan', function () {
    // Dibaca per baris dan ditulis per potongan: memori tidak tumbuh mengikuti jumlah desa.
    memory_reset_peak_usage();
    $awal = memory_get_usage();
    $this->seed(WilayahSeeder::class);
    expect(memory_get_peak_usage() - $awal)->toBeLessThan(16 * 1024 * 1024);

    expect(DB::table('wilayah')->count())->toBe(83762)
        ->and(DB::table('wilayah')->where('kode_terverifikasi', false)->count())->toBe(0);

    expect((array) DB::table('wilayah')->find('32.17.01.2003'))->toMatchArray([
        'desa' => 'Lembang', 'kecamatan' => 'Lembang', 'kabupaten' => 'Kabupaten Bandung Barat',
        'provinsi' => 'Jawa Barat', 'lintang' => '-6.818600', 'bujur' => '107.619800', 'koordinat_perkiraan' => 1,
    ]);
    expect((array) DB::table('wilayah')->find('32.73.08.1003'))->toMatchArray([
        'desa' => 'Ledeng', 'kecamatan' => 'Cidadap', 'kabupaten' => 'Kota Bandung',
    ]);

    expect(DB::table('wilayah_kabupaten')->count())->toBe(514)
        ->and(DB::table('wilayah_kecamatan')->count())->toBe(7285);

    $titik = DB::table('wilayah')->whereNotNull('lintang')->pluck('id');
    expect($titik)->toHaveCount(18 + 8563)
        ->and(DB::table('wilayah')->where('id', 'like', '32.17.01.%')->whereNull('lintang')->count())->toBe(0)
        ->and(DB::table('wilayah')->where('id', 'like', '33.%')->whereNull('lintang')->count())->toBe(0)
        ->and(DB::table('wilayah')->whereNotNull('lintang')->where('koordinat_perkiraan', false)->count())->toBe(0);

    // Desa di Klaten, Jawa Tengah (AG-41): punya koordinat perkiraan dari kecamatan dan kode induk
    expect((array) DB::table('wilayah')->find('33.10.16.2013'))->toMatchArray([
        'desa' => 'Delanggu', 'kecamatan' => 'Delanggu', 'kabupaten' => 'Kabupaten Klaten',
        'provinsi' => 'Jawa Tengah', 'kabupaten_id' => '33.10', 'kecamatan_id' => '33.10.16',
        'lintang' => '-7.619400', 'bujur' => '110.699300', 'koordinat_perkiraan' => 1,
    ]);

    // Desa di luar pilot: ada, tetapi tanpa titik.
    expect((array) DB::table('wilayah')->find('11.01.01.2001'))->toMatchArray([
        'desa' => 'Keude Bakongan', 'lintang' => null, 'bujur' => null, 'koordinat_perkiraan' => 0,
    ]);
    // Tanda kutip SQL dan karakter UTF-8 di nama.
    expect(DB::table('wilayah')->where('desa', "Pasi Kuala Ba'u")->exists())->toBeTrue()
        ->and(DB::table('wilayah')->where('id', '53.07.01.2021')->value('desa'))->toBe('Regapu’u');
});

it('aman dijalankan ulang: titik yang diisi kemudian tidak ditimpa kosong', function () {
    $this->seed(WilayahSeeder::class);
    DB::table('wilayah')->where('id', '11.01.01.2001')->update(['lintang' => 3.1, 'bujur' => 97.2]);
    DB::table('wilayah')->where('id', '32.17.01.2003')->update(['desa' => 'Salah']);

    $this->seed(WilayahSeeder::class);

    expect(DB::table('wilayah')->count())->toBe(83762)
        ->and(DB::table('wilayah')->where('id', '11.01.01.2001')->value('lintang'))->toBe('3.100000')
        ->and(DB::table('wilayah')->where('id', '32.17.01.2003')->value('desa'))->toBe('Lembang');
});

it('dataset utuh: semua tingkat terbaca dan setiap desa punya induk', function () {
    $kode = iterator_to_array(WilayahSeeder::bacaDataset(jalurRepo('shared/wilayah/wilayah.sql')));
    $tingkat = array_count_values(array_map(fn ($k) => substr_count($k, '.'), array_keys($kode)));
    ksort($tingkat);

    expect(count($kode))->toBe(91599)
        ->and($tingkat)->toBe([0 => 38, 1 => 514, 2 => 7285, 3 => 83762])
        ->and(hash_file('sha256', jalurRepo('shared/wilayah/wilayah.sql')))
        ->toBe('c4c3396d9380d4edee072af1d9dff83573b574d7cd00a6562cf82e200e954031');
});
