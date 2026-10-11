<?php

use App\Domain\Invarian\InvarianPesanan;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/*
 * Seeder data contoh (T5.08): isinya sama dengan shared/data-contoh/*.json, memenuhi invarian kolom
 * turunan dan aturan hapus (D-53), dan waktu relatifnya mengikuti saat seeder dijalankan (D-47).
 */

it('jumlah baris setiap tabel sama dengan isi JSON', function () {
    DataContohSeeder::isi(CarbonImmutable::now());

    foreach (DataContohSeeder::URUTAN as [$berkas, $kunci, $tabel]) {
        $isi = DataContohSeeder::bacaBerkas($berkas);
        $baris = $kunci === null ? $isi : $isi[$kunci];
        expect(DB::table($tabel)->count())->toBe(count($baris), $tabel);
    }
    $resep = DataContohSeeder::bacaBerkas('resep');
    expect(DB::table('resep_input')->count())->toBe(array_sum(array_map(fn ($r) => count($r['input']), $resep)))
        ->and(DB::table('resep_tugas')->count())->toBe(array_sum(array_map(fn ($r) => count($r['tugas']), $resep)))
        ->and(DB::table('wilayah')->count())->toBe(count(DataContohSeeder::bacaBerkas('wilayah')))
        ->and(DB::table('konfigurasi')->count())->toBe(count(DataContohSeeder::bacaBerkas('konfigurasi')) - 1);
});

it('memenuhi invarian kolom turunan dan aturan hapus RESTRICT', function () {
    DataContohSeeder::isi(CarbonImmutable::now());

    expect(InvarianPesanan::periksa())->toBe([]);
    expect(fn () => DB::table('pesanan')->where('id', 'pesanan-imas-bayam')->delete())->toThrow(QueryException::class)
        ->and(fn () => DB::table('lahan')->where('id', 'lahan-arif-kebun')->delete())->toThrow(QueryException::class);
});

it('waktu relatif mengikuti saat seeder dijalankan: kiriman Imas dikirim 1 jam sebelumnya (D-47)', function () {
    $sekarang = CarbonImmutable::parse('2026-10-15 16:00:00', 'UTC'); // 23.00 WIB
    DataContohSeeder::isi($sekarang);

    $kiriman = DB::table('pengiriman')->find('kiriman-imas-arif-3');
    expect($kiriman->dikirim_pada)->toBe('2026-10-15 15:00:00')
        ->and($kiriman->batas_periksa_pada)->toBe('2026-10-15 21:00:00');
    // "H-13" dihitung dari tanggal WIB (sudah 15 Oktober), bukan tanggal UTC.
    expect(DB::table('siklus_tanam')->where('id', 'siklus-arif-sawi')->value('tanggal_tanam'))->toBe('2026-10-02');
    expect(DB::table('konfigurasi')->where('kunci', 'persen_uang_muka')->value('nilai'))->toBe('20');
});

it('seeder produksi tanpa resep contoh, pengguna uji, pesanan, dan laporan harga contoh (D-12)', function () {
    DataContohSeeder::isi(CarbonImmutable::now(), hanyaProduksi: true);

    expect(DB::table('resep_tanam')->count())->toBe(0)
        ->and(DB::table('pengguna')->count())->toBe(0)
        ->and(DB::table('pesanan')->count())->toBe(0)
        ->and(DB::table('laporan_harga')->count())->toBe(0)
        ->and(DB::table('komoditas')->count())->toBeGreaterThan(0)
        ->and(DB::table('modul')->count())->toBeGreaterThan(0)
        ->and(DB::table('konfigurasi')->count())->toBeGreaterThan(0);
});
