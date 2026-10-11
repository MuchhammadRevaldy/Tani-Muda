<?php

namespace Database\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

/**
 * Seeder produksi (arsitektur-backend.md bagian 17): seluruh kode wilayah resmi (D-54), konfigurasi,
 * dan referensi dasar (komoditas, metode, sistem hidroponik, konversi satuan, input, modul belajar).
 * Tanpa resep contoh, pengguna uji, pesanan, dan laporan harga contoh (D-12).
 */
class ProduksiSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(WilayahSeeder::class);
        DataContohSeeder::isi(CarbonImmutable::now(), hanyaProduksi: true);
    }
}
