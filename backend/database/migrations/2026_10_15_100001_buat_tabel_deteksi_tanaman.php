<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-04: Tabel deteksi_tanaman (PRD Tambahan F-04, bagian 3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deteksi_tanaman', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pengguna_id');
            Skema::rujukan($t, 'siklus_id')->nullable();
            Skema::rujukan($t, 'tugas_id')->nullable();
            Skema::rujukan($t, 'berkas_id');
            $t->json('hasil');
            $t->string('model', 64);
            $t->timestamp('dibuat_pada')->useCurrent();

            $t->foreign('pengguna_id')
                ->references('id')
                ->on('pengguna')
                ->restrictOnDelete();

            $t->foreign('siklus_id')
                ->references('id')
                ->on('siklus_tanam')
                ->restrictOnDelete();

            $t->foreign('tugas_id')
                ->references('id')
                ->on('tugas')
                ->restrictOnDelete();

            $t->foreign('berkas_id')
                ->references('id')
                ->on('berkas')
                ->restrictOnDelete();

            $t->index(['pengguna_id', 'dibuat_pada']);
            $t->index(['siklus_id', 'dibuat_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deteksi_tanaman');
    }
};
