<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeder produksi (arsitektur-backend.md bagian 17): tanpa resep contoh dan pengguna uji (D-12).
 * Isinya seluruh kode wilayah resmi (D-54).
 */
class ProduksiSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(WilayahSeeder::class);
    }
}
