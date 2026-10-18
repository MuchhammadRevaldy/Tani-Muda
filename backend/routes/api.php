<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AkunController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BelajarController;
use App\Http\Controllers\Api\V1\BelumTersediaController;
use App\Http\Controllers\Api\V1\BerkasController;
use App\Http\Controllers\Api\V1\ChatbotController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\CuacaController;
use App\Http\Controllers\Api\V1\DemoController;
use App\Http\Controllers\Api\V1\DeteksiController;
use App\Http\Controllers\Api\V1\HargaBeritaController;
use App\Http\Controllers\Api\V1\KebunController;
use App\Http\Controllers\Api\V1\KesehatanController;
use App\Http\Controllers\Api\V1\KirimanController;
use App\Http\Controllers\Api\V1\LahanController;
use App\Http\Controllers\Api\V1\PembeliController;
use App\Http\Controllers\Api\V1\PesananController;
use App\Http\Controllers\Api\V1\PesananStokController;
use App\Http\Controllers\Api\V1\PetaController;
use App\Http\Controllers\Api\V1\ReferensiController;
use App\Http\Controllers\Api\V1\ResepController;
use App\Http\Controllers\Api\V1\StokController;
use App\Http\Controllers\Api\V1\WilayahController;
use Illuminate\Support\Facades\Route;

// Semua rute di berkas ini berawalan /api/v1 (bootstrap/app.php, kontrak-api.md bagian 1.1).

/** Endpoint kontrak yang belum ada di backend ([AG-19]); lihat bagian bawah berkas. */
$endpointBelumTersedia = [
    ['POST', '/laporan-harga'],
    ['POST', '/notifikasi/langganan'],
    ['DELETE', '/notifikasi/langganan'],
    ['GET', '/admin/sengketa'],
    ['POST', '/admin/sengketa/{id}/putuskan'],
    ['GET', '/admin/petani'],
    ['GET', '/admin/petani/{id}'],
    ['POST', '/admin/petani/{id}/catatan'],
    ['POST', '/admin/petani/{id}/status'],
    ['GET', '/mentor/resep'],
    ['POST', '/mentor/resep'],
    ['POST', '/mentor/resep/{id}/validasi'],
    ['GET', '/mentor/permintaan-resep'],
];

Route::get('/kesehatan', KesehatanController::class);
Route::get('/konfigurasi', [ReferensiController::class, 'konfigurasi']);
Route::get('/publik/contoh', [ResepController::class, 'contohPublik']);

// ---------------------------------------------------------------- masuk (3.1), tanpa sesi
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/auth/otp/kirim', [AuthController::class, 'kirim']);
    Route::post('/auth/otp/verifikasi', [AuthController::class, 'verifikasi']);
});

// ---------------------------------------------------------------- wajib masuk
// Unduh berkas privat: hanya lewat URL bertanda tangan 10 menit (bagian 13, [AG-22]).
Route::get('/berkas/{id}/unduh', [BerkasController::class, 'unduh'])->middleware('signed:relative')->name('berkas.unduh');

