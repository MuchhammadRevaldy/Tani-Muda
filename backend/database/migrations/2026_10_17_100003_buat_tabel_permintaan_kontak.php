<?php

use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Alur request kontak (Add Contact Request).
 * Tabel permintaan_kontak (pemohon, target, status: menunggu, diterima, ditolak).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permintaan_kontak', function (Blueprint $table) {
            Skema::id($table);
            Skema::rujukan($table, 'pemohon_id');
            Skema::rujukan($table, 'target_id');
            $table->string('nomor_hp', 32);
            $table->string('pesan', 500)->nullable();
            $table->enum('status', ['menunggu', 'diterima', 'ditolak'])->default('menunggu');
            Skema::waktu($table);

            $table->foreign('pemohon_id')->references('id')->on('pengguna')->restrictOnDelete();
            $table->foreign('target_id')->references('id')->on('pengguna')->restrictOnDelete();

            $table->index(['target_id', 'status'], 'permintaan_kontak_target_status_idx');
            $table->index(['pemohon_id', 'target_id'], 'permintaan_kontak_pemohon_target_idx');
        });

        DB::statement("ALTER TABLE permintaan_kontak ADD CONSTRAINT cek_permintaan_kontak_status CHECK (status IN ('menunggu', 'diterima', 'ditolak'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE permintaan_kontak DROP CONSTRAINT IF EXISTS cek_permintaan_kontak_status');
        Schema::dropIfExists('permintaan_kontak');
    }
};
