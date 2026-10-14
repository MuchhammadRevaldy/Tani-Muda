<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F-07: Marketplace stok siap jual + COD (PRD Tambahan F-07, bagian 3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stok', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'petani_id');
            Skema::rujukan($t, 'komoditas_id');
            Skema::rujukan($t, 'lahan_id')->nullable();
            Skema::jumlah($t, 'jumlah_kg');
            Skema::jumlah($t, 'sisa_kg');
            Skema::uang($t, 'harga_per_kg');
            $t->date('tanggal_panen');
            $t->string('foto')->nullable();
            $t->enum('status', ['tersedia', 'habis', 'ditarik'])->default('tersedia');
            Skema::waktu($t);

            $t->foreign('petani_id')->references('id')->on('pengguna')->restrictOnDelete();
            $t->foreign('komoditas_id')->references('id')->on('komoditas')->restrictOnDelete();
            $t->foreign('lahan_id')->references('id')->on('lahan')->restrictOnDelete();

            $t->index(['petani_id', 'status']);
            $t->index(['komoditas_id', 'status']);
        });

        Skema::periksa('stok', 'stok_sisa_kg_valid', '`sisa_kg` >= 0 AND `sisa_kg` <= `jumlah_kg`');
        Skema::periksa('stok', 'stok_angka_positif', '`jumlah_kg` > 0 AND `harga_per_kg` > 0');

        Schema::create('pesanan_stok', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pembeli_id');
            Skema::rujukan($t, 'stok_id');
            Skema::rujukan($t, 'petani_id');
            Skema::jumlah($t, 'jumlah_kg');
            Skema::uang($t, 'harga_per_kg');
            Skema::uang($t, 'nilai');
            $t->enum('metode_bayar', ['cod', 'bayar_di_aplikasi']);
            $t->text('alamat_antar');
            $t->enum('status', ['menunggu', 'diterima', 'dikirim', 'selesai', 'dibatalkan', 'ditolak'])->default('menunggu');
            $t->timestamp('waktu_menunggu')->nullable();
            $t->timestamp('waktu_diterima')->nullable();
            $t->timestamp('waktu_dikirim')->nullable();
            $t->timestamp('waktu_selesai')->nullable();
            $t->timestamp('waktu_dibatalkan')->nullable();
            $t->timestamp('waktu_ditolak')->nullable();
            $t->string('alasan_batal', 500)->nullable();
            $t->timestamp('dibuat_pada')->useCurrent();

            $t->foreign('pembeli_id')->references('id')->on('pengguna')->restrictOnDelete();
            $t->foreign('stok_id')->references('id')->on('stok')->restrictOnDelete();
            $t->foreign('petani_id')->references('id')->on('pengguna')->restrictOnDelete();

            $t->index(['pembeli_id', 'status']);
            $t->index(['petani_id', 'status']);
            $t->index(['stok_id', 'status']);
        });

        Skema::periksa('pesanan_stok', 'pesanan_stok_angka_positif', '`jumlah_kg` > 0 AND `harga_per_kg` > 0 AND `nilai` > 0');

        // Alter pembayaran: pesanan_id boleh null, tambah pesanan_stok_id dengan CHECK tepat satu rujukan
        DB::statement('ALTER TABLE `pembayaran` MODIFY `pesanan_id` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL');
        Schema::table('pembayaran', function (Blueprint $t) {
            Skema::rujukan($t, 'pesanan_stok_id')->nullable()->after('pesanan_id');
            $t->foreign('pesanan_stok_id')->references('id')->on('pesanan_stok')->restrictOnDelete();
            $t->index(['pesanan_stok_id', 'jenis']);
        });
        Skema::periksa('pembayaran', 'pembayaran_tepat_satu_rujukan', '(`pesanan_id` IS NOT NULL AND `pesanan_stok_id` IS NULL) OR (`pesanan_id` IS NULL AND `pesanan_stok_id` IS NOT NULL)');

        // Alter rating: pengiriman_id boleh null, tambah pesanan_stok_id dengan CHECK tepat satu rujukan
        DB::statement('ALTER TABLE `rating` MODIFY `pengiriman_id` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL');
        Schema::table('rating', function (Blueprint $t) {
            Skema::rujukan($t, 'pesanan_stok_id')->nullable()->after('pengiriman_id');
            $t->foreign('pesanan_stok_id')->references('id')->on('pesanan_stok')->restrictOnDelete();
            $t->unique(['pesanan_stok_id', 'pemberi_id']);
        });
        Skema::periksa('rating', 'rating_tepat_satu_rujukan', '(`pengiriman_id` IS NOT NULL AND `pesanan_stok_id` IS NULL) OR (`pengiriman_id` IS NULL AND `pesanan_stok_id` IS NOT NULL)');
    }

    public function down(): void
    {
        // Kembalikan rating
        DB::statement('ALTER TABLE `rating` DROP CONSTRAINT IF EXISTS `rating_tepat_satu_rujukan`');
        Schema::table('rating', function (Blueprint $t) {
            $t->dropForeign(['pesanan_stok_id']);
            $t->dropUnique(['pesanan_stok_id', 'pemberi_id']);
            $t->dropColumn('pesanan_stok_id');
        });
        DB::statement('ALTER TABLE `rating` MODIFY `pengiriman_id` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL');

        // Kembalikan pembayaran
        DB::statement('ALTER TABLE `pembayaran` DROP CONSTRAINT IF EXISTS `pembayaran_tepat_satu_rujukan`');
        Schema::table('pembayaran', function (Blueprint $t) {
            $t->dropForeign(['pesanan_stok_id']);
            $t->dropIndex(['pesanan_stok_id', 'jenis']);
            $t->dropColumn('pesanan_stok_id');
        });
        DB::statement('ALTER TABLE `pembayaran` MODIFY `pesanan_id` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL');

        Schema::dropIfExists('pesanan_stok');
        Schema::dropIfExists('stok');
    }
};
