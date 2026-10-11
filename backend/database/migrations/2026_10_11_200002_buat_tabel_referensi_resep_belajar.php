<?php

use App\Enums\AsalAngkaContoh;
use App\Enums\DasarDosis;
use App\Enums\DasarUkuran;
use App\Enums\KategoriInput;
use App\Enums\KategoriKomoditas;
use App\Enums\ModalAwal;
use App\Enums\SatuanKonversi;
use App\Enums\StatusResep;
use App\Enums\TipeTugas;
use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * T5.05: referensi, resep, belajar (kontrak-api.md 2.4, 2.5, 2.8). Resep diversikan: setiap simpan
 * menjadi baris baru (K3), jadi input dan tugas resep punya kunci angka sendiri dan `id` yang unik
 * per resep (id seperti `benih` atau `siram` berulang di resep lain).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('komoditas', function (Blueprint $t) {
            Skema::id($t);
            $t->string('nama');
            $t->enum('kategori', KategoriKomoditas::nilai());
            $t->json('jenis_lahan_cocok');
            $t->string('satuan_panen', 16);
            $t->unsignedSmallInteger('umur_panen_hari');
            Skema::uang($t, 'harga_jual_contoh')->nullable();
            Skema::waktu($t);
        });

        Schema::create('metode_tanam', function (Blueprint $t) {
            Skema::id($t);
            $t->string('nama');
            $t->enum('dasar_ukuran', DasarUkuran::nilai());
            $t->enum('modal_awal', ModalAwal::nilai());
            $t->boolean('bisa_vertikultur')->default(false);
            $t->string('kebutuhan_lahan');
            $t->string('frekuensi_perawatan');
            Skema::waktu($t);
        });

        Schema::create('sistem_hidroponik', function (Blueprint $t) {
            Skema::id($t);
            $t->string('nama');
            $t->string('keterangan', 500);
            Skema::faktor($t, 'liter_tandon_per_lubang');
            Skema::faktor($t, 'tempat_per_lubang_m2');
            Skema::waktu($t);
        });
        Skema::tidakNegatif('sistem_hidroponik', 'liter_tandon_per_lubang', 'tempat_per_lubang_m2');

        Schema::create('konversi_satuan', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukanWilayah($t, 'wilayah_id');
            $t->enum('satuan', SatuanKonversi::nilai());
            Skema::faktor($t, 'nilai_m2');
            Skema::waktu($t);
            $t->unique(['wilayah_id', 'satuan']);
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->cascadeOnDelete();
        });
        Skema::periksa('konversi_satuan', 'konversi_satuan_nilai_positif', '`nilai_m2` > 0');

        Schema::create('input_pertanian', function (Blueprint $t) {
            Skema::id($t);
            $t->string('nama');
            $t->enum('kategori', KategoriInput::nilai());
            $t->string('kandungan')->nullable();
            $t->string('satuan', 16);
            Skema::waktu($t);
        });

        Schema::create('merek_input', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'input_id');
            $t->string('nama');
            $t->string('produsen')->nullable();
            Skema::faktor($t, 'isi_kemasan');
            $t->string('teks_kemasan');
            $t->string('nomor_pendaftaran')->nullable();
            Skema::waktu($t);
            $t->foreign('input_id')->references('id')->on('input_pertanian')->cascadeOnDelete();
        });
        Skema::periksa('merek_input', 'merek_input_isi_positif', '`isi_kemasan` > 0');

        Schema::create('laporan_harga', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'merek_id');
            Skema::rujukan($t, 'pelapor_id');
            Skema::uang($t, 'harga_kemasan');
            $t->string('kecamatan');
            $t->date('tanggal');
            Skema::waktu($t);
            $t->index(['merek_id', 'tanggal']);
            $t->foreign('merek_id')->references('id')->on('merek_input')->cascadeOnDelete();
            $t->foreign('pelapor_id')->references('id')->on('pengguna')->cascadeOnDelete();
        });

        Schema::create('kelayakan_subsidi', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukan($t, 'input_id');
            Skema::rujukan($t, 'komoditas_id');
            $t->date('berlaku_mulai');
            $t->date('berlaku_sampai');
            Skema::uang($t, 'het_per_satuan');
            Skema::waktu($t);
            $t->index(['komoditas_id', 'input_id']);
            $t->foreign('input_id')->references('id')->on('input_pertanian')->cascadeOnDelete();
            $t->foreign('komoditas_id')->references('id')->on('komoditas')->cascadeOnDelete();
        });
        Skema::periksa('kelayakan_subsidi', 'kelayakan_subsidi_rentang_tanggal', '`berlaku_sampai` >= `berlaku_mulai`');

        Schema::create('promo', function (Blueprint $t) {
            Skema::id($t);
            $t->string('pemasang');
            $t->string('isi', 500);
            Skema::rujukanWilayah($t, 'wilayah_id');
            $t->decimal('jarak_km', 8, 2)->nullable();
            $t->date('berlaku_mulai');
            $t->date('berlaku_sampai');
            Skema::waktu($t);
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->cascadeOnDelete();
        });
        Skema::tidakNegatif('promo', 'jarak_km');
        Skema::periksa('promo', 'promo_rentang_tanggal', '`berlaku_sampai` >= `berlaku_mulai`');

        Schema::create('resep_tanam', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'komoditas_id');
            Skema::rujukan($t, 'metode_id');
            $t->unsignedInteger('versi');
            $t->enum('status', StatusResep::nilai())->default(StatusResep::Draf->value);
            $t->boolean('contoh')->default(false);
            $t->enum('asal_angka_contoh', AsalAngkaContoh::nilai())->nullable();
            $t->string('validator')->nullable();
            $t->date('tanggal_validasi')->nullable();
            Skema::faktor($t, 'hasil_per_satuan');
            $t->enum('dasar_ukuran', DasarUkuran::nilai());
            $t->unsignedSmallInteger('umur_panen_hari');
            $t->unsignedSmallInteger('jumlah_pengisian_larutan')->nullable();
            $t->unsignedTinyInteger('persen_panen_jelek')->nullable();
            $t->string('alasan_panen_jelek', 500)->nullable();
            $t->json('standar_kualitas');
            Skema::waktu($t);
            // Satu resep per komoditas, metode, dan versi.
            $t->unique(['komoditas_id', 'metode_id', 'versi']);
            $t->foreign('komoditas_id')->references('id')->on('komoditas')->restrictOnDelete();
            $t->foreign('metode_id')->references('id')->on('metode_tanam')->restrictOnDelete();
        });
        Skema::periksa('resep_tanam', 'resep_tanam_hasil_positif', '`hasil_per_satuan` > 0');
        Skema::periksa('resep_tanam', 'resep_tanam_umur_positif', '`umur_panen_hari` > 0');
        Skema::periksa('resep_tanam', 'resep_tanam_persen_panen_jelek',
            '`persen_panen_jelek` IS NULL OR `persen_panen_jelek` BETWEEN 1 AND 100');
        Skema::periksa('resep_tanam', 'resep_tanam_divalidasi_punya_validator',
            "`status` <> 'divalidasi' OR (`validator` IS NOT NULL AND `tanggal_validasi` IS NOT NULL)");

        Schema::create('resep_input', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukan($t, 'resep_id');
            Skema::rujukan($t, 'id');
            $t->unsignedSmallInteger('urutan');
            Skema::rujukan($t, 'input_id')->nullable();
            $t->string('nama');
            $t->string('grup', 32);
            Skema::faktor($t, 'dosis');
            $t->string('satuan_dosis', 16);
            $t->enum('dasar_dosis', DasarDosis::nilai());
            $t->string('satuan_beli', 16);
            Skema::faktor($t, 'isi_satuan_beli')->nullable();
            Skema::faktor($t, 'ukuran_kemasan');
            $t->boolean('alat_sekali_beli')->default(false);
            Skema::uang($t, 'harga_contoh')->nullable();
            $t->unique(['resep_id', 'id']);
            $t->foreign('resep_id')->references('id')->on('resep_tanam')->cascadeOnDelete();
            $t->foreign('input_id')->references('id')->on('input_pertanian')->restrictOnDelete();
        });
        Skema::tidakNegatif('resep_input', 'dosis', 'isi_satuan_beli', 'ukuran_kemasan');

        Schema::create('resep_tugas', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukan($t, 'resep_id');
            Skema::rujukan($t, 'id');
            $t->unsignedSmallInteger('urutan');
            $t->string('judul');
            $t->enum('tipe', TipeTugas::nilai());
            $t->smallInteger('hst_mulai');
            $t->smallInteger('hst_selesai')->nullable();
            $t->unsignedSmallInteger('interval')->nullable();
            $t->json('ukur')->nullable();
            $t->boolean('boleh_digeser')->default(true);
            $t->string('saran_terlambat', 500)->nullable();
            $t->json('cara_mengerjakan')->nullable();
            $t->unique(['resep_id', 'id']);
            $t->foreign('resep_id')->references('id')->on('resep_tanam')->cascadeOnDelete();
        });
        Skema::periksa('resep_tugas', 'resep_tugas_rentang_hst', '`hst_selesai` IS NULL OR `hst_selesai` >= `hst_mulai`');
        Skema::periksa('resep_tugas', 'resep_tugas_interval_positif', '`interval` IS NULL OR `interval` > 0');

        Schema::create('modul', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'komoditas_id');
            Skema::rujukan($t, 'metode_id');
            $t->string('tahap', 32);
            $t->string('judul');
            $t->string('ringkasan', 1000);
            $t->unsignedSmallInteger('menit');
            $t->unsignedSmallInteger('urutan');
            // Hari mulai tahap, untuk modul tahap berjalan (D-43).
            $t->smallInteger('hst_mulai')->default(0);
            $t->string('video_url')->nullable();
            $t->decimal('ukuran_video_mb', 5, 1)->nullable();
            Skema::waktu($t);
            $t->index(['komoditas_id', 'metode_id', 'urutan']);
            $t->foreign('komoditas_id')->references('id')->on('komoditas')->restrictOnDelete();
            $t->foreign('metode_id')->references('id')->on('metode_tanam')->restrictOnDelete();
        });
        Skema::periksa('modul', 'modul_ukuran_video', '`ukuran_video_mb` IS NULL OR `ukuran_video_mb` BETWEEN 0 AND 15');

        Schema::create('progres_modul', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukan($t, 'pengguna_id');
            Skema::rujukan($t, 'modul_id');
            $t->timestamp('selesai_pada')->useCurrent();
            $t->unique(['pengguna_id', 'modul_id']);
            $t->foreign('pengguna_id')->references('id')->on('pengguna')->cascadeOnDelete();
            $t->foreign('modul_id')->references('id')->on('modul')->cascadeOnDelete();
        });

        Schema::create('permintaan_resep', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pengguna_id');
            Skema::rujukan($t, 'komoditas_id');
            Skema::rujukan($t, 'metode_id')->nullable();
            Skema::rujukanWilayah($t, 'wilayah_id')->nullable();
            Skema::waktu($t);
            // Satu permintaan per pengguna, komoditas, dan metode (arsitektur-backend.md bagian 7).
            // NULL selalu dianggap berbeda di kunci unik, jadi "tanpa metode" diwakili string kosong.
            Skema::rujukan($t, 'metode_kunci')->storedAs("IFNULL(`metode_id`, '')");
            $t->unique(['pengguna_id', 'komoditas_id', 'metode_kunci']);
            $t->foreign('pengguna_id')->references('id')->on('pengguna')->cascadeOnDelete();
            $t->foreign('komoditas_id')->references('id')->on('komoditas')->restrictOnDelete();
            $t->foreign('metode_id')->references('id')->on('metode_tanam')->restrictOnDelete();
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        foreach (['permintaan_resep', 'progres_modul', 'modul', 'resep_tugas', 'resep_input', 'resep_tanam', 'promo', 'kelayakan_subsidi', 'laporan_harga', 'merek_input', 'input_pertanian', 'konversi_satuan', 'sistem_hidroponik', 'metode_tanam', 'komoditas'] as $tabel) {
            Schema::dropIfExists($tabel);
        }
    }
};
