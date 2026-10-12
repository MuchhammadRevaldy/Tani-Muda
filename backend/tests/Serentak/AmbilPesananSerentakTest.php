<?php

use App\Domain\Invarian\InvarianPesanan;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\DB;

/*
 * Ambil pesanan mengunci baris pesanan (D-57, arsitektur-backend.md bagian 8): selama transaksi lain
 * memegang kunci dan menambah alokasi, permintaan ambil menunggu lalu menghitung sisa dari data
 * terbaru. Tanpa kunci, permintaan itu akan membaca sisa lama dan pesanan kelebihan alokasi.
 */

beforeEach(function () {
    $this->artisan('migrate');
    kosongkanSemuaTabel();
    DataContohSeeder::isi(CarbonImmutable::now());
});

afterEach(function () {
    kosongkanSemuaTabel();
});

it('permintaan ambil menunggu kunci baris pesanan lalu ditolak karena sisanya sudah diambil', function () {
    $tahan = jalankanPekerja('pekerja-ambil.php', ['tahan', '2000']);
    usleep(800_000);
    $ambil = jalankanPekerja('pekerja-ambil.php', ['ambil']);
    [$hasilTahan, $hasilAmbil] = [tungguPekerja($tahan), tungguPekerja($ambil)];

    // Permintaan ambil mulai sebelum transaksi penahan selesai, dan baru selesai sesudahnya.
    expect($hasilAmbil['mulai'])->toBeLessThan($hasilTahan['selesai'])
        ->and($hasilAmbil['selesai'])->toBeGreaterThan($hasilTahan['selesai'])
        ->and([$hasilAmbil['status'], $hasilAmbil['kode']])->toBe([409, 'MELEBIHI_PESANAN']);
    expect((float) DB::table('alokasi_pesanan')->where('pesanan_id', 'pesanan-kafe-bayam')->sum('jumlah_kg'))->toBe(3.0);
});

it('tanpa transaksi lain, ambil berhasil dan invarian tetap terpenuhi', function () {
    $hasil = tungguPekerja(jalankanPekerja('pekerja-ambil.php', ['ambil']));
    expect($hasil['status'])->toBe(200);
    expect(InvarianPesanan::periksa(['pesanan-kafe-bayam']))->toBe([]);
});
