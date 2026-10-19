<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\DB;

/* Panel admin, petani: daftar, detail, catatan, status (kontrak 3.10, D-03, D-13, D-46, D-47) [AG-51]. */

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
});

function masukSebagaiAdminPetani(string $id): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $id])->assertOk();
    app('auth')->forgetGuards();
}

it('daftar petani: tanpa nomor HP dan titik lahan, terurut catatan lalu nama, bisa dicari dan berhalaman', function () {
    masukSebagaiAdminPetani('admin-tani');
    $r = $this->getJson('/api/v1/admin/petani')->assertOk();
    $data = $r->json('data');
    expect($data)->not->toBeEmpty()
        ->and(array_keys($data[0]))->toEqualCanonicalizing(['id', 'nama', 'desa', 'status_akun', 'jumlah_catatan', 'siklus_aktif'])
        ->and(json_encode($data))->not->toContain('nomor_hp')->not->toContain('lintang')->not->toContain('bujur');
    // Budi punya catatan, jadi paling atas; sisanya urut nama.
    expect($data[0]['id'])->toBe('petani-budi')->and($data[0]['jumlah_catatan'])->toBe(1);
    $sisa = array_column(array_slice($data, 1), 'nama');
    $urut = $sisa;
    sort($urut);
    expect($sisa)->toBe($urut);
    $arif = collect($data)->firstWhere('id', 'petani-arif');
    expect($arif['siklus_aktif'])->toBeGreaterThan(0)
        ->and($arif['desa'])->toBe(DB::table('wilayah')->where('id', '33.10.16.2005')->value('desa'));

    $this->getJson('/api/v1/admin/petani?cari=ARIF')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', 'petani-arif');
    $this->getJson('/api/v1/admin/petani?cari='.urlencode(strtolower($arif['desa'])))->assertOk()
        ->assertJsonPath('data.0.desa', $arif['desa']);
    $this->getJson('/api/v1/admin/petani?per_halaman=2&halaman=2')->assertOk()->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.halaman', 2)->assertJsonPath('meta.total', count($data));
});

it('detail petani: pengguna dan catatannya; bukan petani atau tidak ada → 404', function () {
    masukSebagaiAdminPetani('admin-tani');
    $this->getJson('/api/v1/admin/petani/petani-budi')->assertOk()
        ->assertJsonPath('data.pengguna.id', 'petani-budi')
        ->assertJsonPath('data.pengguna.status_akun', 'dinonaktifkan_sementara')
        ->assertJsonCount(1, 'data.catatan')
        ->assertJsonPath('data.catatan.0.jenis', 'tidak_memberi_kabar');
    $this->getJson('/api/v1/admin/petani/pembeli-ratna')->assertStatus(404)->assertJsonPath('galat.kode', 'TIDAK_DITEMUKAN');
    $this->getJson('/api/v1/admin/petani/tidak-ada')->assertStatus(404);
});

it('tulis catatan: hanya dua jenis, isi wajib, pengiriman harus ada; catatan terlihat petani', function () {
    masukSebagaiAdminPetani('admin-tani');
    $this->postJson('/api/v1/admin/petani/petani-arif/catatan', ['jenis' => 'teguran', 'isi' => 'x'])
        ->assertStatus(422)->assertJsonPath('galat.rincian.jenis', fn ($v) => $v !== null);
    $this->postJson('/api/v1/admin/petani/petani-arif/catatan', ['jenis' => 'lainnya', 'isi' => '   '])
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['isi']]]);
    $this->postJson('/api/v1/admin/petani/petani-arif/catatan', ['jenis' => 'lainnya', 'isi' => str_repeat('a', 1001)])
        ->assertStatus(422);
    $this->postJson('/api/v1/admin/petani/petani-arif/catatan', ['jenis' => 'lainnya', 'isi' => 'Halo', 'pengiriman_id' => 'tidak-ada'])
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['pengiriman_id']]]);
    $this->postJson('/api/v1/admin/petani/pembeli-ratna/catatan', ['jenis' => 'lainnya', 'isi' => 'Halo'])->assertStatus(404);

    $c = $this->postJson('/api/v1/admin/petani/petani-arif/catatan', ['jenis' => 'tidak_memberi_kabar', 'isi' => ' Belum mengabari kiriman ke-3 '])
        ->assertOk()->assertJsonPath('data.petani_id', 'petani-arif')->assertJsonPath('data.isi', 'Belum mengabari kiriman ke-3')
        ->assertJsonPath('data.pengiriman_id', null)->json('data');
    expect($c)->toHaveKeys(['id', 'jenis', 'dibuat_pada']);
    expect(DB::table('catatan_petani')->where('petani_id', 'petani-arif')->count())->toBe(1);
    $this->getJson('/api/v1/admin/petani?cari=arif')->assertJsonPath('data.0.jumlah_catatan', 1);

    masukSebagaiAdminPetani('petani-arif');
    $this->getJson('/api/v1/akun/catatan')->assertOk()->assertJsonPath('data.0.id', $c['id']);
});

