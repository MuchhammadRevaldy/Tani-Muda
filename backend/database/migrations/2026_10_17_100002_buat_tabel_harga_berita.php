<?php

use App\Enums\JenisHargaBerita;
use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F-10: Harga panen dari pemantauan berita.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('harga_berita', function (Blueprint $table) {
            Skema::id($table);
            Skema::rujukan($table, 'komoditas_id');
            $table->string('kabupaten', 100);
            Skema::uang($table, 'harga');
            $table->string('satuan', 50)->default('kg');
            $table->enum('jenis_harga', JenisHargaBerita::nilai())->default('pasar');
            $table->string('lokasi', 150);
            $table->date('tanggal_berita');
            $table->string('judul', 255);
            $table->string('media', 100);
            $table->string('url', 500);
            Skema::waktu($table);

            $table->foreign('komoditas_id')->references('id')->on('komoditas')->restrictOnDelete();

            $table->unique(['komoditas_id', 'kabupaten', 'url'], 'harga_berita_unik_idx');
            $table->index(['komoditas_id', 'kabupaten', 'dibuat_pada'], 'harga_berita_cari_idx');
        });

        Skema::periksa('harga_berita', 'cek_harga_berita_positif', '`harga` > 0');
        DB::statement("ALTER TABLE harga_berita ADD CONSTRAINT cek_harga_berita_jenis CHECK (jenis_harga IN ('pasar', 'eceran', 'petani'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE harga_berita DROP CONSTRAINT IF EXISTS cek_harga_berita_jenis');
        DB::statement('ALTER TABLE harga_berita DROP CONSTRAINT IF EXISTS cek_harga_berita_positif');
        Schema::dropIfExists('harga_berita');
    }
};
