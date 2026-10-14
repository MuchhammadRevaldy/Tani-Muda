<?php

use App\Models\PesananStok;
use App\Models\Stok;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;

/*
 * Pembelian stok mengunci baris stok (LayananStok::beliStok dengan lockForUpdate):
 * selama transaksi lain memegang kunci dan mengurangi sisa_kg, permintaan beli lain menunggu
 * lalu menghitung sisa dari data terbaru. Tanpa kunci, sisa_kg bisa bernilai minus.
 */

beforeEach(function () {
    $this->artisan('migrate');
    kosongkanSemuaTabel();
    DataContohSeeder::isi(CarbonImmutable::now());
});

afterEach(function () {
    kosongkanSemuaTabel();
});

it('permintaan beli menunggu kunci baris stok lalu ditolak STOK_TIDAK_CUKUP bila sisa tidak cukup', function () {
    $stok = Stok::create([
        'id' => 'stok-serentak-uji-1',
        'petani_id' => 'petani-arif',
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 10,
        'sisa_kg' => 10,
        'harga_per_kg' => 10000,
        'tanggal_panen' => now()->toDateString(),
        'status' => 'tersedia',
    ]);

    // Transaksi 1 membeli 6 kg dan menahan kunci selama 2000 ms
    $tahan = jalankanPekerja('pekerja-stok.php', ['tahan', $stok->id, '6', 'pembeli-ratna', '2000']);
    usleep(800_000);
    // Transaksi 2 mencoba membeli 6 kg
    $beli = jalankanPekerja('pekerja-stok.php', ['beli', $stok->id, '6', 'pembeli-imas', '0']);

    [$hasilTahan, $hasilBeli] = [tungguPekerja($tahan), tungguPekerja($beli)];

    // Permintaan beli mulai sebelum penahan selesai, dan baru selesai sesudahnya (menunggu penguncian)
    expect($hasilBeli['mulai'])->toBeLessThan($hasilTahan['selesai'])
        ->and($hasilBeli['selesai'])->toBeGreaterThan($hasilTahan['selesai'])
        ->and([$hasilBeli['status'], $hasilBeli['kode']])->toBe([409, 'STOK_TIDAK_CUKUP']);

    // Buktikan total terjual tidak melebihi jumlah_kg dan sisa_kg tidak pernah minus
    $stokTerbaru = Stok::findOrFail($stok->id);
    $totalTerjual = (float) PesananStok::where('stok_id', $stok->id)->sum('jumlah_kg');

    expect($totalTerjual)->toBe(6.0)
        ->and($totalTerjual)->toBeLessThanOrEqual((float) $stok->jumlah_kg)
        ->and($stokTerbaru->sisa_kg)->toBe(4.0)
        ->and($stokTerbaru->sisa_kg)->toBeGreaterThanOrEqual(0.0);
});

it('dua proses bersamaan membeli stok: total terjual tidak melebihi stok dan sisa tidak minus', function () {
    $stok = Stok::create([
        'id' => 'stok-serentak-uji-2',
        'petani_id' => 'petani-arif',
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 10,
        'sisa_kg' => 10,
        'harga_per_kg' => 10000,
        'tanggal_panen' => now()->toDateString(),
        'status' => 'tersedia',
    ]);

    // Dua proses beli masing-masing meminta 7 kg serentak
    $p1 = jalankanPekerja('pekerja-stok.php', ['beli', $stok->id, '7', 'pembeli-ratna', '0']);
    $p2 = jalankanPekerja('pekerja-stok.php', ['beli', $stok->id, '7', 'pembeli-imas', '0']);

    $h1 = tungguPekerja($p1);
    $h2 = tungguPekerja($p2);

    $statuses = [$h1['status'], $h2['status']];
    sort($statuses);
    // Tepat satu yang berhasil (201) dan satu yang ditolak (409)
    expect($statuses)->toBe([201, 409]);

    $stokTerbaru = Stok::findOrFail($stok->id);
    $totalTerjual = (float) PesananStok::where('stok_id', $stok->id)->sum('jumlah_kg');

    expect($totalTerjual)->toBe(7.0)
        ->and($totalTerjual)->toBeLessThanOrEqual((float) $stok->jumlah_kg)
        ->and($stokTerbaru->sisa_kg)->toBe(3.0)
        ->and($stokTerbaru->sisa_kg)->toBeGreaterThanOrEqual(0.0);
});
