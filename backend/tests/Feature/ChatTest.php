<?php

use App\Enums\JenisPercakapan;
use App\Enums\Peran;
use App\Enums\StatusAkun;
use App\Models\Pengguna;
use App\Models\Percakapan;
use App\Models\Pesan;

beforeEach(function () {
    config(['fitur.chat' => true]);
});

it('petani dan pembeli dapat membuka percakapan dan mengirim pesan', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990101',
        'nama' => 'Petani Chat 1',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990102',
        'nama' => 'Pembeli Chat 1',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    // Pembeli membuka percakapan dari titik peta
    $resBuka = $this->actingAs($pembeli)
        ->postJson('/api/v1/percakapan', [
            'lawan_bicara_id' => $petani->id,
            'jenis' => 'peta',
            'rujukan_id' => $petani->id,
        ])
        ->assertOk()
        ->json('data');

    expect($resBuka['id'])->toBeString()
        ->and($resBuka['jenis'])->toBe('peta')
        ->and($resBuka['lawan_bicara']['id'])->toBe($petani->id);

    $percakapanId = $resBuka['id'];

    // Pembeli mengirim pesan (dengan kunci idempoten)
    $resPesan1 = $this->actingAs($pembeli)
        ->postJson("/api/v1/percakapan/{$percakapanId}/pesan", [
            'isi' => 'Halo Pak Tani, apakah stok selada masih segar?',
            'kunci_idempoten' => 'kunci-uji-001',
        ])
        ->assertOk()
        ->json('data');

    expect($resPesan1['isi'])->toBe('Halo Pak Tani, apakah stok selada masih segar?')
        ->and($resPesan1['pengirim_id'])->toBe($pembeli->id)
        ->and($resPesan1['dibaca_pada'])->toBeNull();

    // Idempoten: kirim ulang dengan kunci yang sama mengembalikan baris yang sama
    $resPesanUlang = $this->actingAs($pembeli)
        ->postJson("/api/v1/percakapan/{$percakapanId}/pesan", [
            'isi' => 'Halo Pak Tani, apakah stok selada masih segar?',
            'kunci_idempoten' => 'kunci-uji-001',
        ])
        ->assertOk()
        ->json('data');

    expect($resPesanUlang['id'])->toBe($resPesan1['id']);

    // Petani mengecek lencana belum dibaca
    $this->actingAs($petani)
        ->getJson('/api/v1/percakapan/lencana')
        ->assertOk()
        ->assertJsonPath('data.belum_dibaca', 1);

    // Petani membaca riwayat pesan
    $this->actingAs($petani)
        ->getJson("/api/v1/percakapan/{$percakapanId}/pesan")
        ->assertOk()
        ->assertJsonCount(1, 'data');

    // Petani menandai pesan sudah dibaca
    $this->actingAs($petani)
        ->postJson("/api/v1/percakapan/{$percakapanId}/dibaca")
        ->assertOk()
        ->assertJsonPath('data.status', 'ok')
        ->assertJsonPath('data.jumlah_dibaca', 1);

    // Lencana petani sekarang 0
    $this->actingAs($petani)
        ->getJson('/api/v1/percakapan/lencana')
        ->assertOk()
        ->assertJsonPath('data.belum_dibaca', 0);

    // Petani membalas pesan
    $this->actingAs($petani)
        ->postJson("/api/v1/percakapan/{$percakapanId}/pesan", [
            'isi' => 'Iya betul, baru dipanen pagi tadi!',
        ])
        ->assertOk();

    // Pembeli mengecek polling dengan parameter `setelah`
    $this->actingAs($pembeli)
        ->getJson("/api/v1/percakapan/{$percakapanId}/pesan?setelah=".$resPesan1['id'])
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.isi', 'Iya betul, baru dipanen pagi tadi!');
});

it('menolak pengiriman pesan yang kosong atau lebih dari 1000 karakter', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990103',
        'nama' => 'Petani Chat Validasi',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990104',
        'nama' => 'Pembeli Chat Validasi',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $percakapan = new Percakapan;
    $percakapan->forceFill([
        'petani_id' => $petani->id,
        'pembeli_id' => $pembeli->id,
        'jenis' => JenisPercakapan::Peta,
    ]);
    $percakapan->save();

    // Kosong -> 422
    $this->actingAs($petani)
        ->postJson("/api/v1/percakapan/{$percakapan->id}/pesan", ['isi' => '   '])
        ->assertStatus(422);

    // > 1000 karakter -> 422
    $this->actingAs($petani)
        ->postJson("/api/v1/percakapan/{$percakapan->id}/pesan", ['isi' => str_repeat('a', 1001)])
        ->assertStatus(422);
});

it('tes akses silang percakapan: pengguna lain 404, peran salah 403, tanpa sesi 401', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990105',
        'nama' => 'Petani Peserta',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990106',
        'nama' => 'Pembeli Peserta',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $orangLain = Pengguna::create([
        'nomor_hp' => '+6281299990107',
        'nama' => 'Pengguna Penasaran',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $percakapan = new Percakapan;
    $percakapan->forceFill([
        'petani_id' => $petani->id,
        'pembeli_id' => $pembeli->id,
        'jenis' => JenisPercakapan::Peta,
    ]);
    $percakapan->save();

    // 1. Tanpa sesi -> 401
    $this->getJson("/api/v1/percakapan/{$percakapan->id}/pesan")
        ->assertStatus(401);

    // 2. Pemilik / Peserta -> 200
    $this->actingAs($petani)
        ->getJson("/api/v1/percakapan/{$percakapan->id}/pesan")
        ->assertOk();

    $this->actingAs($pembeli)
        ->getJson("/api/v1/percakapan/{$percakapan->id}/pesan")
        ->assertOk();

    // 3. Pengguna lain -> 404 TIDAK_DITEMUKAN (kebijakan privasi)
    $this->actingAs($orangLain)
        ->getJson("/api/v1/percakapan/{$percakapan->id}/pesan")
        ->assertStatus(404)
        ->assertJsonPath('galat.kode', 'TIDAK_DITEMUKAN');

    $this->actingAs($orangLain)
        ->postJson("/api/v1/percakapan/{$percakapan->id}/pesan", ['isi' => 'Intip'])
        ->assertStatus(404)
        ->assertJsonPath('galat.kode', 'TIDAK_DITEMUKAN');

    $this->actingAs($orangLain)
        ->postJson("/api/v1/percakapan/{$percakapan->id}/dibaca")
        ->assertStatus(404)
        ->assertJsonPath('galat.kode', 'TIDAK_DITEMUKAN');
});

it('mengembalikan 501 jika sakelar FITUR_CHAT mati', function () {
    config(['fitur.chat' => false]);

    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990108',
        'nama' => 'Petani Fitur Mati',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $this->actingAs($petani)
        ->getJson('/api/v1/percakapan')
        ->assertStatus(501)
        ->assertJsonPath('galat.kode', 'BELUM_TERSEDIA');
});
