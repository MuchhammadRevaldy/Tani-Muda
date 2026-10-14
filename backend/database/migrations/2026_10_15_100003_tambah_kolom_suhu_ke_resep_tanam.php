<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F-06: Tambah kolom suhu dan saran suhu ke tabel resep_tanam (PRD Tambahan F-06, bagian 3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resep_tanam', function (Blueprint $t) {
            $t->decimal('suhu_ideal_min', 4, 1)->nullable()->after('standar_kualitas');
            $t->decimal('suhu_ideal_maks', 4, 1)->nullable()->after('suhu_ideal_min');
            $t->decimal('suhu_batas_min', 4, 1)->nullable()->after('suhu_ideal_maks');
            $t->decimal('suhu_batas_maks', 4, 1)->nullable()->after('suhu_batas_min');
            $t->string('saran_suhu_tinggi', 255)->nullable()->after('suhu_batas_maks');
            $t->string('saran_suhu_rendah', 255)->nullable()->after('saran_suhu_tinggi');
        });

        DB::statement('ALTER TABLE resep_tanam ADD CONSTRAINT chk_resep_tanam_rentang_suhu CHECK (
            (suhu_batas_min IS NULL AND suhu_ideal_min IS NULL AND suhu_ideal_maks IS NULL AND suhu_batas_maks IS NULL)
            OR (suhu_batas_min IS NOT NULL AND suhu_ideal_min IS NOT NULL AND suhu_ideal_maks IS NOT NULL AND suhu_batas_maks IS NOT NULL
                AND suhu_batas_min <= suhu_ideal_min
                AND suhu_ideal_min <= suhu_ideal_maks
                AND suhu_ideal_maks <= suhu_batas_maks)
        )');
    }

    public function down(): void
    {
        Schema::table('resep_tanam', function (Blueprint $t) {
            $t->dropColumn([
                'suhu_ideal_min',
                'suhu_ideal_maks',
                'suhu_batas_min',
                'suhu_batas_maks',
                'saran_suhu_tinggi',
                'saran_suhu_rendah',
            ]);
        });
    }
};
