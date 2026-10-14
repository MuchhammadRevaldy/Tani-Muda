<?php

use App\Enums\Peran;
use App\Enums\StatusAkun;
use App\Enums\StatusStok;
use App\Enums\StatusVerifikasi;
use App\Models\Komoditas;
use App\Models\Pengguna;
use App\Models\ProfilPembeli;
use App\Models\Stok;
use App\Models\Wilayah;
use Illuminate\Support\Facades\DB;

function ambilWilayahUji(): Wilayah
{
    $ada = Wilayah::find('32.17.01.2003');
    if ($ada) {
        return $ada;
    }

    $w = new Wilayah;
    $w->forceFill([
        'id' => '32.17.01.2003',
        'desa' => 'Cikahuripan',
        'kecamatan' => 'Lembang',
        'kabupaten' => 'Bandung Barat',
        'provinsi' => 'Jawa Barat',
        'lintang' => -6.8186,
        'bujur' => 107.6171,
    ]);
    $w->save();

    return $w;
}

function ambilKomoditasUji(): Komoditas
{
    $ada = Komoditas::find('selada');
    if ($ada) {
        return $ada;
    }

    $k = new Komoditas;
    $k->forceFill([
        'id' => 'selada',
        'nama' => 'Selada Keriting',
        'kategori' => 'sayuran_daun',
        'jenis_lahan_cocok' => ['bedengan', 'polybag'],
        'satuan_panen' => 'kg',
        'umur_panen_hari' => 30,
        'harga_jual_contoh' => 15000,
    ]);
    $k->save();

    return $k;
}

beforeEach(function () {
    config(['fitur.peta' => true]);
});

it('pembulatan 2 desimal dilakukan di server saat menyimpan lokasi akun', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990001',
        'nama' => 'Petani GPS Coba',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
        'tampil_di_peta' => false,
    ]);

    $this->actingAs($petani)
        ->putJson('/api/v1/akun/lokasi', [
            'tampil_di_peta' => true,
            'lintang' => -7.123456,
            'bujur' => 110.654321,
        ])
        ->assertOk()
        ->assertJsonPath('data.pengguna.tampil_di_peta', true)
        ->assertJsonPath('data.pengguna.lokasi_kira_lintang', -7.12)
        ->assertJsonPath('data.pengguna.lokasi_kira_bujur', 110.65);

    // Buktikan di basis data bahwa nilai tersimpan tepat 2 desimal, titik persis tidak tersimpan
    $db = DB::table('pengguna')->where('id', $petani->id)->first();
    expect((float) $db->lokasi_kira_lintang)->toBe(-7.12)
        ->and((float) $db->lokasi_kira_bujur)->toBe(110.65)
        ->and($db->tampil_di_peta)->toBe(1)
        ->and($db->lokasi_diperbarui_pada)->not->toBeNull();
});

it('menolak lokasi dengan lintang atau bujur di luar batas valid', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990002',
        'nama' => 'Petani Luar Batas',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $this->actingAs($petani)
        ->putJson('/api/v1/akun/lokasi', [
            'lintang' => 95.0,
            'bujur' => 110.0,
        ])
        ->assertStatus(422);
});

