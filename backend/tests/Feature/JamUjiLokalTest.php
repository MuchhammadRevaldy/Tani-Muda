<?php

use Illuminate\Support\Facades\Route;

/*
 * Header jam uji X-Tani-Muda-Waktu (D-58): hanya berlaku di local/testing, diabaikan di lingkungan
 * lain, dan tidak bocor ke permintaan berikutnya.
 */

beforeEach(function () {
    Route::middleware('api')->get('/api/uji-jam', fn () => ['sekarang' => now()->toIso8601String()]);
});

it('di testing, header menyetel waktu sekarang selama satu permintaan', function () {
    $this->getJson('/api/uji-jam', ['X-Tani-Muda-Waktu' => '2026-10-05T01:00:00Z'])
        ->assertOk()->assertJsonPath('sekarang', '2026-10-05T01:00:00+00:00');
    expect($this->getJson('/api/uji-jam')->json('sekarang'))->not->toBe('2026-10-05T01:00:00+00:00');
});

it('di production, header diabaikan', function () {
    $hasil = tungguPekerja(jalankanPekerja('pekerja-jam.php', ['2001-01-01T00:00:00Z'], ['APP_ENV' => 'production']));
    expect($hasil['lingkungan'])->toBe('production')
        ->and($hasil['sekarang'])->not->toStartWith('2001-01-01');
});

it('di local, header berlaku', function () {
    $hasil = tungguPekerja(jalankanPekerja('pekerja-jam.php', ['2001-01-01T00:00:00Z'], ['APP_ENV' => 'local']));
    expect($hasil['lingkungan'])->toBe('local')
        ->and($hasil['sekarang'])->toStartWith('2001-01-01');
});
