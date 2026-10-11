<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeder pengembangan (`migrate:fresh --seed`): kode wilayah resmi (D-54). Data contoh dari
 * shared/data-contoh/*.json (T5.08) menyusul setelah keputusan model sisa pesanan rutin (D-55).
 * Produksi memakai ProduksiSeeder.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(WilayahSeeder::class);
    }
}
