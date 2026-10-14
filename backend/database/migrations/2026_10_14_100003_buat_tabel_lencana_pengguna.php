<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * F-03: Tabel lencana_pengguna (PRD Tambahan F-03, D-64).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lencana_pengguna', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pengguna_id');
            $t->string('kode', 64);
            $t->timestamp('diraih_pada')->useCurrent();
            $t->timestamp('dilihat_pada')->nullable();

            $t->foreign('pengguna_id')
                ->references('id')
                ->on('pengguna')
                ->onDelete('cascade');

            $t->unique(['pengguna_id', 'kode'], 'lencana_pengguna_unik');
            $t->index(['pengguna_id', 'diraih_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lencana_pengguna');
    }
};
