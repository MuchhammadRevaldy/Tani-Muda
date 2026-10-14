<?php

namespace App\Console\Commands;

use App\Domain\Berita\LayananHargaBerita;
use Illuminate\Console\Command;

/**
 * F-10: Perintah artisan untuk memantau harga panen dari berita.
 */
class PantauHargaBerita extends Command
{
    protected $signature = 'harga:pantau {komoditas? : ID komoditas} {kabupaten? : Nama kabupaten}';

    protected $description = 'Memantau harga panen komoditas dari API berita resmi';

    public function handle(LayananHargaBerita $layanan): int
    {
        $komoditasId = (string) ($this->argument('komoditas') ?? 'cabai');
        $kabupaten = (string) ($this->argument('kabupaten') ?? 'Kabupaten Bandung Barat');

        $this->info("Memantau berita harga untuk {$komoditasId} di {$kabupaten}...");

        $hasil = $layanan->pantauDanSimpan($komoditasId, $kabupaten);

        $this->info("Berhasil menyimpan/memperbarui {$hasil->count()} artikel harga berita.");

        return self::SUCCESS;
    }
}
