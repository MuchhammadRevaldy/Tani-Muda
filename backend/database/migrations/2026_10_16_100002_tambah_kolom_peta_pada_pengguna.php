<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F-08: Peta petani sekitar pembeli. Kolom lokasi perkiraan dan sakelar tampil di peta.
 * Pembulatan 2 desimal dilakukan di server; koordinat persis tidak pernah disimpan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->boolean('tampil_di_peta')->default(false)->after('setuju_ai_pada');
            $table->decimal('lokasi_kira_lintang', 6, 2)->nullable()->after('tampil_di_peta');
            $table->decimal('lokasi_kira_bujur', 6, 2)->nullable()->after('lokasi_kira_lintang');
            $table->timestamp('lokasi_diperbarui_pada')->nullable()->after('lokasi_kira_bujur');

            $table->index(['lokasi_kira_lintang', 'lokasi_kira_bujur'], 'pengguna_lokasi_kira_idx');
        });

        // CHECK constraint untuk lintang dan bujur bila terisi
        DB::statement('ALTER TABLE pengguna ADD CONSTRAINT cek_pengguna_lokasi_kira CHECK (
            (lokasi_kira_lintang IS NULL AND lokasi_kira_bujur IS NULL) OR
            (lokasi_kira_lintang BETWEEN -90.00 AND 90.00 AND lokasi_kira_bujur BETWEEN -180.00 AND 180.00)
        )');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE pengguna DROP CONSTRAINT IF EXISTS cek_pengguna_lokasi_kira');

        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropIndex('pengguna_lokasi_kira_idx');
            $table->dropColumn([
                'tampil_di_peta',
                'lokasi_kira_lintang',
                'lokasi_kira_bujur',
                'lokasi_diperbarui_pada',
            ]);
        });
    }
};
