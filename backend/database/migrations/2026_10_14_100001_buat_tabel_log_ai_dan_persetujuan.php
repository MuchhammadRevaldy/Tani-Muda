<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-00: Tabel log_ai dan kolom pengguna.setuju_ai_pada (PRD Tambahan F-00, D-64).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengguna', function (Blueprint $t) {
            $t->timestamp('setuju_ai_pada')->nullable()->after('setuju_privasi_pada');
        });

        Schema::create('log_ai', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pengguna_id')->nullable();
            $t->string('fitur', 32);
            $t->string('model', 64);
            $t->unsignedInteger('token_masuk')->default(0);
            $t->unsignedInteger('token_keluar')->default(0);
            $t->decimal('perkiraan_biaya', 10, 4)->default(0);
            $t->boolean('berhasil')->default(true);
            $t->string('kode_galat', 64)->nullable();
            $t->timestamp('dibuat_pada')->useCurrent();

            $t->foreign('pengguna_id')
                ->references('id')
                ->on('pengguna')
                ->onDelete('set null');

            $t->index(['pengguna_id', 'dibuat_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_ai');
        Schema::table('pengguna', function (Blueprint $t) {
            $t->dropColumn('setuju_ai_pada');
        });
    }
};
