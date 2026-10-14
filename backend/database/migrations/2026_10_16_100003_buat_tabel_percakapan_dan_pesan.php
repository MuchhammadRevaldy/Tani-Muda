<?php

use App\Enums\JenisPercakapan;
use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F-09: Chat petani dan pembeli.
 * Tabel percakapan (alokasi/pesanan_stok/peta) dan tabel pesan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('percakapan', function (Blueprint $table) {
            Skema::id($table);
            $table->enum('jenis', JenisPercakapan::nilai());
            $table->string('rujukan_id', 64)->nullable();
            Skema::rujukan($table, 'petani_id');
            Skema::rujukan($table, 'pembeli_id');
            Skema::waktu($table);

            $table->foreign('petani_id')->references('id')->on('pengguna')->restrictOnDelete();
            $table->foreign('pembeli_id')->references('id')->on('pengguna')->restrictOnDelete();

            $table->unique(['jenis', 'rujukan_id', 'petani_id', 'pembeli_id'], 'percakapan_unik_idx');
        });

        DB::statement("ALTER TABLE percakapan ADD CONSTRAINT cek_percakapan_jenis CHECK (jenis IN ('alokasi', 'pesanan_stok', 'peta'))");

        Schema::create('pesan', function (Blueprint $table) {
            Skema::id($table);
            Skema::rujukan($table, 'percakapan_id');
            Skema::rujukan($table, 'pengirim_id');
            $table->text('isi');
            $table->timestamp('dibaca_pada')->nullable();
            $table->string('kunci_idempoten', 64)->nullable();
            Skema::waktu($table);

            $table->foreign('percakapan_id')->references('id')->on('percakapan')->cascadeOnDelete();
            $table->foreign('pengirim_id')->references('id')->on('pengguna')->restrictOnDelete();

            $table->index(['percakapan_id', 'dibuat_pada'], 'pesan_percakapan_waktu_idx');
        });

        DB::statement('ALTER TABLE pesan ADD CONSTRAINT cek_pesan_panjang_isi CHECK (CHAR_LENGTH(isi) BETWEEN 1 AND 1000)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE pesan DROP CONSTRAINT IF EXISTS cek_pesan_panjang_isi');
        DB::statement('ALTER TABLE percakapan DROP CONSTRAINT IF EXISTS cek_percakapan_jenis');

        Schema::dropIfExists('pesan');
        Schema::dropIfExists('percakapan');
    }
};
