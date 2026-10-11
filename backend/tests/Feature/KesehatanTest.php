<?php

use Illuminate\Support\Facades\DB;

it('GET /api/v1/kesehatan menjawab dengan format kontrak', function () {
    $this->getJson('/api/v1/kesehatan')
        ->assertOk()
        ->assertExactJsonStructure(['data' => ['status', 'basis_data', 'waktu']])
        ->assertJsonPath('data.status', 'sehat')
        ->assertJsonPath('data.basis_data', 'tersambung')
        ->assertJson(fn ($json) => $json->where(
            'data.waktu',
            fn (string $w) => preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/', $w) === 1,
        ));
});

it('tes memakai basis data uji, bukan basis data pengembangan', function () {
    expect(DB::connection()->getDriverName())->toBe('mariadb')
        ->and(DB::connection()->getDatabaseName())->toBe('tani_muda_uji');
});

it('basis data tidak terjangkau: 503 SUMBER_BELUM_TERSEDIA tanpa rincian teknis', function () {
    config(['database.connections.mariadb.port' => 1]);
    DB::purge('mariadb');

    $this->getJson('/api/v1/kesehatan')
        ->assertStatus(503)
        ->assertExactJson(['galat' => [
            'kode' => 'SUMBER_BELUM_TERSEDIA',
            'pesan' => 'Sambungan ke server belum tersedia',
        ]]);
})->after(function () {
    config(['database.connections.mariadb.port' => env('DB_PORT', '3306')]);
    DB::purge('mariadb');
});
