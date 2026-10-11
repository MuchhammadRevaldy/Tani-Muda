<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeder pengembangan dan demo (`migrate:fresh --seed`): seluruh kode wilayah resmi (D-54) dan data
 * contoh dari shared/data-contoh/*.json (T5.08). Produksi memakai ProduksiSeeder.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([WilayahSeeder::class, DataContohSeeder::class]);
    }
}
