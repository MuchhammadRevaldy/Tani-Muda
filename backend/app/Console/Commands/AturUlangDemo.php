<?php

namespace App\Console\Commands;

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Atur ulang data demo (D-47, D-57): semua tabel dikosongkan lalu diisi data contoh dengan waktu
 * relatif terhadap saat perintah dijalankan, sama dengan "Atur ulang data demo" di klien tiruan.
 * Tabel wilayah resmi dan riwayat migrasi tetap. Semua sesi ikut berakhir. Hanya untuk lingkungan
 * lokal (dan tes), karena menghapus semua data.
 */
class AturUlangDemo extends Command
{
    protected $signature = 'demo:atur-ulang';

    protected $description = 'Kosongkan data lalu isi ulang data contoh dengan waktu relatif saat ini (hanya lokal)';

    /** Tabel yang tidak dikosongkan. */
    private const TETAP = ['migrations', 'wilayah'];

    public function handle(): int
    {
        if (! app()->environment('local', 'testing')) {
            $this->error('Atur ulang demo hanya boleh di lingkungan lokal (APP_ENV=local).');

            return self::FAILURE;
        }

        self::jalankan(CarbonImmutable::now());
        $this->info('Data demo sudah dikembalikan.');

        return self::SUCCESS;
    }

    public static function jalankan(CarbonImmutable $sekarang): void
    {
        DB::transaction(function () use ($sekarang) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            try {
                foreach (Schema::getTableListing(DB::getDatabaseName(), schemaQualified: false) as $tabel) {
                    if (! in_array($tabel, self::TETAP, true)) {
                        DB::table($tabel)->delete();
                    }
                }
            } finally {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
            DataContohSeeder::isi($sekarang);
        });
    }
}
