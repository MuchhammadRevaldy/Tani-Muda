<?php

use App\Enums\AlasanPenolakan;
use App\Enums\JenisPembayaran;
use App\Enums\JenisPesanan;
use App\Enums\KeputusanSengketa;
use App\Enums\StatusAlokasi;
use App\Enums\StatusPembayaran;
use App\Enums\StatusPengiriman;
use App\Enums\StatusPesanan;
use App\Enums\StatusSengketa;
use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * T5.07: pesanan, alokasi, pengiriman, pembayaran, rating, sengketa (kontrak-api.md 2.9–2.11),
 * ditambah kunci idempoten (kontrak 1.7). Angka uang dihitung server (D-08) lalu disimpan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesanan', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pembeli_id');
            $t->enum('jenis', JenisPesanan::nilai());
            Skema::rujukan($t, 'komoditas_id');
            Skema::jumlah($t, 'jumlah_per_kiriman_kg')->nullable();
            $t->unsignedSmallInteger('frekuensi_hari')->nullable();
            $t->unsignedSmallInteger('jumlah_kiriman');
            Skema::jumlah($t, 'jumlah_total_kg');
            $t->date('tanggal_mulai')->nullable();
            $t->date('tanggal_selesai')->nullable();
            $t->char('perkiraan_bulan_panen', 7)->nullable();
            Skema::uang($t, 'harga_per_kg');
            $t->json('standar_kualitas');
            // Desa titik antar; jarak ke petani dihitung dari titik tengahnya (D-06).
            Skema::rujukanWilayah($t, 'wilayah_id');
            $t->string('alamat_antar', 500);
            $t->string('patokan', 500)->nullable();
            $t->char('batas_jam_antar', 5)->nullable();
            $t->enum('status', StatusPesanan::nilai())->default(StatusPesanan::MenungguPembayaran->value);
            Skema::uang($t, 'nilai_pesanan');
            Skema::uang($t, 'uang_muka');
            Skema::uang($t, 'biaya_layanan');
            Skema::uang($t, 'saldo_uang_muka');
            Skema::jumlah($t, 'terambil_kg')->default(0);
            Skema::waktu($t);
            $t->index(['status', 'komoditas_id']);
            $t->index('pembeli_id');
            $t->foreign('pembeli_id')->references('id')->on('pengguna')->restrictOnDelete();
            $t->foreign('komoditas_id')->references('id')->on('komoditas')->restrictOnDelete();
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->restrictOnDelete();
        });
        Skema::tidakNegatif('pesanan', 'jumlah_per_kiriman_kg', 'jumlah_total_kg', 'terambil_kg');
        Skema::periksa('pesanan', 'pesanan_jumlah_positif', '`jumlah_total_kg` > 0 AND `jumlah_kiriman` > 0 AND `harga_per_kg` > 0');
        Skema::periksa('pesanan', 'pesanan_terambil_tidak_melebihi', '`terambil_kg` <= `jumlah_total_kg`');
        Skema::periksa('pesanan', 'pesanan_saldo_tidak_melebihi_uang_muka', '`saldo_uang_muka` <= `uang_muka`');
        Skema::periksa('pesanan', 'pesanan_rutin_lengkap',
            "`jenis` <> 'rutin' OR (`jumlah_per_kiriman_kg` IS NOT NULL AND `frekuensi_hari` IS NOT NULL AND `tanggal_mulai` IS NOT NULL)");
        Skema::periksa('pesanan', 'pesanan_sekali_panen_satu_kiriman',
            "`jenis` <> 'sekali_panen' OR (`jumlah_kiriman` = 1 AND `perkiraan_bulan_panen` IS NOT NULL)");

        Schema::create('alokasi_pesanan', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pesanan_id');
            Skema::rujukan($t, 'petani_id');
            // Per kiriman untuk pesanan rutin.
            Skema::jumlah($t, 'jumlah_kg');
            $t->enum('status', StatusAlokasi::nilai())->default(StatusAlokasi::MenungguKesepakatan->value);
            $t->timestamp('disetujui_pada')->nullable();
            Skema::waktu($t);
            $t->index(['pesanan_id', 'status']);
            $t->index(['petani_id', 'status']);
            $t->foreign('pesanan_id')->references('id')->on('pesanan')->restrictOnDelete();
            $t->foreign('petani_id')->references('id')->on('pengguna')->restrictOnDelete();
        });
        Skema::periksa('alokasi_pesanan', 'alokasi_pesanan_jumlah_positif', '`jumlah_kg` > 0');

        Schema::create('pengiriman', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'alokasi_id');
            Skema::rujukan($t, 'pesanan_id');
            $t->unsignedSmallInteger('ke');
            $t->date('tanggal_jadwal');
            Skema::jumlah($t, 'jumlah_kg');
            Skema::uang($t, 'harga_per_kg');
            $t->string('foto_kualitas')->nullable();
            $t->string('foto_timbangan')->nullable();
            $t->enum('status', StatusPengiriman::nilai())->default(StatusPengiriman::Terjadwal->value);
            $t->timestamp('dikirim_pada')->nullable();
            // 6 jam rutin, 24 jam sekali panen (D-01); diisi saat dikirim.
            $t->timestamp('batas_periksa_pada')->nullable();
            $t->timestamp('dikonfirmasi_pada')->nullable();
            $t->boolean('dianggap_diterima')->default(false);
            Skema::jumlah($t, 'jumlah_ditolak_kg')->default(0);
            $t->enum('alasan_penolakan', AlasanPenolakan::nilai())->nullable();
            $t->string('keterangan_penolakan', 500)->nullable();
            $t->string('foto_penolakan')->nullable();
            Skema::uang($t, 'nilai_diterima')->nullable();
            Skema::waktu($t);
            $t->unique(['alokasi_id', 'ke']);
            $t->index(['status', 'batas_periksa_pada']);
            $t->foreign('alokasi_id')->references('id')->on('alokasi_pesanan')->restrictOnDelete();
            $t->foreign('pesanan_id')->references('id')->on('pesanan')->restrictOnDelete();
        });
        Skema::tidakNegatif('pengiriman', 'jumlah_kg', 'jumlah_ditolak_kg');
        // D-14: alasan "lainnya" wajib disertai keterangan teks.
        Skema::periksa('pengiriman', 'pengiriman_lainnya_wajib_keterangan',
            "`alasan_penolakan` IS NULL OR `alasan_penolakan` <> 'lainnya' OR (`keterangan_penolakan` IS NOT NULL AND TRIM(`keterangan_penolakan`) <> '')");
        Skema::periksa('pengiriman', 'pengiriman_ditolak_tidak_melebihi_dikirim', '`jumlah_ditolak_kg` <= `jumlah_kg`');

        Schema::create('pembayaran', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pesanan_id');
            Skema::rujukan($t, 'pengiriman_id')->nullable();
            $t->enum('jenis', JenisPembayaran::nilai());
            Skema::uang($t, 'nominal');
            $t->enum('status', StatusPembayaran::nilai());
            // Referensi tiruan diawali `TIRUAN-`.
            $t->string('referensi', 64);
            $t->boolean('mode_uji_coba')->default(true);
            // Disimpan server, tidak dikirim (kontrak 2.10); klik ganda tidak membayar dua kali.
            $t->string('kunci_idempoten', 100)->nullable()->unique();
            Skema::waktu($t);
            $t->index(['pesanan_id', 'jenis']);
            $t->foreign('pesanan_id')->references('id')->on('pesanan')->restrictOnDelete();
            $t->foreign('pengiriman_id')->references('id')->on('pengiriman')->restrictOnDelete();
        });

        Schema::create('rating', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pengiriman_id');
            Skema::rujukan($t, 'pemberi_id');
            Skema::rujukan($t, 'penerima_id');
            $t->unsignedTinyInteger('nilai');
            $t->string('komentar', 1000)->nullable();
            Skema::waktu($t);
            // SUDAH_DINILAI: satu rating per pemberi per kiriman.
            $t->unique(['pengiriman_id', 'pemberi_id']);
            $t->index('penerima_id');
            $t->foreign('pengiriman_id')->references('id')->on('pengiriman')->restrictOnDelete();
            $t->foreign('pemberi_id')->references('id')->on('pengguna')->restrictOnDelete();
            $t->foreign('penerima_id')->references('id')->on('pengguna')->restrictOnDelete();
        });
        Skema::periksa('rating', 'rating_nilai_1_sampai_5', '`nilai` BETWEEN 1 AND 5');
        Skema::periksa('rating', 'rating_bukan_diri_sendiri', '`pemberi_id` <> `penerima_id`');

        Schema::create('sengketa', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'pengiriman_id');
            $t->enum('status', StatusSengketa::nilai())->default(StatusSengketa::Terbuka->value);
            $t->enum('keputusan', KeputusanSengketa::nilai())->nullable();
            $t->string('catatan', 1000)->nullable();
            $t->timestamp('diputuskan_pada')->nullable();
            Skema::waktu($t);
            $t->index('status');
            $t->foreign('pengiriman_id')->references('id')->on('pengiriman')->restrictOnDelete();
        });
        Skema::periksa('sengketa', 'sengketa_diputuskan_lengkap',
            "`status` <> 'diputuskan' OR (`keputusan` IS NOT NULL AND `diputuskan_pada` IS NOT NULL)");

        // Kontrak 1.7: permintaan ulang dengan kunci dan endpoint yang sama mengembalikan hasil pertama.
        Schema::create('kunci_idempoten', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukan($t, 'pengguna_id');
            $t->string('kunci', 100);
            $t->string('endpoint', 191);
            $t->unsignedSmallInteger('status_http')->nullable();
            $t->json('respons')->nullable();
            Skema::waktu($t);
            $t->unique(['pengguna_id', 'endpoint', 'kunci']);
            $t->foreign('pengguna_id')->references('id')->on('pengguna')->cascadeOnDelete();
        });

        // Kunci asing yang tertunda karena urutan pembuatan tabel.
        Schema::table('siklus_tanam', fn (Blueprint $t) => $t->foreign('alokasi_pesanan_id')->references('id')->on('alokasi_pesanan')->restrictOnDelete());
        Schema::table('catatan_petani', fn (Blueprint $t) => $t->foreign('pengiriman_id')->references('id')->on('pengiriman')->restrictOnDelete());
    }

    public function down(): void
    {
        Schema::table('catatan_petani', fn (Blueprint $t) => $t->dropForeign(['pengiriman_id']));
        Schema::table('siklus_tanam', fn (Blueprint $t) => $t->dropForeign(['alokasi_pesanan_id']));
        foreach (['kunci_idempoten', 'sengketa', 'rating', 'pembayaran', 'pengiriman', 'alokasi_pesanan', 'pesanan'] as $tabel) {
            Schema::dropIfExists($tabel);
        }
    }
};
