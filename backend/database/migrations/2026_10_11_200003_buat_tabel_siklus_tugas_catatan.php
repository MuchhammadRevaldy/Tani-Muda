<?php

use App\Enums\AsalRencana;
use App\Enums\StatusSiklus;
use App\Enums\StatusTugas;
use App\Enums\StatusUkur;
use App\Enums\SumberUkur;
use App\Enums\TipeTugas;
use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * T5.06: siklus, rencana, tugas, pengukuran, pengeluaran, jurnal, pengingat, notifikasi, berkas
 * (kontrak-api.md 2.6, 2.7, 2.12). Status "terlambat" tidak disimpan; dihitung dari tanggal.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siklus_tanam', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'petani_id');
            Skema::rujukan($t, 'lahan_id');
            // Versi resep saat siklus dibuat (P0-04): resep_id menunjuk baris versi itu.
            Skema::rujukan($t, 'resep_id');
            $t->unsignedInteger('resep_versi');
            Skema::rujukan($t, 'komoditas_id');
            Skema::rujukan($t, 'metode_id');
            $t->enum('status', StatusSiklus::nilai());
            Skema::jumlah($t, 'luas_m2')->nullable();
            $t->unsignedInteger('jumlah_lubang')->nullable();
            $t->unsignedInteger('jumlah_polybag')->nullable();
            Skema::jumlah($t, 'volume_tandon_liter')->nullable();
            Skema::rujukan($t, 'sistem_hidroponik')->nullable();
            $t->boolean('vertikultur')->default(false);
            $t->string('satuan_asli', 16);
            Skema::jumlah($t, 'nilai_asli');
            $t->date('tanggal_tanam')->nullable();
            $t->boolean('dapat_subsidi')->default(false);
            Skema::uang($t, 'harga_jual');
            Skema::jumlah($t, 'perkiraan_panen_kg');
            // Kunci asing ke `alokasi_pesanan` dipasang di migrasi pesanan.
            Skema::rujukan($t, 'alokasi_pesanan_id')->nullable();
            $t->unsignedSmallInteger('petak_ke')->nullable();
            Skema::uang($t, 'pendapatan_nyata')->nullable();
            Skema::waktu($t);
            // Satu lahan boleh punya beberapa siklus aktif (D-15): tanpa kunci unik per lahan.
            $t->index(['lahan_id', 'status']);
            $t->index(['petani_id', 'status']);
            $t->foreign('petani_id')->references('id')->on('pengguna')->restrictOnDelete();
            $t->foreign('lahan_id')->references('id')->on('lahan')->restrictOnDelete();
            $t->foreign('resep_id')->references('id')->on('resep_tanam')->restrictOnDelete();
            $t->foreign('komoditas_id')->references('id')->on('komoditas')->restrictOnDelete();
            $t->foreign('metode_id')->references('id')->on('metode_tanam')->restrictOnDelete();
            $t->foreign('sistem_hidroponik')->references('id')->on('sistem_hidroponik')->restrictOnDelete();
        });
        Skema::tidakNegatif('siklus_tanam', 'luas_m2', 'volume_tandon_liter', 'nilai_asli', 'perkiraan_panen_kg');

        Schema::create('rencana_item', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'siklus_id');
            // `id` input di resep versi siklus ini (unik per resep, bukan global): tanpa kunci asing.
            Skema::rujukan($t, 'resep_input_id')->nullable();
            Skema::rujukan($t, 'input_id')->nullable();
            Skema::rujukan($t, 'merek_id')->nullable();
            $t->string('nama');
            $t->string('grup', 32);
            Skema::faktor($t, 'jumlah');
            $t->string('satuan', 16);
            $t->decimal('harga_satuan', 14, 2)->nullable();
            $t->enum('asal', AsalRencana::nilai());
            $t->boolean('alat_sekali_beli')->default(false);
            $t->unsignedSmallInteger('jumlah_siklus_pembagian')->default(1);
            Skema::waktu($t);
            $t->foreign('siklus_id')->references('id')->on('siklus_tanam')->cascadeOnDelete();
            $t->foreign('input_id')->references('id')->on('input_pertanian')->restrictOnDelete();
            $t->foreign('merek_id')->references('id')->on('merek_input')->nullOnDelete();
        });
        Skema::tidakNegatif('rencana_item', 'jumlah', 'harga_satuan');
        Skema::periksa('rencana_item', 'rencana_item_pembagian_positif', '`jumlah_siklus_pembagian` > 0');

        Schema::create('tugas', function (Blueprint $t) {
            // ID `siklus:pola@hst` dari jadwal resep.
            Skema::id($t);
            Skema::rujukan($t, 'siklus_id');
            Skema::rujukan($t, 'resep_tugas_id');
            $t->string('judul');
            $t->enum('tipe', TipeTugas::nilai());
            $t->date('tanggal');
            $t->smallInteger('hst');
            $t->enum('status', StatusTugas::nilai())->default(StatusTugas::Belum->value);
            $t->timestamp('selesai_pada')->nullable();
            $t->boolean('boleh_digeser')->default(true);
            $t->unsignedSmallInteger('interval')->nullable();
            $t->json('ukur')->nullable();
            $t->string('foto')->nullable();
            $t->string('catatan', 1000)->nullable();
            Skema::waktu($t);
            $t->index(['siklus_id', 'tanggal']);
            $t->index(['tanggal', 'status']);
            $t->foreign('siklus_id')->references('id')->on('siklus_tanam')->cascadeOnDelete();
        });
        Skema::periksa('tugas', 'tugas_selesai_punya_waktu', "`status` <> 'selesai' OR `selesai_pada` IS NOT NULL");

        Schema::create('hasil_pengukuran', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'tugas_id');
            Skema::rujukan($t, 'siklus_id');
            $t->string('besaran', 32);
            // 0 sah (D-34); batas skala per besaran dicek di aplikasi.
            $t->decimal('nilai', 10, 2);
            $t->enum('status', StatusUkur::nilai());
            $t->enum('sumber', SumberUkur::nilai())->default(SumberUkur::Manual->value);
            $t->date('tanggal');
            $t->timestamp('dicatat_pada')->useCurrent();
            Skema::waktu($t);
            $t->index(['siklus_id', 'besaran', 'tanggal']);
            $t->foreign('tugas_id')->references('id')->on('tugas')->cascadeOnDelete();
            $t->foreign('siklus_id')->references('id')->on('siklus_tanam')->cascadeOnDelete();
        });

        Schema::create('pengeluaran', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'siklus_id');
            Skema::rujukan($t, 'rencana_item_id')->nullable();
            $t->string('nama');
            Skema::uang($t, 'nominal');
            $t->date('tanggal');
            $t->string('foto_nota')->nullable();
            Skema::waktu($t);
            $t->foreign('siklus_id')->references('id')->on('siklus_tanam')->restrictOnDelete();
            $t->foreign('rencana_item_id')->references('id')->on('rencana_item')->nullOnDelete();
        });

        Schema::create('jurnal', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'siklus_id');
            $t->date('tanggal');
            $t->smallInteger('hari_ke');
            $t->string('foto')->nullable();
            $t->string('catatan', 1000)->nullable();
            Skema::rujukan($t, 'tugas_id')->nullable();
            $t->string('judul_tugas')->nullable();
            Skema::waktu($t);
            $t->index(['siklus_id', 'tanggal']);
            $t->foreign('siklus_id')->references('id')->on('siklus_tanam')->cascadeOnDelete();
            $t->foreign('tugas_id')->references('id')->on('tugas')->nullOnDelete();
        });

        Schema::create('pengaturan_pengingat', function (Blueprint $t) {
            Skema::id($t, 'siklus_id');
            $t->char('jam_pagi', 5)->default('06:00');
            $t->boolean('pengingat_sore')->default(false);
            $t->json('tipe_aktif');
            Skema::waktu($t);
            $t->foreign('siklus_id')->references('id')->on('siklus_tanam')->cascadeOnDelete();
        });
        Skema::periksa('pengaturan_pengingat', 'pengaturan_pengingat_jam_pagi', "`jam_pagi` BETWEEN '05:00' AND '07:00'");

        // Kolom mengikuti tabel paket web push (gelombang 5.6) dengan nama tabel diarahkan ke sini.
        Schema::create('langganan_notifikasi', function (Blueprint $t) {
            $t->id();
            $t->string('subscribable_type');
            Skema::rujukan($t, 'subscribable_id');
            $t->string('endpoint', 500)->unique();
            $t->string('public_key')->nullable();
            $t->string('auth_token')->nullable();
            $t->string('content_encoding')->nullable();
            $t->timestamps();
            $t->index(['subscribable_type', 'subscribable_id']);
        });

        // Mencegah notifikasi terkirim ganda (arsitektur-backend.md bagian 7).
        Schema::create('log_notifikasi', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukan($t, 'pengguna_id');
            $t->string('jenis', 64);
            $t->string('kunci', 191);
            $t->timestamp('dikirim_pada')->useCurrent();
            $t->unique(['pengguna_id', 'jenis', 'kunci']);
            $t->foreign('pengguna_id')->references('id')->on('pengguna')->cascadeOnDelete();
        });

        // Foto pengguna di disk privat; URL bertanda tangan 10 menit (kontrak 2.12).
        Schema::create('berkas', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pemilik_id');
            $t->string('jalur', 500);
            $t->string('jenis', 32);
            $t->unsignedInteger('ukuran_byte');
            Skema::waktu($t);
            $t->foreign('pemilik_id')->references('id')->on('pengguna')->restrictOnDelete();
        });
        Skema::periksa('berkas', 'berkas_ukuran_maks', '`ukuran_byte` <= 2097152');
    }

    public function down(): void
    {
        foreach (['berkas', 'log_notifikasi', 'langganan_notifikasi', 'pengaturan_pengingat', 'jurnal', 'pengeluaran', 'hasil_pengukuran', 'tugas', 'rencana_item', 'siklus_tanam'] as $tabel) {
            Schema::dropIfExists($tabel);
        }
    }
};
