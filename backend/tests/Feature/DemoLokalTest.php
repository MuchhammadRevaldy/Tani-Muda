<?php

use Illuminate\Support\Facades\Process;

/*
 * Endpoint demo /demo/* (kontrak 3.13, D-57) hanya didaftarkan saat APP_ENV=local (dan tes): di
 * lingkungan lain jalurnya tidak ada dan dijawab 404 seperti jalur yang tidak dikenal.
 */

it('rute /demo/* tidak terdaftar di production dan staging, terdaftar di local', function (string $env, int $jumlah) {
    $hasil = Process::path(base_path())->run([PHP_BINARY, 'artisan', 'route:list', '--path=demo', '--json', "--env={$env}"]);
    expect($hasil->successful())->toBeTrue($hasil->errorOutput());
    expect(json_decode($hasil->output(), true))->toHaveCount($jumlah);
})->with([['production', 0], ['staging', 0], ['local', 4]]);

it('permintaan ke /demo/* di production dijawab 404 TIDAK_DITEMUKAN', function () {
    $hasil = tungguPekerja(jalankanPekerja('pekerja-permintaan.php', ['/api/v1/demo/pengguna'], ['APP_ENV' => 'production']));
    expect($hasil)->toBe(['lingkungan' => 'production', 'status' => 404, 'kode' => 'TIDAK_DITEMUKAN']);
});
