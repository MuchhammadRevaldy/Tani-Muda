<?php

use App\Enums\JenisPercakapan;
use App\Enums\Peran;
use App\Enums\StatusAkun;
use App\Models\Pengguna;
use App\Models\Percakapan;
use App\Models\Pesan;
use Illuminate\Database\QueryException;

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

it('pembeli dan petani dapat memulai atau melanjutkan chat lewat nomor HP (jenis kontak)', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990201',
        'nama' => 'Petani Kontak 1',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990202',
        'nama' => 'Pembeli Kontak 1',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    // 1. Pembeli membuka chat lewat nomor petani dalam format lokal dengan strip
    $res = $this->actingAs($pembeli)
        ->postJson('/api/v1/percakapan/nomor', ['nomor_hp' => '0812-9999-0201'])
        ->assertOk()
        ->json('data');

    expect($res['jenis'])->toBe('kontak')
        ->and($res['rujukan_id'])->toBeNull()
        ->and($res['lawan_bicara']['nama'])->toBe('Petani Kontak 1')
        ->and($res['lawan_bicara']['peran'])->toBe('petani')
        ->and(array_key_exists('nomor_hp', $res['lawan_bicara']))->toBeFalse();

    $percakapanId = $res['id'];

    // 2. Petani membuka chat lewat nomor pembeli -> melanjutkan percakapan yang sama
    $res2 = $this->actingAs($petani)
        ->postJson('/api/v1/percakapan/nomor', ['nomor_hp' => '+6281299990202'])
        ->assertOk()
        ->json('data');

    expect($res2['id'])->toBe($percakapanId)
        ->and($res2['lawan_bicara']['nama'])->toBe('Pembeli Kontak 1')
        ->and(array_key_exists('nomor_hp', $res2['lawan_bicara']))->toBeFalse();
});

