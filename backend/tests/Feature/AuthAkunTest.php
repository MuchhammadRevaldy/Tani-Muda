<?php

use App\Domain\Otp\PengirimOtpLog;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\DB;

/*
 * Masuk dengan OTP, akun, dan endpoint demo lokal (T5.09, kontrak 3.1 dan 3.13). Perilaku umum
 * juga diuji rangkaian kontrak frontend terhadap backend.
 */

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
});

/** Masuk lewat endpoint demo; guard dilupakan karena aplikasi tes dipakai ulang antarpermintaan. */
function masukDemo(string $penggunaId): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $penggunaId])->assertOk();
    app('auth')->forgetGuards();
}

function kirimOtp(string $nomor = '081200000001'): string
{
    test()->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => $nomor])->assertOk();

    return (string) PengirimOtpLog::kodeTerakhir('+62'.ltrim(substr($nomor, 1), '0'));
}

it('kirim OTP: nomor dinormalisasi, kode tidak pernah di respons, hanya hash yang disimpan', function () {
    $r = $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '0812 0000 0001'])->assertOk();
    expect($r->json('data'))->toBe(['nomor_hp' => '+6281200000001', 'kirim_ulang_dalam_detik' => 60, 'kedaluwarsa_dalam_detik' => 300]);
    $kode = PengirimOtpLog::kodeTerakhir('+6281200000001');
    expect($kode)->toMatch('/^\d{6}$/')
        ->and($r->getContent())->not->toContain($kode)
        ->and(DB::table('kode_otp')->value('hash_kode'))->not->toBe($kode)->toHaveLength(64);

    $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '0812 0000 0001'])
        ->assertStatus(429)->assertJsonPath('galat.kode', 'TERLALU_SERING');
    $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '021-123'])
        ->assertStatus(422)->assertJsonPath('galat.kode', 'NOMOR_HP_TIDAK_VALID')->assertJsonStructure(['galat' => ['rincian' => ['nomor_hp']]]);
});

it('verifikasi: pengguna lama masuk; kode salah ditolak; sesi terbuka dan bisa keluar', function () {
    $kode = kirimOtp();
    $salah = $kode === '000000' ? '111111' : '000000';
    $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '081200000001', 'kode' => $salah])
        ->assertStatus(422)->assertJsonPath('galat.kode', 'OTP_SALAH');
    $r = $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '081200000001', 'kode' => $kode])->assertOk();
    expect($r->json('data.pengguna_baru'))->toBeFalse()
        ->and($r->json('data.akun.pengguna'))->toMatchArray(['id' => 'petani-arif', 'peran' => 'petani', 'zona_waktu' => 'Asia/Jakarta'])
        ->and($r->json('data.akun.pengguna'))->not->toHaveKey('diperbarui_pada');

    $this->getJson('/api/v1/akun')->assertOk()->assertJsonPath('data.pengguna.id', 'petani-arif');
    $this->postJson('/api/v1/auth/keluar')->assertNoContent();
    $this->app['auth']->forgetGuards();
    $this->getJson('/api/v1/akun')->assertStatus(401)->assertJsonPath('galat.kode', 'BELUM_MASUK');
});

it('pengguna baru wajib setuju privasi; lima kode salah mengunci; kode kedaluwarsa setelah 5 menit', function () {
    $kode = kirimOtp('085700000009');
    $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '085700000009', 'kode' => $kode])
        ->assertStatus(422)->assertJsonPath('galat.rincian.setuju_privasi.0', 'Centang persetujuan kebijakan privasi dulu');
    $r = $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '085700000009', 'kode' => $kode, 'setuju_privasi' => true])->assertOk();
    expect($r->json('data.pengguna_baru'))->toBeTrue()
        ->and($r->json('data.akun.pengguna'))->toMatchArray(['peran' => null, 'versi_privasi' => 'draf-2026-10', 'status_akun' => 'aktif']);

    $this->travel(2)->minutes();
    $kode = kirimOtp('081200000002');
    $salah = $kode === '000000' ? '111111' : '000000';
    foreach (range(1, 4) as $i) {
        $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '081200000002', 'kode' => $salah])->assertJsonPath('galat.kode', 'OTP_SALAH');
    }
    $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '081200000002', 'kode' => $salah])->assertStatus(423)->assertJsonPath('galat.kode', 'OTP_TERKUNCI');
    $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '081200000002', 'kode' => $kode])->assertStatus(423);

    $this->travel(2)->minutes();
    $kode = kirimOtp('081200000003');
    $this->travel(301)->seconds();
    $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '081200000003', 'kode' => $kode])->assertJsonPath('galat.kode', 'OTP_KEDALUWARSA');
});