Route::middleware('auth:sanctum')->group(function () use ($endpointBelumTersedia) {
    Route::post('/berkas', [BerkasController::class, 'unggah']);
    Route::post('/auth/keluar', [AuthController::class, 'keluar']);
    Route::get('/akun', [AkunController::class, 'ambil']);
    Route::get('/akun/level', [AkunController::class, 'level']);
    Route::put('/akun/peran', [AkunController::class, 'pilihPeran']);
    Route::patch('/akun', [AkunController::class, 'ubah']);
    Route::post('/akun/nomor-hp/otp', [AkunController::class, 'otpNomorBaru'])->middleware('throttle:30,1');
    Route::put('/akun/nomor-hp', [AkunController::class, 'gantiNomor']);
    Route::get('/akun/catatan', [AkunController::class, 'catatan'])->middleware('peran:petani');
    Route::put('/akun/profil-pembeli', [AkunController::class, 'simpanProfilPembeli'])->middleware('peran:pembeli');
    Route::put('/akun/lokasi', [AkunController::class, 'perbaruiLokasi']);
    Route::post('/akun/setuju-ai', [DeteksiController::class, 'setujuAI']);

    // Deteksi penyakit tanaman dari foto (F-04)
    Route::middleware('peran:petani')->group(function () {
        Route::post('/deteksi', [DeteksiController::class, 'deteksi']);
        Route::get('/deteksi', [DeteksiController::class, 'daftar']);
        Route::get('/deteksi/{id}', [DeteksiController::class, 'ambil']);

        // Cuaca dan kecocokan suhu (F-06)
        Route::get('/cuaca', [CuacaController::class, 'sekarang']);
    });

    // Chatbot Tanya Tani Muda (F-05)
    Route::post('/chatbot', [ChatbotController::class, 'tanya']);
    Route::get('/chatbot/riwayat', [ChatbotController::class, 'riwayat']);

    // Marketplace stok siap jual + COD (F-07)
    Route::get('/stok', [StokController::class, 'daftar']);
    Route::post('/stok', [StokController::class, 'buat']);
    Route::patch('/stok/{id}', [StokController::class, 'ubah']);
    Route::get('/stok/sekitar', [StokController::class, 'sekitar']);
    Route::post('/stok/{id}/beli', [StokController::class, 'beli']);

    Route::get('/pesanan-stok/saya', [PesananStokController::class, 'saya']);
    Route::post('/pesanan-stok/{id}/terima', [PesananStokController::class, 'terima']);
    Route::post('/pesanan-stok/{id}/tolak', [PesananStokController::class, 'tolak']);
    Route::post('/pesanan-stok/{id}/dikirim', [PesananStokController::class, 'dikirim']);
    Route::post('/pesanan-stok/{id}/selesai', [PesananStokController::class, 'selesai']);
    Route::post('/pesanan-stok/{id}/batalkan', [PesananStokController::class, 'batalkan']);

    // Peta petani sekitar pembeli (F-08, D-64)
    Route::get('/peta/petani', [PetaController::class, 'petaniSekitar']);

    // Chat petani dan pembeli (F-09, D-64)
    Route::get('/percakapan', [ChatController::class, 'daftar']);
    Route::post('/percakapan', [ChatController::class, 'bukaAtauAmbil']);
    Route::post('/percakapan/nomor', [ChatController::class, 'bukaLewatNomor'])->middleware('throttle:10,60');
    Route::get('/percakapan/permintaan', [ChatController::class, 'daftarPermintaan']);
    Route::post('/percakapan/permintaan', [ChatController::class, 'kirimPermintaan'])->middleware('throttle:10,60');
    Route::post('/percakapan/permintaan/{id}/terima', [ChatController::class, 'terimaPermintaan']);
    Route::post('/percakapan/permintaan/{id}/tolak', [ChatController::class, 'tolakPermintaan']);
    Route::get('/percakapan/lencana', [ChatController::class, 'lencana']);
    Route::get('/percakapan/{id}/pesan', [ChatController::class, 'pesan']);
    Route::post('/percakapan/{id}/pesan', [ChatController::class, 'kirimPesan'])->middleware('throttle:60,1');
    Route::post('/percakapan/{id}/dibaca', [ChatController::class, 'tandaiDibaca']);

    // Harga berita (F-10)
    Route::get('/harga-berita', [HargaBeritaController::class, 'daftar']);

    // Wilayah dan referensi (3.2, D-67)
    Route::get('/wilayah/kabupaten', [WilayahController::class, 'kabupaten']);
    Route::get('/wilayah/kecamatan', [WilayahController::class, 'kecamatan']);
    Route::get('/wilayah/desa', [WilayahController::class, 'desa']);
    Route::get('/wilayah', [WilayahController::class, 'daftar']);
    Route::get('/wilayah/terdekat', [WilayahController::class, 'terdekat']);
    Route::get('/wilayah/{id}', [WilayahController::class, 'ambil']);
    Route::get('/komoditas', [ReferensiController::class, 'komoditas']);
    Route::get('/metode', [ReferensiController::class, 'metode']);
    Route::get('/sistem-hidroponik', [ReferensiController::class, 'sistemHidroponik']);
    Route::get('/konversi-satuan', [ReferensiController::class, 'konversiSatuan']);
    Route::get('/promo', [ReferensiController::class, 'promo']);
    Route::get('/kelayakan-subsidi', [ReferensiController::class, 'kelayakanSubsidi']);
    Route::get('/harga-sekitar', [ReferensiController::class, 'hargaSekitar']);
    Route::get('/input/{id}/merek', [ReferensiController::class, 'merek']);

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
        Route::post('/siklus/{id}/akhiri', [KebunController::class, 'akhiriSiklus']);
        Route::get('/siklus/{id}/tugas', [KebunController::class, 'daftarTugas']);
        Route::get('/siklus/{id}/pengukuran', [KebunController::class, 'riwayatPengukuran']);
        Route::get('/siklus/{id}/pengeluaran', [KebunController::class, 'daftarPengeluaran']);
        Route::get('/siklus/{id}/jurnal', [KebunController::class, 'jurnal']);
        Route::get('/siklus/{id}/pengingat', [KebunController::class, 'ambilPengingat']);
        Route::put('/siklus/{id}/pengingat', [KebunController::class, 'ubahPengingat']);
        Route::post('/siklus/{id}/jurnal', [KebunController::class, 'tambahJurnal']);
        Route::post('/tugas/{id}/tunda', [KebunController::class, 'tundaTugas']);
        Route::post('/siklus/{id}/pengeluaran', [KebunController::class, 'catatPengeluaran']);
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

    // Admin (3.10): verifikasi pembeli
    Route::middleware('peran:admin')->group(function () {
        Route::get('/admin/pembeli', [AdminController::class, 'pembeliMenunggu']);
        Route::post('/admin/pembeli/{id}/verifikasi', [AdminController::class, 'verifikasi']);
    });

    // Endpoint kontrak yang belum dikerjakan: 501 BELUM_TERSEDIA, "Fitur ini belum tersedia di versi
    // demo" ([AG-19]). Hapus barisnya saat endpoint dibuat. Tes: KontrakRuteTest.
    foreach ($endpointBelumTersedia as [$metode, $jalur]) {
        Route::match([$metode], $jalur, BelumTersediaController::class);
    }
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
