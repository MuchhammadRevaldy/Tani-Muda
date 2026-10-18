<?php

use App\Models\Wilayah;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;

/*
 * Tes endpoint bertingkat kabupaten → kecamatan → desa (AG-41, D-67).
 */

beforeEach(function () {
    $pengguna = \App\Models\Pengguna::create([
        'id' => 'pengguna-uji',
        'nomor_hp' => '+6281200000099',
        'nama' => 'Pengguna Uji',
        'status_akun' => 'aktif',
    ]);
    test()->actingAs($pengguna);

    // Siapkan data kabupaten, kecamatan, dan desa untuk pengujian
    WilayahKabupaten::create([
        'id' => '33.10',
        'nama' => 'Kabupaten Klaten',
        'provinsi_id' => '33',
        'lintang' => -7.7056,
        'bujur' => 110.6067,
    ]);
    WilayahKabupaten::create([
        'id' => '33.74',
        'nama' => 'Kota Semarang',
        'provinsi_id' => '33',
        'lintang' => -6.9932,
        'bujur' => 110.4203,
    ]);
    WilayahKabupaten::create([
        'id' => '32.17',
        'nama' => 'Kabupaten Bandung Barat',
        'provinsi_id' => '32',
        'lintang' => -6.8439,
        'bujur' => 107.5028,
    ]);

    WilayahKecamatan::create([
        'id' => '33.10.16',
        'nama' => 'Delanggu',
        'kabupaten_id' => '33.10',
        'lintang' => -7.6258,
        'bujur' => 110.6974,
        'koordinat_perkiraan' => true,
    ]);
    WilayahKecamatan::create([
        'id' => '33.10.01',
        'nama' => 'Prambanan',
        'kabupaten_id' => '33.10',
        'lintang' => -7.7554,
        'bujur' => 110.4952,
        'koordinat_perkiraan' => true,
    ]);
    WilayahKecamatan::create([
        'id' => '32.17.01',
        'nama' => 'Lembang',
        'kabupaten_id' => '32.17',
        'lintang' => -6.8186,
        'bujur' => 107.6198,
        'koordinat_perkiraan' => true,
    ]);

    Wilayah::create([
        'id' => '33.10.16.2001',
        'desa' => 'Gatak',
        'kecamatan' => 'Delanggu',
        'kabupaten' => 'Kabupaten Klaten',
        'provinsi' => 'Jawa Tengah',
        'kabupaten_id' => '33.10',
        'kecamatan_id' => '33.10.16',
        'lintang' => -7.6258,
        'bujur' => 110.6974,
        'koordinat_perkiraan' => true,
        'kode_terverifikasi' => true,
    ]);
    Wilayah::create([
        'id' => '33.10.16.2002',
        'desa' => 'Delanggu',
        'kecamatan' => 'Delanggu',
        'kabupaten' => 'Kabupaten Klaten',
        'provinsi' => 'Jawa Tengah',
        'kabupaten_id' => '33.10',
        'kecamatan_id' => '33.10.16',
        'lintang' => -7.6258,
        'bujur' => 110.6974,
        'koordinat_perkiraan' => true,
        'kode_terverifikasi' => true,
    ]);
    Wilayah::create([
        'id' => '32.17.01.2003',
        'desa' => 'Lembang',
        'kecamatan' => 'Lembang',
        'kabupaten' => 'Kabupaten Bandung Barat',
        'provinsi' => 'Jawa Barat',
        'kabupaten_id' => '32.17',
        'kecamatan_id' => '32.17.01',
        'lintang' => -6.8186,
        'bujur' => 107.6198,
        'koordinat_perkiraan' => true,
        'kode_terverifikasi' => true,
    ]);
});

it('GET /wilayah/kabupaten hanya menampilkan wilayah provinsi aktif (Jawa Tengah 33)', function () {
    $r = $this->getJson('/api/v1/wilayah/kabupaten')->assertOk()->json('data');
    $ids = array_column($r, 'id');

    expect($ids)->toContain('33.10')
        ->toContain('33.74')
        ->not->toContain('32.17');
});

it('GET /wilayah/kecamatan menampilkan kecamatan berdasarkan kabupaten', function () {
    $this->getJson('/api/v1/wilayah/kecamatan')->assertStatus(422);

    $r = $this->getJson('/api/v1/wilayah/kecamatan?kabupaten=33.10')->assertOk()->json('data');
    $ids = array_column($r, 'id');

    expect($ids)->toContain('33.10.16')
        ->toContain('33.10.01')
        ->not->toContain('32.17.01');
});

it('GET /wilayah/desa menampilkan desa berdasarkan kecamatan dan mendukung pencarian nama desa', function () {
    $this->getJson('/api/v1/wilayah/desa')->assertStatus(422);

    $r = $this->getJson('/api/v1/wilayah/desa?kecamatan=33.10.16')->assertOk()->json('data');
    $desa = array_column($r, 'desa');
    expect($desa)->toContain('Delanggu')->toContain('Gatak');

    $rCari = $this->getJson('/api/v1/wilayah/desa?kecamatan=33.10.16&cari=Del')->assertOk()->json('data');
    $desaCari = array_column($rCari, 'desa');
    expect($desaCari)->toBe(['Delanggu']);
});

it('GET /wilayah menyaring sesuai wilayah_provinsi_aktif secara bawaan', function () {
    $r = $this->getJson('/api/v1/wilayah')->assertOk()->json('data');
    $ids = array_column($r, 'id');

    expect(count($ids))->toBe(2)
        ->and($ids)->toContain('33.10.16.2001')
        ->and($ids)->not->toContain('32.17.01.2003');
});
