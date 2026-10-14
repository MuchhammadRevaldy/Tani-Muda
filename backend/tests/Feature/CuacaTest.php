<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

function masukSebagaiCuaca(string $id): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $id])->assertOk();
    app('auth')->forgetGuards();
}

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
    Cache::flush();
});

it('cuaca: belum masuk ditolak 401', function () {
    $this->getJson('/api/v1/cuaca')->assertStatus(401);
});

it('cuaca: peran pembeli ditolak 403', function () {
    masukSebagaiCuaca('pembeli-ratna');
    $this->getJson('/api/v1/cuaca')->assertStatus(403);
});

it('cuaca: petani berhasil mendapatkan cuaca Open-Meteo dan status kecocokan siklus aktifnya', function () {
    masukSebagaiCuaca('petani-arif');

    Http::fake([
        'https://api.open-meteo.com/*' => Http::response([
            'current' => [
                'temperature_2m' => 24.5,
                'time' => '2026-10-15T10:00:00Z',
            ],
            'daily' => [
                'temperature_2m_max' => [28.0],
                'temperature_2m_min' => [19.0],
            ],
        ], 200),
    ]);

    $res = $this->getJson('/api/v1/cuaca');
    $res->assertOk()
        ->assertJsonStructure([
            'data' => [
                'desa',
                'suhu_sekarang',
                'suhu_maks',
                'suhu_min',
                'diperbarui_pada',
                'sumber',
                'siklus' => [
                    '*' => [
                        'siklus_id',
                        'nama_tanaman',
                        'status',
                        'label',
                        'cocok',
                        'saran',
                    ],
                ],
            ],
        ]);

    expect($res->json('data.sumber'))->toBe('Open-Meteo')
        ->and($res->json('data.suhu_sekarang'))->toBe(24.5);

    // Arif punya siklus aktif sawi, suhu ideal 15-25, maka 24.5 harus 'cocok'
    $siklus = $res->json('data.siklus');
    if (! empty($siklus)) {
        expect($siklus[0]['cocok'])->toBeTrue()
            ->and($siklus[0]['status'])->toBe('cocok');
    }
});

it('cuaca: respons dicache selama 1 jam sehingga tidak mengulang panggilan Open-Meteo', function () {
    masukSebagaiCuaca('petani-arif');

    Http::fake([
        'https://api.open-meteo.com/*' => Http::response([
            'current' => [
                'temperature_2m' => 23.0,
                'time' => '2026-10-15T11:00:00Z',
            ],
            'daily' => [
                'temperature_2m_max' => [27.0],
                'temperature_2m_min' => [18.0],
            ],
        ], 200),
    ]);

    // Panggilan pertama
    $this->getJson('/api/v1/cuaca')->assertOk();

    // Panggilan kedua
    $this->getJson('/api/v1/cuaca')->assertOk();

    // Open-Meteo hanya dipanggil 1 kali karena cache 1 jam
    Http::assertSentCount(1);
});

it('cuaca: gagal jaringan mengembalikan 503 CUACA_TIDAK_TERSEDIA dengan pesan rapi', function () {
    masukSebagaiCuaca('petani-arif');

    Http::fake([
        'https://api.open-meteo.com/*' => Http::response('Gateway Timeout', 504),
    ]);

    $res = $this->getJson('/api/v1/cuaca');
    $res->assertStatus(503)
        ->assertJsonPath('galat.kode', 'CUACA_TIDAK_TERSEDIA');
});
