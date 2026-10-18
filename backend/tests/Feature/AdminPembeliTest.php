<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\DB;

/* Verifikasi pembeli oleh admin (kontrak 3.10, P0-02, [AG-11]). */

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
});

function masukSebagaiAdminUji(string $id): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $id])->assertOk();
    app('auth')->forgetGuards();
}

it('admin melihat pembeli menunggu, menolak tanpa alasan ditolak, lalu memverifikasi; pembeli bisa memasang pesanan', function () {
    $menunggu = DB::table('profil_pembeli')->where('status_verifikasi', 'menunggu')->value('pengguna_id');
    masukSebagaiAdminUji('admin-tani');
    $daftar = $this->getJson('/api/v1/admin/pembeli?status=menunggu')->assertOk()->json('data');
    expect(array_column($daftar, 'pengguna_id'))->toBe([$menunggu])
        ->and($daftar[0])->toHaveKeys(['nama', 'nomor_hp', 'nama_usaha', 'status_verifikasi'])->not->toHaveKey('dibuat_pada');

    $this->postJson("/api/v1/admin/pembeli/{$menunggu}/verifikasi", ['keputusan' => 'ditolak'])
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['alasan']]]);
    $this->postJson("/api/v1/admin/pembeli/{$menunggu}/verifikasi", ['keputusan' => 'entah'])->assertStatus(422);
    $this->postJson('/api/v1/admin/pembeli/tidak-ada/verifikasi', ['keputusan' => 'terverifikasi'])->assertStatus(404);
    $this->postJson("/api/v1/admin/pembeli/{$menunggu}/verifikasi", ['keputusan' => 'terverifikasi'])
        ->assertOk()->assertJsonPath('data.status_verifikasi', 'terverifikasi')->assertJsonPath('data.alasan_ditolak', null);
    $this->getJson('/api/v1/admin/pembeli?status=menunggu')->assertOk()->assertJsonCount(0, 'data');

    masukSebagaiAdminUji($menunggu);
    $this->postJson('/api/v1/pembeli/pesanan', ['jenis' => 'rutin', 'komoditas_id' => 'sawi', 'jumlah_per_kiriman_kg' => 5, 'frekuensi_hari' => 7,
        'durasi_hari' => 28, 'tanggal_mulai' => '2026-11-05', 'harga_per_kg' => 5000, 'standar_kualitas' => [], 'wilayah_id' => '33.10.16.2013', 'alamat_antar' => 'Jl. A'])
        ->assertOk();
});

it('menolak dengan alasan menyimpan alasannya', function () {
    $menunggu = DB::table('profil_pembeli')->where('status_verifikasi', 'menunggu')->value('pengguna_id');
    masukSebagaiAdminUji('admin-tani');
    $this->postJson("/api/v1/admin/pembeli/{$menunggu}/verifikasi", ['keputusan' => 'ditolak', 'alasan' => ' Foto tempat usaha buram '])
        ->assertOk()->assertJsonPath('data.status_verifikasi', 'ditolak')->assertJsonPath('data.alasan_ditolak', 'Foto tempat usaha buram');
});

it('hanya admin: peran lain 403, tanpa sesi 401', function () {
    $this->getJson('/api/v1/admin/pembeli')->assertStatus(401);
    foreach (['petani-arif', 'pembeli-ratna', 'mentor-rahmat'] as $id) {
        masukSebagaiAdminUji($id);
        $this->getJson('/api/v1/admin/pembeli')->assertStatus(403)->assertJsonPath('galat.kode', 'TIDAK_DIIZINKAN');
        $this->postJson('/api/v1/admin/pembeli/pembeli-baru/verifikasi', ['keputusan' => 'terverifikasi'])->assertStatus(403);
    }
});
