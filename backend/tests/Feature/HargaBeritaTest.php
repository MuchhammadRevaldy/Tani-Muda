<?php

use App\Domain\Berita\LayananHargaBerita;
use App\Enums\JenisHargaBerita;
use App\Models\HargaBerita;
use App\Models\Pengguna;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
    DB::table('harga_berita')->delete();
    $this->pengguna = Pengguna::first();
});

it('berhasil mengambil harga berita dengan label harga pasar dan tanpa mengisi harga otomatis', function () {
    HargaBerita::create([
        'komoditas_id' => 'cabai',
        'kabupaten' => $this->pengguna->wilayah?->kabupaten ?? 'Kabupaten Klaten',
        'harga' => 38000,
        'satuan' => 'kg',
        'jenis_harga' => JenisHargaBerita::Pasar,
        'lokasi' => 'Pasar Klaten',
        'tanggal_berita' => CarbonImmutable::now()->toDateString(),
        'judul' => 'Harga Cabai Hari Ini',
        'media' => 'Kabar Pasar',
        'url' => 'https://kabar-pasar.test/cabai-1',
    ]);

    $res = $this->actingAs($this->pengguna)
        ->getJson('/api/v1/harga-berita?komoditas_id=cabai')
        ->assertOk()
        ->json();

    expect($res['label'])->toBe(LayananHargaBerita::LABEL_WAJIB)
        ->and($res['data'])->toHaveCount(1)
        ->and($res['data'][0]['harga'])->toBe(38000)
        ->and($res['data'][0]['media'])->toBe('Kabar Pasar')
        ->and($res['data'][0]['url'])->toBe('https://kabar-pasar.test/cabai-1');
});

it('menolak jika komoditas_id tidak dikirim', function () {
    $this->actingAs($this->pengguna)
        ->getJson('/api/v1/harga-berita')
        ->assertStatus(422)
        ->assertJsonPath('galat.kode', 'VALIDASI');
});

it('mengembalikan pesan belum ada kabar harga hari ini bila tidak ada artikel baru', function () {
    // Simpan artikel lama lebih dari 3 hari lalu
    HargaBerita::create([
        'komoditas_id' => 'tomat',
        'kabupaten' => $this->pengguna->wilayah?->kabupaten ?? 'Kabupaten Klaten',
        'harga' => 10000,
        'satuan' => 'kg',
        'jenis_harga' => JenisHargaBerita::Pasar,
        'lokasi' => 'Pasar Lama',
        'tanggal_berita' => CarbonImmutable::now()->subDays(5)->toDateString(),
        'judul' => 'Berita Tomat Pekan Lalu',
        'media' => 'Warta Lama',
        'url' => 'https://warta-lama.test/tomat',
    ]);

    // Mock Http fake kosong
    Http::fake([
        'https://api-berita-pertanian.test/*' => Http::response(['data' => []], 200),
    ]);

    $res = $this->actingAs($this->pengguna)
        ->getJson('/api/v1/harga-berita?komoditas_id=tomat')
        ->assertOk()
        ->json();

    expect($res['label'])->toBe(LayananHargaBerita::LABEL_WAJIB)
        ->and($res['keterangan'])->toBe(LayananHargaBerita::PESAN_KOSONG)
        ->and($res['data'])->toBeEmpty();
});

it('memanggil API resmi berita dengan Http::fake dan menyimpan artikel valid', function () {
    $hariIni = CarbonImmutable::now()->toDateString();
    $tigaHariLalu = CarbonImmutable::now()->subDays(5)->toDateString();

    Http::fake([
        'https://api-berita-pertanian.test/*' => Http::response([
            'data' => [
                [
                    'harga' => 42000,
                    'satuan' => 'kg',
                    'jenis_harga' => 'pasar',
                    'lokasi' => 'Pasar Panorama',
                    'tanggal_berita' => $hariIni,
                    'judul' => 'Harga Cabai Naik',
                    'media' => 'Antara',
                    'url' => 'https://antara.test/cabai-naik',
                ],
                [
                    // Berita lama > 3 hari harus dibuang
                    'harga' => 30000,
                    'satuan' => 'kg',
                    'jenis_harga' => 'pasar',
                    'lokasi' => 'Pasar Induk',
                    'tanggal_berita' => $tigaHariLalu,
                    'judul' => 'Harga Cabai Pekan Lalu',
                    'media' => 'Antara',
                    'url' => 'https://antara.test/cabai-lama',
                ],
            ],
        ], 200),
    ]);

    $res = $this->actingAs($this->pengguna)
        ->getJson('/api/v1/harga-berita?komoditas_id=cabai')
        ->assertOk()
        ->json('data');

    expect($res)->toHaveCount(1)
        ->and($res[0]['harga'])->toBe(42000)
        ->and($res[0]['url'])->toBe('https://antara.test/cabai-naik');

    expect(HargaBerita::where('url', 'https://antara.test/cabai-lama')->exists())->toBeFalse();
});

it('menegakkan batasan CHECK pada tabel harga_berita: harga harus positif dan jenis valid', function () {
    // 1. Harga harus positif (> 0)
    expect(function () {
        DB::table('harga_berita')->insert([
            'id' => 'hb-negatif',
            'komoditas_id' => 'cabai',
            'kabupaten' => 'Kabupaten Klaten',
            'harga' => 0,
            'satuan' => 'kg',
            'jenis_harga' => 'pasar',
            'lokasi' => 'Pasar',
            'tanggal_berita' => '2026-10-15',
            'judul' => 'Judul',
            'media' => 'Media',
            'url' => 'https://berita.test/0',
            'dibuat_pada' => now(),
            'diperbarui_pada' => now(),
        ]);
    })->toThrow(QueryException::class);

    // 2. Jenis harga harus pasar, eceran, atau petani
    expect(function () {
        DB::table('harga_berita')->insert([
            'id' => 'hb-jenis-salah',
            'komoditas_id' => 'cabai',
            'kabupaten' => 'Kabupaten Klaten',
            'harga' => 20000,
            'satuan' => 'kg',
            'jenis_harga' => 'grosir_ilegal',
            'lokasi' => 'Pasar',
            'tanggal_berita' => '2026-10-15',
            'judul' => 'Judul',
            'media' => 'Media',
            'url' => 'https://berita.test/jenis-salah',
            'dibuat_pada' => now(),
            'diperbarui_pada' => now(),
        ]);
    })->toThrow(QueryException::class);
});
