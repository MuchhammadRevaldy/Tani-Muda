<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

// Tes fitur memakai basis data MariaDB `tani_muda_uji` (phpunit.xml), dibuat ulang tiap rangkaian.
pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

pest()->extend(TestCase::class)->in('Unit');

/** Jalur dari akar repositori (backend/ ada satu tingkat di bawahnya). */
function jalurRepo(string $relatif): string
{
    return dirname(__DIR__, 2).'/'.$relatif;
}

/**
 * Data minimal yang saling terhubung untuk tes skema: satu desa, petani, pembeli, komoditas,
 * metode, resep, lahan, siklus, pesanan, alokasi, dan kiriman. Ditulis langsung lewat query builder
 * supaya yang diuji adalah basis datanya, bukan model. Seeder data contoh menyusul di T5.08.
 *
 * @return array<string, string> ID baris yang dibuat
 */
function isiDataDasar(): array
{
    $db = DB::connection();
    $db->table('wilayah')->insert(['id' => '32.17.01.2003', 'desa' => 'Lembang', 'kecamatan' => 'Lembang',
        'kabupaten' => 'Kabupaten Bandung Barat', 'provinsi' => 'Jawa Barat', 'lintang' => -6.8117, 'bujur' => 107.6175]);
    $db->table('pengguna')->insert([
        ['id' => 'petani-uji', 'nomor_hp' => '+6281200000001', 'nama' => 'Petani Uji', 'peran' => 'petani', 'wilayah_id' => '32.17.01.2003'],
        ['id' => 'pembeli-uji', 'nomor_hp' => '+6281300000001', 'nama' => 'Pembeli Uji', 'peran' => 'pembeli', 'wilayah_id' => '32.17.01.2003'],
    ]);
    $db->table('komoditas')->insert(['id' => 'sawi', 'nama' => 'Sawi hijau', 'kategori' => 'sayuran_daun',
        'jenis_lahan_cocok' => '["kebun","pekarangan"]', 'satuan_panen' => 'kg', 'umur_panen_hari' => 28, 'harga_jual_contoh' => 6000]);
    $db->table('metode_tanam')->insert(['id' => 'bedengan', 'nama' => 'Bedengan', 'dasar_ukuran' => 'luas',
        'modal_awal' => 'rendah', 'kebutuhan_lahan' => 'Tanah terbuka', 'frekuensi_perawatan' => 'Harian']);
    $db->table('resep_tanam')->insert(['id' => 'resep-sawi-bedengan', 'komoditas_id' => 'sawi', 'metode_id' => 'bedengan',
        'versi' => 1, 'status' => 'draf', 'contoh' => true, 'hasil_per_satuan' => 2.5, 'dasar_ukuran' => 'luas',
        'umur_panen_hari' => 28, 'standar_kualitas' => '["Daun segar"]']);
    $db->table('lahan')->insert(['id' => 'lahan-uji', 'petani_id' => 'petani-uji', 'nama' => 'Kebun', 'jenis_lahan' => 'kebun',
        'luas_m2' => 100, 'satuan_asli' => 'm2', 'nilai_asli' => 100, 'wilayah_id' => '32.17.01.2003']);
    $db->table('siklus_tanam')->insert(['id' => 'siklus-uji', 'petani_id' => 'petani-uji', 'lahan_id' => 'lahan-uji',
        'resep_id' => 'resep-sawi-bedengan', 'resep_versi' => 1, 'komoditas_id' => 'sawi', 'metode_id' => 'bedengan',
        'status' => 'aktif', 'luas_m2' => 40, 'satuan_asli' => 'm2', 'nilai_asli' => 40, 'tanggal_tanam' => '2026-10-01',
        'harga_jual' => 6000, 'perkiraan_panen_kg' => 100]);
    $db->table('pesanan')->insert(['id' => 'pesanan-uji', 'pembeli_id' => 'pembeli-uji', 'jenis' => 'rutin', 'komoditas_id' => 'sawi',
        'jumlah_per_kiriman_kg' => 10, 'frekuensi_hari' => 7, 'jumlah_kiriman' => 4, 'jumlah_total_kg' => 40,
        'tanggal_mulai' => '2026-11-02', 'harga_per_kg' => 6000, 'standar_kualitas' => '[]', 'wilayah_id' => '32.17.01.2003',
        'alamat_antar' => 'Dapur uji', 'status' => 'mencari_petani', 'nilai_pesanan' => 240000, 'uang_muka' => 48000,
        'biaya_layanan' => 12000, 'saldo_uang_muka' => 48000]);
    $db->table('alokasi_pesanan')->insert(['id' => 'alokasi-uji', 'pesanan_id' => 'pesanan-uji', 'petani_id' => 'petani-uji',
        'jumlah_kg' => 10, 'status' => 'berjalan']);
    $db->table('pengiriman')->insert(['id' => 'kiriman-uji', 'alokasi_id' => 'alokasi-uji', 'pesanan_id' => 'pesanan-uji',
        'ke' => 1, 'tanggal_jadwal' => '2026-11-02', 'jumlah_kg' => 10, 'harga_per_kg' => 6000]);

    return ['wilayah' => '32.17.01.2003', 'petani' => 'petani-uji', 'pembeli' => 'pembeli-uji', 'komoditas' => 'sawi',
        'metode' => 'bedengan', 'resep' => 'resep-sawi-bedengan', 'lahan' => 'lahan-uji', 'siklus' => 'siklus-uji',
        'pesanan' => 'pesanan-uji', 'alokasi' => 'alokasi-uji', 'kiriman' => 'kiriman-uji'];
}
