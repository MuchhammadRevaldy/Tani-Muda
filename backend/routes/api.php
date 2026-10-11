<?php

use App\Http\Controllers\Api\V1\AkunController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DemoController;
use App\Http\Controllers\Api\V1\KesehatanController;
use Illuminate\Support\Facades\Route;

// Semua rute di berkas ini berawalan /api/v1 (bootstrap/app.php, kontrak-api.md bagian 1.1).

Route::get('/kesehatan', KesehatanController::class);

// ---------------------------------------------------------------- masuk (3.1), tanpa sesi
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/auth/otp/kirim', [AuthController::class, 'kirim']);
    Route::post('/auth/otp/verifikasi', [AuthController::class, 'verifikasi']);
});

// ---------------------------------------------------------------- wajib masuk
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/keluar', [AuthController::class, 'keluar']);
    Route::get('/akun', [AkunController::class, 'ambil']);
    Route::put('/akun/peran', [AkunController::class, 'pilihPeran']);
    Route::patch('/akun', [AkunController::class, 'ubah']);
    Route::post('/akun/nomor-hp/otp', [AkunController::class, 'otpNomorBaru'])->middleware('throttle:30,1');
    Route::put('/akun/nomor-hp', [AkunController::class, 'gantiNomor']);
    Route::get('/akun/catatan', [AkunController::class, 'catatan'])->middleware('peran:petani');
    Route::put('/akun/profil-pembeli', [AkunController::class, 'simpanProfilPembeli'])->middleware('peran:pembeli');
});

// ---------------------------------------------------------------- demo lokal (3.13, D-57)
// Hanya didaftarkan di lingkungan lokal (dan tes); di lingkungan lain jalurnya 404.
if (app()->environment('local', 'testing')) {
    Route::prefix('demo')->group(function () {
        Route::get('/pengguna', [DemoController::class, 'pengguna']);
        Route::post('/masuk', [DemoController::class, 'masuk']);
        Route::get('/kode-otp', [DemoController::class, 'kodeOtp']);
        Route::post('/atur-ulang', [DemoController::class, 'aturUlang']);
    });
}
