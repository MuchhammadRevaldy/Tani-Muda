<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-01b: Kolom opsional dan keterangan_opsional pada resep_input (PRD Tambahan F-01, D-64).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resep_input', function (Blueprint $t) {
            $t->boolean('opsional')->default(false)->after('alat_sekali_beli');
            $t->string('keterangan_opsional')->nullable()->after('opsional');
        });

        Skema::periksa('resep_input', 'resep_input_opsional_keterangan', '`opsional` = 0 OR `keterangan_opsional` IS NOT NULL');
    }

    public function down(): void
    {
        Schema::table('resep_input', function (Blueprint $t) {
            $t->dropColumn(['opsional', 'keterangan_opsional']);
        });
    }
};
