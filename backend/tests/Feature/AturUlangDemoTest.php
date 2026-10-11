<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
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