it('ubah status: hanya petani, nilai valid, idempoten; petani nonaktif ditolak mengambil pesanan (AKUN_NONAKTIF)', function () {
    masukSebagaiAdminPetani('admin-tani');
    $this->postJson('/api/v1/admin/petani/petani-arif/status', ['status_akun' => 'diblokir'])
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['status_akun']]]);
    $this->postJson('/api/v1/admin/petani/pembeli-ratna/status', ['status_akun' => 'dinonaktifkan_sementara'])->assertStatus(404);
    expect(DB::table('pengguna')->where('id', 'pembeli-ratna')->value('status_akun'))->toBe('aktif');

    foreach ([1, 2] as $_) {
        $this->postJson('/api/v1/admin/petani/petani-arif/status', ['status_akun' => 'dinonaktifkan_sementara'])
            ->assertOk()->assertJsonPath('data.pengguna.status_akun', 'dinonaktifkan_sementara');
    }
    expect(DB::table('pengguna')->where('id', 'petani-arif')->value('status_akun'))->toBe('dinonaktifkan_sementara');

    masukSebagaiAdminPetani('petani-arif');
    $this->postJson('/api/v1/pesanan/pesanan-kafe-bayam/ambil', ['kunci_idempoten' => 'nonaktif-1', 'jumlah_kg' => 4, 'lahan_id' => 'lahan-arif-kebun'])
        ->assertStatus(403)->assertJsonPath('galat.kode', 'AKUN_NONAKTIF');
    expect(DB::table('alokasi_pesanan')->where('pesanan_id', 'pesanan-kafe-bayam')->where('petani_id', 'petani-arif')->count())->toBe(0);

    masukSebagaiAdminPetani('admin-tani');
    $this->postJson('/api/v1/admin/petani/petani-arif/status', ['status_akun' => 'aktif'])->assertOk()->assertJsonPath('data.pengguna.status_akun', 'aktif');
    masukSebagaiAdminPetani('petani-arif');
    $this->postJson('/api/v1/pesanan/pesanan-kafe-bayam/ambil', ['kunci_idempoten' => 'aktif-1', 'jumlah_kg' => 4, 'lahan_id' => 'lahan-arif-kebun'])->assertOk();
});

it('hanya admin: peran lain 403, tanpa sesi 401', function () {
    $this->getJson('/api/v1/admin/petani')->assertStatus(401);
    foreach (['petani-arif', 'pembeli-ratna', 'mentor-rahmat'] as $id) {
        masukSebagaiAdminPetani($id);
        $this->getJson('/api/v1/admin/petani')->assertStatus(403)->assertJsonPath('galat.kode', 'TIDAK_DIIZINKAN');
        $this->getJson('/api/v1/admin/petani/petani-budi')->assertStatus(403);
        $this->postJson('/api/v1/admin/petani/petani-budi/catatan', ['jenis' => 'lainnya', 'isi' => 'x'])->assertStatus(403);
        $this->postJson('/api/v1/admin/petani/petani-budi/status', ['status_akun' => 'aktif'])->assertStatus(403);
    }
    expect(DB::table('pengguna')->where('id', 'petani-budi')->value('status_akun'))->toBe('dinonaktifkan_sementara');
});