it('peta petani hanya bisa diakses oleh pembeli terverifikasi (403 jika belum)', function () {
    $wilayah = ambilWilayahUji();

    $pembeliBelum = Pengguna::create([
        'nomor_hp' => '+6281299990003',
        'nama' => 'Pembeli Menunggu',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    ProfilPembeli::create([
        'pengguna_id' => $pembeliBelum->id,
        'nama_usaha' => 'Katering Baru',
        'jenis_usaha' => 'katering',
        'alamat' => 'Jl. Mawar',
        'wilayah_id' => $wilayah->id,
        'status_verifikasi' => StatusVerifikasi::Menunggu,
    ]);

    // Belum terverifikasi -> 403 BELUM_TERVERIFIKASI
    $this->actingAs($pembeliBelum)
        ->getJson('/api/v1/peta/petani')
        ->assertStatus(403)
        ->assertJsonPath('galat.kode', 'BELUM_TERVERIFIKASI');

    // Verifikasi pembeli
    ProfilPembeli::where('pengguna_id', $pembeliBelum->id)->update([
        'status_verifikasi' => StatusVerifikasi::Terverifikasi,
    ]);

    $this->actingAs($pembeliBelum->fresh())
        ->getJson('/api/v1/peta/petani')
        ->assertOk();
});

it('peta petani menolak akses pengguna tanpa sesi (401) dan peran salah (403)', function () {
    // Tanpa sesi -> 401
    $this->getJson('/api/v1/peta/petani')
        ->assertStatus(401);

    // Peran petani -> 403
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990004',
        'nama' => 'Petani Bukan Pembeli',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $this->actingAs($petani)
        ->getJson('/api/v1/peta/petani')
        ->assertStatus(403)
        ->assertJsonPath('galat.kode', 'TIDAK_DIIZINKAN');
});

it('petani yang mematikan sakelar tampil_di_peta tidak muncul di peta pembeli', function () {
    $wilayah = ambilWilayahUji();
    $komoditas = ambilKomoditasUji();

    // Petani 1: tampil_di_peta = true, punya stok
    $petani1 = Pengguna::create([
        'nomor_hp' => '+6281299990005',
        'nama' => 'Petani Tampil',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
        'tampil_di_peta' => true,
        'lokasi_kira_lintang' => (float) $wilayah->lintang,
        'lokasi_kira_bujur' => (float) $wilayah->bujur,
    ]);

    Stok::create([
        'petani_id' => $petani1->id,
        'komoditas_id' => $komoditas->id,
        'jumlah_kg' => 20,
        'sisa_kg' => 20,
        'harga_per_kg' => 15000,
        'tanggal_panen' => '2026-10-14',
        'status' => StatusStok::Tersedia,
    ]);

    // Petani 2: tampil_di_peta = false, punya stok
    $petani2 = Pengguna::create([
        'nomor_hp' => '+6281299990006',
        'nama' => 'Petani Sembunyi',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
        'tampil_di_peta' => false,
        'lokasi_kira_lintang' => (float) $wilayah->lintang,
        'lokasi_kira_bujur' => (float) $wilayah->bujur,
    ]);

    Stok::create([
        'petani_id' => $petani2->id,
        'komoditas_id' => $komoditas->id,
        'jumlah_kg' => 30,
        'sisa_kg' => 30,
        'harga_per_kg' => 15000,
        'tanggal_panen' => '2026-10-14',
        'status' => StatusStok::Tersedia,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990007',
        'nama' => 'Pembeli Terverifikasi Cek',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    ProfilPembeli::create([
        'pengguna_id' => $pembeli->id,
        'nama_usaha' => 'Resto Hijau',
        'jenis_usaha' => 'restoran',
        'alamat' => 'Jl. Melati',
        'wilayah_id' => $wilayah->id,
        'status_verifikasi' => StatusVerifikasi::Terverifikasi,
    ]);

    $res = $this->actingAs($pembeli)
        ->getJson('/api/v1/peta/petani?lintang='.$wilayah->lintang.'&bujur='.$wilayah->bujur.'&radius_km=10')
        ->assertOk()
        ->json('data');

    $ids = array_column($res, 'id');
    expect($ids)->toContain($petani1->id)
        ->and($ids)->not->toContain($petani2->id);

    // Buktikan nomor HP tidak pernah bocor di respon (D-64)
    foreach ($res as $item) {
        expect($item)->not->toHaveKey('nomor_hp');
    }
});

it('petani tanpa stok tersedia dan tanpa pesanan tidak muncul di peta', function () {
    $wilayah = ambilWilayahUji();
    $komoditas = ambilKomoditasUji();

    // Petani dengan stok habis (sisa_kg = 0)
    $petaniHabis = Pengguna::create([
        'nomor_hp' => '+6281299990008',
        'nama' => 'Petani Stok Habis',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
        'tampil_di_peta' => true,
        'lokasi_kira_lintang' => (float) $wilayah->lintang,
        'lokasi_kira_bujur' => (float) $wilayah->bujur,
    ]);

    Stok::create([
        'petani_id' => $petaniHabis->id,
        'komoditas_id' => $komoditas->id,
        'jumlah_kg' => 10,
        'sisa_kg' => 0,
        'harga_per_kg' => 10000,
        'tanggal_panen' => '2026-10-14',
        'status' => StatusStok::Habis,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990009',
        'nama' => 'Pembeli Uji Stok Habis',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    ProfilPembeli::create([
        'pengguna_id' => $pembeli->id,
        'nama_usaha' => 'Warung Uji',
        'jenis_usaha' => 'warung',
        'alamat' => 'Jl. Anyelir',
        'wilayah_id' => $wilayah->id,
        'status_verifikasi' => StatusVerifikasi::Terverifikasi,
    ]);

    $res = $this->actingAs($pembeli)
        ->getJson('/api/v1/peta/petani?lintang='.$wilayah->lintang.'&bujur='.$wilayah->bujur.'&radius_km=10')
        ->assertOk()
        ->json('data');

    $ids = array_column($res, 'id');
    expect($ids)->not->toContain($petaniHabis->id);
});

it('mengembalikan 501 jika sakelar FITUR_PETA mati', function () {
    config(['fitur.peta' => false]);
    $wilayah = ambilWilayahUji();

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990010',
        'nama' => 'Pembeli Fitur Mati',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    ProfilPembeli::create([
        'pengguna_id' => $pembeli->id,
        'nama_usaha' => 'Katering Mati',
        'jenis_usaha' => 'katering',
        'alamat' => 'Jl. Dahlia',
        'wilayah_id' => $wilayah->id,
        'status_verifikasi' => StatusVerifikasi::Terverifikasi,
    ]);

    $this->actingAs($pembeli)
        ->getJson('/api/v1/peta/petani')
        ->assertStatus(501)
        ->assertJsonPath('galat.kode', 'BELUM_TERSEDIA');
});
