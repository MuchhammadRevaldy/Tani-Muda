<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
});

it('mengembalikan 501 jika sakelar FITUR_LEVEL mati', function () {
    config(['fitur.level' => false]);
    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'petani-arif'])->assertOk();

    $this->getJson('/api/v1/akun/level')
        ->assertStatus(501);
});

it('mengembalikan informasi level dan lencana pengguna saat aktif', function () {
    config(['fitur.level' => true]);
    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'petani-arif'])->assertOk();

    $res = $this->getJson('/api/v1/akun/level')
        ->assertOk()
        ->json('data');

    expect($res)->toHaveKeys([
        'poin',
        'level',
        'ikon',
        'level_berikutnya',
        'poin_ke_berikutnya',
        'persen_kemajuan',
        'lencana',
        'lencana_terkunci',
    ]);

    expect($res['poin'])->toBeGreaterThanOrEqual(0);
    // Petani Arif memiliki siklus tanam, sehingga harus meraih lencana tanam-pertama
    $kodeLencana = array_column($res['lencana'], 'kode');
    expect($kodeLencana)->toContain('tanam-pertama');
});
