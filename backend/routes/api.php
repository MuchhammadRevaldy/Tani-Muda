<?php

use App\Http\Controllers\Api\V1\AkunController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BelajarController;
use App\Http\Controllers\Api\V1\DemoController;
use App\Http\Controllers\Api\V1\KebunController;
use App\Http\Controllers\Api\V1\KesehatanController;
use App\Http\Controllers\Api\V1\KirimanController;
use App\Http\Controllers\Api\V1\LahanController;
use App\Http\Controllers\Api\V1\PembeliController;
use App\Http\Controllers\Api\V1\PesananController;
use App\Http\Controllers\Api\V1\ReferensiController;
use App\Http\Controllers\Api\V1\ResepController;
use App\Http\Controllers\Api\V1\WilayahController;
use Illuminate\Support\Facades\Route;

// Semua rute di berkas ini berawalan /api/v1 (bootstrap/app.php, kontrak-api.md bagian 1.1).

Route::get('/kesehatan', KesehatanController::class);
Route::get('/konfigurasi', [ReferensiController::class, 'konfigurasi']);
Route::get('/publik/contoh', [ResepController::class, 'contohPublik']);

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

    // Wilayah dan referensi (3.2)
    Route::get('/wilayah', [WilayahController::class, 'daftar']);
    Route::get('/wilayah/{id}', [WilayahController::class, 'ambil']);
    Route::get('/komoditas', [ReferensiController::class, 'komoditas']);
    Route::get('/metode', [ReferensiController::class, 'metode']);
    Route::get('/sistem-hidroponik', [ReferensiController::class, 'sistemHidroponik']);
    Route::get('/konversi-satuan', [ReferensiController::class, 'konversiSatuan']);
    Route::get('/promo', [ReferensiController::class, 'promo']);
    Route::get('/kelayakan-subsidi', [ReferensiController::class, 'kelayakanSubsidi']);
    Route::get('/harga-sekitar', [ReferensiController::class, 'hargaSekitar']);

    // Belajar (3.6)
    Route::get('/modul', [BelajarController::class, 'daftar']);
    Route::get('/modul/{id}', [BelajarController::class, 'ambil']);
    Route::post('/modul/{id}/selesai', [BelajarController::class, 'selesai']);

    // Resep (3.3)
    Route::get('/resep', [ResepController::class, 'daftar']);
    Route::get('/resep/{id}', [ResepController::class, 'ambil']);
    Route::middleware('peran:petani')->group(function () {
        Route::post('/permintaan-resep', [ResepController::class, 'minta']);
        Route::get('/permintaan-resep/saya', [ResepController::class, 'permintaanSaya']);

        // Lahan (3.4)
        Route::get('/lahan', [LahanController::class, 'daftar']);
        Route::post('/lahan', [LahanController::class, 'buat']);
        Route::patch('/lahan/{id}', [LahanController::class, 'ubah']);
        Route::delete('/lahan/{id}', [LahanController::class, 'hapus']);

        // Kebun (3.5)
        Route::get('/siklus', [KebunController::class, 'daftarSiklus']);
        Route::post('/siklus', [KebunController::class, 'buatSiklus']);
        Route::get('/siklus/{id}', [KebunController::class, 'ambilSiklus']);
        Route::patch('/siklus/{id}/tanggal-tanam', [KebunController::class, 'ubahTanggalTanam']);
        Route::get('/siklus/{id}/tugas', [KebunController::class, 'daftarTugas']);
        Route::get('/siklus/{id}/pengukuran', [KebunController::class, 'riwayatPengukuran']);
        Route::get('/siklus/{id}/pengeluaran', [KebunController::class, 'daftarPengeluaran']);
        Route::get('/siklus/{id}/jurnal', [KebunController::class, 'jurnal']);
        Route::get('/siklus/{id}/pengingat', [KebunController::class, 'ambilPengingat']);
        Route::get('/tugas/hari-ini', [KebunController::class, 'tugasHariIni']);
        Route::post('/tugas/{id}/selesai', [KebunController::class, 'selesaikanTugas']);
        Route::post('/tugas/{id}/pengukuran', [KebunController::class, 'catatPengukuran']);

        // Pesanan untuk petani (3.7)
        Route::get('/pesanan/sekitar', [PesananController::class, 'sekitar']);
        Route::get('/pesanan/{id}', [PesananController::class, 'ambil']);
        Route::post('/pesanan/{id}/ambil', [PesananController::class, 'ambilPesanan']);
        Route::patch('/alokasi/{id}', [PesananController::class, 'ubahAlokasi']);
        Route::post('/alokasi/{id}/setuju', [PesananController::class, 'setujui']);
        Route::get('/alokasi/saya', [PesananController::class, 'alokasiSaya']);
        Route::post('/alokasi/{id}/gagal-panen', [PesananController::class, 'gagalPanen']);

        // Kiriman sisi petani (3.8)
        Route::get('/kiriman/saya', [KirimanController::class, 'saya']);
        Route::post('/kiriman/{id}/foto-kualitas', [KirimanController::class, 'fotoKualitas']);
        Route::post('/kiriman/{id}/foto-timbangan', [KirimanController::class, 'fotoTimbangan']);
        Route::post('/kiriman/{id}/dikirim', [KirimanController::class, 'dikirim']);
    });

    // Kiriman bersama petani dan pembeli (3.8)
    Route::middleware('peran:petani,pembeli')->group(function () {
        Route::get('/kiriman/{id}', [KirimanController::class, 'ambil']);
        Route::post('/kiriman/{id}/rating', [KirimanController::class, 'rating']);
    });
    Route::get('/pengguna/{id}/rating', [KirimanController::class, 'ringkasanRating']);

    // Pembeli (3.8, 3.9)
    Route::middleware('peran:pembeli')->group(function () {
        Route::post('/kiriman/{id}/konfirmasi', [KirimanController::class, 'konfirmasi']);
        Route::get('/pembeli/pesanan', [PembeliController::class, 'pesananSaya']);
        Route::post('/pembeli/pesanan', [PembeliController::class, 'buatPesanan']);
        Route::post('/pembeli/pesanan/{id}/bayar-uang-muka', [PembeliController::class, 'bayarUangMuka']);
        Route::post('/pembeli/pesanan/{id}/batalkan', [PembeliController::class, 'batalkan']);
        Route::get('/pembeli/pembayaran', [PembeliController::class, 'pembayaran']);
    });
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