it('pilih peran: sekali saja; petani wajib desa yang tersedia di pilot (D-56); admin tidak bisa dipilih', function () {
    $kode = kirimOtp('085700000009');
    $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '085700000009', 'kode' => $kode, 'setuju_privasi' => true])->assertOk();

    $this->putJson('/api/v1/akun/peran', ['peran' => 'admin', 'nama' => 'X'])->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['peran']]]);
    $this->putJson('/api/v1/akun/peran', ['peran' => 'petani', 'nama' => 'Tani'])
        ->assertStatus(422)->assertJsonPath('galat.rincian.wilayah_id.0', 'Isi desa lahanmu dulu');
    $this->putJson('/api/v1/akun/peran', ['peran' => 'petani', 'nama' => 'Tani', 'wilayah_id' => '33.10.01.2012'])
        ->assertStatus(422)->assertJsonPath('galat.rincian.wilayah_id.0', 'Desa ini belum tersedia di pilot Tani Muda. Pilih desa lain');
    $this->putJson('/api/v1/akun/peran', ['peran' => 'petani', 'nama' => ' Tani ', 'wilayah_id' => '33.10.16.2013'])
        ->assertOk()->assertJsonPath('data.pengguna.nama', 'Tani')->assertJsonPath('data.pengguna.peran', 'petani');
    $this->putJson('/api/v1/akun/peran', ['peran' => 'pembeli', 'nama' => 'X'])->assertStatus(409)->assertJsonPath('galat.kode', 'STATUS_TIDAK_SESUAI');
});

it('ubah profil, catatan petani, profil pembeli, dan akses peran', function () {
    masukDemo('petani-arif');
    $this->patchJson('/api/v1/akun', ['wilayah_id' => '33.10.01.2012'])->assertStatus(422);
    $this->patchJson('/api/v1/akun', ['zona_waktu' => 'Mars/Olympus'])->assertStatus(422);
    $this->patchJson('/api/v1/akun', ['nama' => 'Arif S.', 'terdaftar_kelompok_tani' => true])
        ->assertOk()->assertJsonPath('data.pengguna.nama', 'Arif S.')->assertJsonPath('data.pengguna.terdaftar_kelompok_tani', true);
    $this->getJson('/api/v1/akun/catatan')->assertOk()->assertJsonCount(0, 'data');
    $this->putJson('/api/v1/akun/profil-pembeli', [])->assertStatus(403)->assertJsonPath('galat.kode', 'TIDAK_DIIZINKAN');

    masukDemo('pembeli-ratna');
    $this->patchJson('/api/v1/akun', ['wilayah_id' => '33.10.01.2012'])->assertOk();
    $this->getJson('/api/v1/akun/catatan')->assertStatus(403);
    $this->putJson('/api/v1/akun/profil-pembeli', ['nama_usaha' => 'Katering Baru', 'jenis_usaha' => 'katering', 'alamat' => 'Jl. A', 'wilayah_id' => '33.10.16.2013'])
        ->assertOk()->assertJsonPath('data.status_verifikasi', 'terverifikasi')->assertJsonPath('data.nama_usaha', 'Katering Baru');
});

it('endpoint demo lokal: daftar pengguna uji, masuk sebagai, kode OTP terakhir, atur ulang', function () {
    $daftar = $this->getJson('/api/v1/demo/pengguna')->assertOk()->json('data');
    expect($daftar[0])->toBe(['id' => 'petani-arif', 'nama' => 'Arif Setiawan', 'peran' => 'petani', 'keterangan' => 'Petani aktif dengan tiga siklus dan dua lahan']);

    $this->getJson('/api/v1/demo/kode-otp?nomor_hp=081200000001')->assertOk()->assertJsonPath('data.kode', null);
    $kode = kirimOtp();
    $this->getJson('/api/v1/demo/kode-otp?nomor_hp=0812-0000-0001')->assertJsonPath('data.kode', $kode);

    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'pembeli-imas'])->assertOk()->assertJsonPath('data.pengguna.peran', 'pembeli');
    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'tidak-ada'])->assertStatus(404);

    DB::table('pengguna')->where('id', 'petani-arif')->update(['nama' => 'Diubah']);
    $this->postJson('/api/v1/demo/atur-ulang')->assertNoContent();
    expect(DB::table('pengguna')->where('id', 'petani-arif')->value('nama'))->toBe('Arif Setiawan');
});
