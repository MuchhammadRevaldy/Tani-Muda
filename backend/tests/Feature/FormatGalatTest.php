<?php

use App\Http\Galat\GalatApi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;

/*
 * Semua galat di /api/v1 berbentuk { galat: { kode, pesan, rincian? } } (kontrak-api.md 1.4).
 * Rute uji didaftarkan hanya di dalam tes ini.
 */
beforeEach(function () {
    Route::prefix('api/v1/uji')->middleware('api')->group(function () {
        Route::post('/validasi', fn (Request $r) => $r->validate([
            'harga_kemasan' => ['required', 'integer', 'min:0'],
            'nilai.pH' => ['required', 'numeric', 'between:0,14'],
        ]));
        Route::get('/masuk', fn () => 'rahasia')->middleware('auth:sanctum');
        Route::get('/terlarang', fn () => abort(403, 'pesan Symfony yang tidak boleh bocor'));
        Route::get('/model/{pengguna}', fn (User $pengguna) => $pengguna);
        Route::get('/meledak', fn () => throw new RuntimeException('SQLSTATE rahasia di server'));
        Route::get('/logika', fn () => throw new GalatApi('LAHAN_TIDAK_CUKUP', 'Lahanmu tidak cukup', ['luas_m2' => ['Sisa lahan 20 m²']]));
        Route::get('/sering', fn () => throw new GalatApi('TERLALU_SERING', cobaLagiDalam: 42));
        Route::get('/csrf', fn () => throw new TokenMismatchException);
    });
});

it('422 VALIDASI dengan rincian per kolom, termasuk isian bersarang', function () {
    $this->postJson('/api/v1/uji/validasi', ['harga_kemasan' => -5])
        ->assertStatus(422)
        ->assertJsonPath('galat.kode', 'VALIDASI')
        ->assertJsonPath('galat.pesan', 'Ada isian yang belum benar')
        ->assertJsonStructure(['galat' => ['rincian' => ['harga_kemasan', 'nilai.pH']]]);
});

it('pesan validasi berbahasa Indonesia', function () {
    $rincian = $this->postJson('/api/v1/uji/validasi', ['nilai' => ['pH' => 15]])->json('galat.rincian');

    expect($rincian['harga_kemasan'][0])->toBe('Isian harga kemasan wajib diisi.')
        ->and($rincian['nilai.pH'][0])->toEndWith('harus di antara 0 dan 14.');
});

it('401 BELUM_MASUK tanpa sesi', function () {
    $this->getJson('/api/v1/uji/masuk')->assertStatus(401)->assertExactJson(['galat' => [
        'kode' => 'BELUM_MASUK', 'pesan' => 'Masuk dulu dengan nomor HP',
    ]]);
});

it('403 TIDAK_DIIZINKAN tanpa membocorkan pesan asli', function () {
    $this->getJson('/api/v1/uji/terlarang')->assertStatus(403)->assertExactJson(['galat' => [
        'kode' => 'TIDAK_DIIZINKAN', 'pesan' => 'Akunmu tidak bisa membuka bagian ini',
    ]]);
});

it('404 TIDAK_DITEMUKAN untuk data yang tidak ada, alamat yang tidak ada, dan metode yang salah', function (string $metode, string $alamat) {
    $this->json($metode, $alamat)->assertStatus(404)->assertExactJson(['galat' => [
        'kode' => 'TIDAK_DITEMUKAN', 'pesan' => 'Data ini tidak ditemukan',
    ]]);
})->with([
    'model tidak ada' => ['GET', '/api/v1/uji/model/999999'],
    'alamat tidak ada' => ['GET', '/api/v1/tidak-ada'],
    'metode salah' => ['DELETE', '/api/v1/kesehatan'],
]);

it('500 GALAT_SERVER tanpa rincian teknis walau APP_DEBUG menyala', function () {
    config(['app.debug' => true]);
    $respons = $this->getJson('/api/v1/uji/meledak')->assertStatus(500)->assertExactJson(['galat' => [
        'kode' => 'GALAT_SERVER', 'pesan' => 'Ada yang tidak beres di server. Coba lagi sebentar lagi',
    ]]);
    expect($respons->getContent())->not->toContain('SQLSTATE');
});

it('kode logika inti memakai status dari tabel kontrak dan membawa rincian', function () {
    $this->getJson('/api/v1/uji/logika')->assertStatus(409)->assertExactJson(['galat' => [
        'kode' => 'LAHAN_TIDAK_CUKUP',
        'pesan' => 'Lahanmu tidak cukup',
        'rincian' => ['luas_m2' => ['Sisa lahan 20 m²']],
    ]]);
});

it('429 TERLALU_SERING membawa coba_lagi_dalam dan header Retry-After', function () {
    $this->getJson('/api/v1/uji/sering')
        ->assertStatus(429)
        ->assertHeader('Retry-After', '42')
        ->assertJsonPath('galat.kode', 'TERLALU_SERING')
        ->assertJsonPath('galat.coba_lagi_dalam', 42);
});

it('419 token CSRF tidak cocok: kode BENTROK', function () {
    $this->getJson('/api/v1/uji/csrf')->assertStatus(419)->assertJsonPath('galat.kode', 'BENTROK');
});
