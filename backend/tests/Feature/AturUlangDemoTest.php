<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/* Perintah demo:atur-ulang (D-47, D-57). */

it('mengembalikan data contoh dengan waktu relatif saat ini; perubahan demo dan sesi hilang', function () {
    DataContohSeeder::isi(CarbonImmutable::parse('2026-10-01 01:00:00', 'UTC'));
    DB::table('pengguna')->where('id', 'petani-arif')->update(['nama' => 'Diubah saat demo']);
    DB::table('sessions')->insert(['id' => 'sesi-uji', 'user_id' => 'petani-arif', 'payload' => '', 'last_activity' => 0]);
    DB::table('kunci_idempoten')->insert(['pengguna_id' => 'pembeli-imas', 'kunci' => 'k', 'endpoint' => 'e']);

    $this->travelTo(CarbonImmutable::parse('2026-10-15 03:00:00', 'UTC'));
    $this->artisan('demo:atur-ulang')->expectsOutput('Data demo sudah dikembalikan.')->assertSuccessful();

    expect(DB::table('pengguna')->where('id', 'petani-arif')->value('nama'))->toBe('Arif Setiawan')
        ->and(DB::table('sessions')->count())->toBe(0)
        ->and(DB::table('kunci_idempoten')->count())->toBe(0)
        ->and(DB::table('pengiriman')->where('id', 'kiriman-imas-arif-3')->value('dikirim_pada'))->toBe('2026-10-15 02:00:00')
        ->and(DB::table('pengguna')->count())->toBe(count(DataContohSeeder::bacaBerkas('pengguna')['pengguna']));
});

it('ditolak di luar lingkungan lokal', function () {
    app()->detectEnvironment(fn () => 'production');
    $this->artisan('demo:atur-ulang')->assertFailed();
});

it('menghapus pengguna yang mendaftar setelah seeder dan mengosongkan batas laju OTP ([AG-11])', function () {
    DataContohSeeder::isi(CarbonImmutable::now());
    $this->withHeaders(['Origin' => 'http://localhost:5173', 'Referer' => 'http://localhost:5173/']);
    $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '0857 0000 1001'])->assertOk();
    $kode = Cache::get('otp-log:+6285700001001');
    $this->postJson('/api/v1/auth/otp/verifikasi', ['nomor_hp' => '0857 0000 1001', 'kode' => $kode, 'setuju_privasi' => true])->assertOk();
    $this->putJson('/api/v1/akun/peran', ['peran' => 'petani', 'nama' => 'Rina', 'wilayah_id' => '32.17.01.2003'])->assertOk();
    $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '0857 0000 1001'])->assertStatus(429);
    foreach (range(1, 30) as $i) {
        $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '0857 0000 '.str_pad((string) $i, 4, '0', STR_PAD_LEFT)]);
    }
    $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '0857 0000 2001'])->assertStatus(429);

    $this->artisan('demo:atur-ulang')->assertSuccessful();

    expect(DB::table('pengguna')->where('nomor_hp', '+6285700001001')->exists())->toBeFalse()
        ->and(DB::table('kode_otp')->count())->toBe(0);
    // Nomor yang sama bisa langsung dipakai lagi: jeda 60 detik dan throttle per IP kosong.
    $this->postJson('/api/v1/auth/otp/kirim', ['nomor_hp' => '0857 0000 1001'])->assertOk();
});
