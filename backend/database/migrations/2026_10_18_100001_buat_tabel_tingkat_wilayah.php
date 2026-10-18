<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel tingkat kabupaten/kota dan kecamatan (D-67, AG-41).
 * 
 * Memungkinkan pemilihan bertingkat: Kabupaten/Kota -> Kecamatan -> Desa,
 * dengan kode resmi Kemendagri PP.KK dan PP.KK.CC.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wilayah_kabupaten', function (Blueprint $t) {
            $t->string('id', 5)->charset('ascii')->collation('ascii_bin')->primary();
            $t->string('nama', 100);
            $t->string('provinsi_id', 2)->charset('ascii')->collation('ascii_bin')->index();
            $t->decimal('lintang', 9, 6)->nullable();
            $t->decimal('bujur', 9, 6)->nullable();
            Skema::waktu($t);
        });

        Schema::create('wilayah_kecamatan', function (Blueprint $t) {
            $t->string('id', 8)->charset('ascii')->collation('ascii_bin')->primary();
            $t->string('nama', 100);
            $t->string('kabupaten_id', 5)->charset('ascii')->collation('ascii_bin')->index();
            $t->decimal('lintang', 9, 6)->nullable();
            $t->decimal('bujur', 9, 6)->nullable();
            $t->boolean('koordinat_perkiraan')->default(true);
            Skema::waktu($t);
        });

        Schema::table('wilayah', function (Blueprint $t) {
            $t->string('kabupaten_id', 5)->charset('ascii')->collation('ascii_bin')->nullable()->after('provinsi');
            $t->string('kecamatan_id', 8)->charset('ascii')->collation('ascii_bin')->nullable()->after('kabupaten_id');
            $t->index('kabupaten_id');
            $t->index('kecamatan_id');
        });
    }

    public function down(): void
    {
        Schema::table('wilayah', function (Blueprint $t) {
            $t->dropIndex(['kabupaten_id']);
            $t->dropIndex(['kecamatan_id']);
            $t->dropColumn(['kabupaten_id', 'kecamatan_id']);
        });

        Schema::dropIfExists('wilayah_kecamatan');
        Schema::dropIfExists('wilayah_kabupaten');
    }
};
