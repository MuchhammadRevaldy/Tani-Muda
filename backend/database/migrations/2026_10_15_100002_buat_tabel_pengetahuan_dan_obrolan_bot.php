<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * F-05: Tabel pengetahuan_sumber, pengetahuan_potongan, dan obrolan_bot (PRD Tambahan F-05, bagian 3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengetahuan_sumber', function (Blueprint $t) {
            Skema::id($t);
            $t->string('judul', 255);
            $t->string('jenis', 32);
            $t->string('lisensi', 64);
            $t->string('url', 500)->nullable();
            $t->timestamp('dibuat_pada')->useCurrent();
        });

        DB::statement("ALTER TABLE pengetahuan_sumber ADD CONSTRAINT chk_pengetahuan_sumber_jenis CHECK (jenis IN ('resep', 'modul', 'paper'))");

        Schema::create('pengetahuan_potongan', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'sumber_id');
            $t->unsignedInteger('urutan');
            $t->text('isi');
            $t->json('embedding')->nullable();
            $t->timestamp('dibuat_pada')->useCurrent();

            $t->foreign('sumber_id')
                ->references('id')
                ->on('pengetahuan_sumber')
                ->cascadeOnDelete();

            $t->index(['sumber_id', 'urutan']);
        });

        Schema::create('obrolan_bot', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pengguna_id');
            $t->string('percakapan_bot_id', 64)->collation('ascii_bin');
            $t->string('peran', 16);
            $t->text('isi');
            $t->json('sumber')->nullable();
            $t->timestamp('dibuat_pada')->useCurrent();

            $t->foreign('pengguna_id')
                ->references('id')
                ->on('pengguna')
                ->cascadeOnDelete();

            $t->index(['pengguna_id', 'percakapan_bot_id', 'dibuat_pada']);
        });

        DB::statement("ALTER TABLE obrolan_bot ADD CONSTRAINT chk_obrolan_bot_peran CHECK (peran IN ('user', 'assistant'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('obrolan_bot');
        Schema::dropIfExists('pengetahuan_potongan');
        Schema::dropIfExists('pengetahuan_sumber');
    }
};
