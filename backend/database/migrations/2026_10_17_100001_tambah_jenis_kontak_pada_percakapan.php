<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * F-09 / AG-34: Tambah jenis kontak pada tabel percakapan.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE `percakapan` MODIFY `jenis` ENUM('alokasi', 'pesanan_stok', 'peta', 'kontak') NOT NULL");
        DB::statement('ALTER TABLE percakapan DROP CONSTRAINT IF EXISTS cek_percakapan_jenis');
        DB::statement("ALTER TABLE percakapan ADD CONSTRAINT cek_percakapan_jenis CHECK (jenis IN ('alokasi', 'pesanan_stok', 'peta', 'kontak'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE percakapan DROP CONSTRAINT IF EXISTS cek_percakapan_jenis');
        DB::statement("ALTER TABLE percakapan ADD CONSTRAINT cek_percakapan_jenis CHECK (jenis IN ('alokasi', 'pesanan_stok', 'peta'))");
        DB::statement("ALTER TABLE `percakapan` MODIFY `jenis` ENUM('alokasi', 'pesanan_stok', 'peta') NOT NULL");
    }
};
