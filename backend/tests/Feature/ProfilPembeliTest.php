<?php

use App\Domain\Otp\PengirimOtpLog;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/* Pembeli mengubah profil dan nomor HP sendiri (PATCH /akun, ganti nomor; [AG-23]). */

beforeEach(function () {
    Storage::fake('local');
    DataContohSeeder::isi(CarbonImmutable::now());
    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'pembeli-ratna'])->assertOk();
    app('auth')->forgetGuards();
});

it('pembeli mengubah nama dan foto profil', function () {
    $this->patchJson('/api/v1/akun', ['nama' => 'Ratna Kusuma Dewi'])->assertOk()
        ->assertJsonPath('data.pengguna.nama', 'Ratna Kusuma Dewi')
        ->assertJsonPath('data.profil_pembeli.pengguna_id', 'pembeli-ratna');
    $berkas = $this->post('/api/v1/berkas', ['berkas' => UploadedFile::fake()->image('p.jpg')], ['Accept' => 'application/json'])
        ->assertOk()->json('data');
    $this->patchJson('/api/v1/akun', ['foto_profil' => $berkas['url']])->assertOk();
    expect(DB::table('pengguna')->where('id', 'pembeli-ratna')->value('foto_profil'))->toBe("berkas:{$berkas['id']}");
});

it('pembeli mengganti nomor HP dengan kode yang dikirim ke nomor baru', function () {
    $this->postJson('/api/v1/akun/nomor-hp/otp', ['nomor_hp' => '0857 3333 4444'])->assertOk()
        ->assertJsonPath('data.nomor_hp', '+6285733334444');
    $kode = (string) PengirimOtpLog::kodeTerakhir('+6285733334444');
    $this->putJson('/api/v1/akun/nomor-hp', ['nomor_hp' => '085733334444', 'kode' => $kode])->assertOk()
        ->assertJsonPath('data.pengguna.nomor_hp', '+6285733334444');
    expect(DB::table('pengguna')->where('id', 'pembeli-ratna')->value('nomor_hp'))->toBe('+6285733334444');
});
