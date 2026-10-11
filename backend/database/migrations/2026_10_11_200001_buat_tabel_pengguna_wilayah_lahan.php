<?php

use App\Enums\JenisCatatan;
use App\Enums\JenisLahan;
use App\Enums\JenisUsaha;
use App\Enums\Peran;
use App\Enums\StatusAkun;
use App\Enums\StatusVerifikasi;
use App\Support\Skema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * T5.04: pengguna, wilayah, lahan, kelompok tani, kode OTP, konfigurasi (kontrak-api.md 2.1–2.3,
 * 2.6, 2.12). Tabel `users` dan `password_reset_tokens` bawaan Laravel dihapus: tidak ada kata
 * sandi maupun nama pengguna (D-04). ID pengguna berupa string, jadi kolom pemilik sesi dan token
 * ikut menjadi string.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::table('sessions', fn (Blueprint $t) => Skema::rujukan($t, 'user_id')->nullable()->change());
        Schema::table('personal_access_tokens', fn (Blueprint $t) => Skema::rujukan($t, 'tokenable_id')->change());

        Schema::create('wilayah', function (Blueprint $t) {
            // Kode Kemendagri PP.KK.CC.DDDD (D-27).
            Skema::idWilayah($t);
            $t->string('desa');
            $t->string('kecamatan');
            $t->string('kabupaten');
            $t->string('provinsi');
            // Titik tengah desa, dasar jarak (D-06). Kosong untuk desa di luar pilot: desa itu belum
            // bisa dipilih sebagai desa petani atau titik antar (D-56).
            $t->decimal('lintang', 9, 6)->nullable();
            $t->decimal('bujur', 9, 6)->nullable();
            // Titik tengah hasil perkiraan (shared/wilayah/titik-tengah.json, D-54); tidak dikirim ke klien.
            $t->boolean('koordinat_perkiraan')->default(false);
            // Kode sudah dicocokkan dengan data resmi Kemendagri (D-36); tidak dikirim ke klien.
            $t->boolean('kode_terverifikasi')->default(false);
            Skema::waktu($t);
            $t->index(['lintang', 'bujur']);
        });

        Schema::create('pengguna', function (Blueprint $t) {
            Skema::id($t);
            $t->string('nomor_hp', 16)->unique();
            $t->string('nama')->nullable();
            $t->enum('peran', Peran::nilai())->nullable();
            Skema::rujukanWilayah($t, 'wilayah_id')->nullable();
            $t->string('foto_profil')->nullable();
            $t->enum('status_akun', StatusAkun::nilai())->default(StatusAkun::Aktif->value);
            $t->string('zona_waktu', 64)->default('Asia/Jakarta');
            $t->boolean('terdaftar_kelompok_tani')->default(false);
            $t->timestamp('setuju_privasi_pada')->nullable();
            $t->string('versi_privasi', 32)->nullable();
            Skema::waktu($t);
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->restrictOnDelete();
            $t->index('peran');
        });

        Schema::create('profil_pembeli', function (Blueprint $t) {
            Skema::id($t, 'pengguna_id');
            $t->string('nama_usaha');
            $t->enum('jenis_usaha', JenisUsaha::nilai());
            $t->string('alamat', 500);
            Skema::rujukanWilayah($t, 'wilayah_id');
            $t->string('foto_tempat_usaha')->nullable();
            $t->enum('status_verifikasi', StatusVerifikasi::nilai())->default(StatusVerifikasi::Menunggu->value);
            $t->string('alasan_ditolak', 500)->nullable();
            Skema::waktu($t);
            $t->foreign('pengguna_id')->references('id')->on('pengguna')->cascadeOnDelete();
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->restrictOnDelete();
            $t->index('status_verifikasi');
        });
        Skema::periksa('profil_pembeli', 'profil_pembeli_alasan_wajib_bila_ditolak',
            "`status_verifikasi` <> 'ditolak' OR `alasan_ditolak` IS NOT NULL");

        Schema::create('catatan_petani', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'petani_id');
            $t->enum('jenis', JenisCatatan::nilai());
            // Kunci asing ke `pengiriman` dipasang di migrasi pesanan (tabelnya dibuat belakangan).
            Skema::rujukan($t, 'pengiriman_id')->nullable();
            $t->text('isi');
            Skema::waktu($t);
            $t->foreign('petani_id')->references('id')->on('pengguna')->restrictOnDelete();
        });

        Schema::create('lahan', function (Blueprint $t) {
            Skema::id($t);
            Skema::rujukan($t, 'petani_id');
            $t->string('nama');
            $t->enum('jenis_lahan', JenisLahan::nilai());
            Skema::jumlah($t, 'luas_m2');
            $t->string('satuan_asli', 16);
            Skema::jumlah($t, 'nilai_asli');
            Skema::rujukanWilayah($t, 'wilayah_id');
            // Titik lahan hanya untuk pemilik dan admin (D-06); disaring di API Resource.
            $t->decimal('lintang', 9, 6)->nullable();
            $t->decimal('bujur', 9, 6)->nullable();
            $t->unsignedInteger('kapasitas_lubang')->nullable();
            Skema::waktu($t);
            $t->foreign('petani_id')->references('id')->on('pengguna')->cascadeOnDelete();
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->restrictOnDelete();
        });
        Skema::periksa('lahan', 'lahan_luas_positif', '`luas_m2` > 0 AND `nilai_asli` > 0');
        Skema::periksa('lahan', 'lahan_hidroponik_wajib_lubang',
            "`jenis_lahan` <> 'hidroponik' OR (`kapasitas_lubang` IS NOT NULL AND `kapasitas_lubang` > 0)");

        // Belum ada endpoint sampai P1 (D-06).
        Schema::create('kelompok_tani', function (Blueprint $t) {
            Skema::id($t);
            $t->string('nama');
            Skema::rujukanWilayah($t, 'wilayah_id');
            Skema::rujukan($t, 'ketua_id')->nullable();
            Skema::waktu($t);
            $t->foreign('wilayah_id')->references('id')->on('wilayah')->restrictOnDelete();
            $t->foreign('ketua_id')->references('id')->on('pengguna')->nullOnDelete();
        });

        Schema::create('anggota_kelompok_tani', function (Blueprint $t) {
            $t->id('nomor');
            Skema::rujukan($t, 'kelompok_id');
            Skema::rujukan($t, 'petani_id');
            $t->timestamp('bergabung_pada')->useCurrent();
            $t->unique(['kelompok_id', 'petani_id']);
            $t->foreign('kelompok_id')->references('id')->on('kelompok_tani')->cascadeOnDelete();
            $t->foreign('petani_id')->references('id')->on('pengguna')->cascadeOnDelete();
        });

        // Kode OTP hanya disimpan sebagai hash HMAC (arsitektur-backend.md bagian 5).
        Schema::create('kode_otp', function (Blueprint $t) {
            $t->id('nomor');
            $t->string('nomor_hp', 16)->index();
            $t->char('hash_kode', 64);
            $t->timestamp('kedaluwarsa_pada')->nullable();
            $t->unsignedTinyInteger('percobaan')->default(0);
            $t->timestamp('dipakai_pada')->nullable();
            $t->timestamp('dibatalkan_pada')->nullable();
            Skema::waktu($t);
        });

        // Konfigurasi bisnis (D-28): satu baris per kunci, nilai berupa JSON.
        Schema::create('konfigurasi', function (Blueprint $t) {
            $t->string('kunci', 64)->primary();
            $t->json('nilai');
            $t->string('keterangan', 500)->nullable();
            Skema::waktu($t);
        });
    }

    public function down(): void
    {
        foreach (['konfigurasi', 'kode_otp', 'anggota_kelompok_tani', 'kelompok_tani', 'lahan', 'catatan_petani', 'profil_pembeli', 'pengguna', 'wilayah'] as $tabel) {
            Schema::dropIfExists($tabel);
        }
        Schema::table('personal_access_tokens', fn (Blueprint $t) => $t->unsignedBigInteger('tokenable_id')->change());
        Schema::table('sessions', fn (Blueprint $t) => $t->unsignedBigInteger('user_id')->nullable()->change());
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email')->unique();
            $t->timestamp('email_verified_at')->nullable();
            $t->string('password');
            $t->rememberToken();
            $t->timestamps();
        });
        Schema::create('password_reset_tokens', function (Blueprint $t) {
            $t->string('email')->primary();
            $t->string('token');
            $t->timestamp('created_at')->nullable();
        });
    }
};