it('chat nomor ditolak dengan pesan seragam bila nomor tidak terdaftar, peran sama, atau diri sendiri', function () {
    $petani1 = Pengguna::create([
        'nomor_hp' => '+6281299990211',
        'nama' => 'Petani Satu',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $petani2 = Pengguna::create([
        'nomor_hp' => '+6281299990212',
        'nama' => 'Petani Dua',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    // A. Nomor tidak terdaftar
    $this->actingAs($petani1)
        ->postJson('/api/v1/percakapan/nomor', ['nomor_hp' => '0812-0000-9999'])
        ->assertStatus(422)
        ->assertJsonPath('galat.pesan', 'Nomor ini belum bisa dihubungi lewat Tani Muda');

    // B. Peran sama (petani ke petani)
    $this->actingAs($petani1)
        ->postJson('/api/v1/percakapan/nomor', ['nomor_hp' => '0812-9999-0212'])
        ->assertStatus(422)
        ->assertJsonPath('galat.pesan', 'Nomor ini belum bisa dihubungi lewat Tani Muda');

    // C. Diri sendiri
    $this->actingAs($petani1)
        ->postJson('/api/v1/percakapan/nomor', ['nomor_hp' => '0812-9999-0211'])
        ->assertStatus(422)
        ->assertJsonPath('galat.pesan', 'Nomor ini belum bisa dihubungi lewat Tani Muda');
});

it('chat nomor menegakkan batas laju 10 percobaan per jam (429)', function () {
    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990220',
        'nama' => 'Pembeli Laju',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    // 10 permintaan pertama (gagal validasi nomor tidak terdaftar) mengembalikan 422
    for ($i = 0; $i < 10; $i++) {
        $this->actingAs($pembeli)
            ->postJson('/api/v1/percakapan/nomor', ['nomor_hp' => "0812-0000-000{$i}"])
            ->assertStatus(422);
    }

    // Permintaan ke-11 terkena throttle 429
    $this->actingAs($pembeli)
        ->postJson('/api/v1/percakapan/nomor', ['nomor_hp' => '0812-0000-0010'])
        ->assertStatus(429);
});

it('pengguna.nomor_hp tetap unik di basis data dan terlindungi', function () {
    Pengguna::create([
        'nomor_hp' => '+6281299990230',
        'nama' => 'Akun Unik 1',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    expect(function () {
        Pengguna::create([
            'nomor_hp' => '+6281299990230',
            'nama' => 'Akun Duplikat',
            'peran' => Peran::Pembeli,
            'status_akun' => StatusAkun::Aktif,
        ]);
    })->toThrow(QueryException::class);
});

it('alur permintaan kontak: kirim permintaan, notifikasi/lencana, terima, dan mulai percakapan', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990301',
        'nama' => 'Petani Target',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990302',
        'nama' => 'Pembeli Pemohon',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    // 1. Pembeli mengirim permintaan kontak dengan pesan pengantar
    $resKirim = $this->actingAs($pembeli)
        ->postJson('/api/v1/percakapan/permintaan', [
            'nomor_hp' => '0812-9999-0301',
            'pesan' => 'Halo Pak Tani, saya butuh pasokan bayam organik rutin tiap minggu.',
        ])
        ->assertOk()
        ->json('data');

    expect($resKirim['status'])->toBe('menunggu')
        ->and($resKirim['id'])->toBeString()
        ->and($resKirim['target']['nama'])->toBe('Petani Target');

    $permintaanId = $resKirim['id'];

    // 2. Petani melihat lencana bertambah (permintaan_masuk = 1)
    $this->actingAs($petani)
        ->getJson('/api/v1/percakapan/lencana')
        ->assertOk()
        ->assertJsonPath('data.permintaan_masuk', 1)
        ->assertJsonPath('data.total', 1);

    // 3. Petani melihat daftar permintaan kontak masuk
    $resDaftar = $this->actingAs($petani)
        ->getJson('/api/v1/percakapan/permintaan')
        ->assertOk()
        ->json('data');

    expect($resDaftar['masuk'])->toHaveCount(1)
        ->and($resDaftar['masuk'][0]['id'])->toBe($permintaanId)
        ->and($resDaftar['masuk'][0]['pemohon']['nama'])->toBe('Pembeli Pemohon')
        ->and($resDaftar['masuk'][0]['pesan'])->toBe('Halo Pak Tani, saya butuh pasokan bayam organik rutin tiap minggu.');

    // 4. Petani menerima permintaan kontak
    $resTerima = $this->actingAs($petani)
        ->postJson("/api/v1/percakapan/permintaan/{$permintaanId}/terima")
        ->assertOk()
        ->json('data');

    expect($resTerima['jenis'])->toBe('kontak')
        ->and($resTerima['lawan_bicara']['nama'])->toBe('Pembeli Pemohon');

    $percakapanId = $resTerima['id'];

    // 5. Pesan pengantar otomatis tersimpan sebagai pesan pertama di percakapan
    $resPesan = $this->actingAs($petani)
        ->getJson("/api/v1/percakapan/{$percakapanId}/pesan")
        ->assertOk()
        ->json('data');

    expect($resPesan)->toHaveCount(1)
        ->and($resPesan[0]['pengirim_id'])->toBe($pembeli->id)
        ->and($resPesan[0]['isi'])->toBe('Halo Pak Tani, saya butuh pasokan bayam organik rutin tiap minggu.');

    // 6. Lencana permintaan masuk sekarang 0
    $this->actingAs($petani)
        ->getJson('/api/v1/percakapan/lencana')
        ->assertOk()
        ->assertJsonPath('data.permintaan_masuk', 0);
});

it('alur permintaan kontak dapat ditolak oleh penerima', function () {
    $petani = Pengguna::create([
        'nomor_hp' => '+6281299990311',
        'nama' => 'Petani Penolak',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $pembeli = Pengguna::create([
        'nomor_hp' => '+6281299990312',
        'nama' => 'Pembeli Ditolak',
        'peran' => Peran::Pembeli,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $resKirim = $this->actingAs($pembeli)
        ->postJson('/api/v1/percakapan/permintaan', [
            'nomor_hp' => '+6281299990311',
        ])
        ->assertOk()
        ->json('data');

    $permintaanId = $resKirim['id'];

    // Orang lain mencoba tolak -> 404
    $orangLain = Pengguna::create([
        'nomor_hp' => '+6281299990313',
        'nama' => 'Pengguna Iseng',
        'peran' => Peran::Petani,
        'status_akun' => StatusAkun::Aktif,
    ]);

    $this->actingAs($orangLain)
        ->postJson("/api/v1/percakapan/permintaan/{$permintaanId}/tolak")
        ->assertStatus(404);

    // Penerima yang sah menolak
    $this->actingAs($petani)
        ->postJson("/api/v1/percakapan/permintaan/{$permintaanId}/tolak")
        ->assertOk()
        ->assertJsonPath('data.status', 'ok');

    // Permintaan masuk petani kembali kosong
    $resDaftar = $this->actingAs($petani)
        ->getJson('/api/v1/percakapan/permintaan')
        ->assertOk()
        ->json('data');

    expect($resDaftar['masuk'])->toHaveCount(0);
});
