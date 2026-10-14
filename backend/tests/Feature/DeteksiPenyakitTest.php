<?php

use App\Domain\AI\PemeriksaPagarAI;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

function masukSebagai(string $id): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $id])->assertOk();
    app('auth')->forgetGuards();
}

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
});

it('deteksi penyakit: akses tanpa masuk ditolak 401', function () {
    $this->postJson('/api/v1/deteksi', ['berkas_id' => 'berkas-1'])
        ->assertStatus(401)
        ->assertJsonPath('galat.kode', 'BELUM_MASUK');
});

it('deteksi penyakit: peran selain petani ditolak 403', function () {
    masukSebagai('pembeli-ratna');

    $this->postJson('/api/v1/deteksi', ['berkas_id' => 'berkas-1'])
        ->assertStatus(403)
        ->assertJsonPath('galat.kode', 'TIDAK_DIIZINKAN');
});

it('deteksi penyakit: wajib menyetujui pemakaian AI terlebih dahulu (403 PERSETUJUAN_AI_WAJIB)', function () {
    // Pastikan belum setuju AI
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => null]);
    masukSebagai('petani-arif');

    $this->postJson('/api/v1/deteksi', ['berkas_id' => 'berkas-1'])
        ->assertStatus(403)
        ->assertJsonPath('galat.kode', 'PERSETUJUAN_AI_WAJIB');

    // Beri persetujuan AI
    $this->postJson('/api/v1/akun/setuju-ai')
        ->assertOk()
        ->assertJsonPath('data.id', 'petani-arif')
        ->assertJsonStructure(['data' => ['setuju_ai_pada']]);

    expect(DB::table('pengguna')->where('id', 'petani-arif')->value('setuju_ai_pada'))->not->toBeNull();
});

it('deteksi penyakit: berhasil menganalisis foto dan tersimpan di database serta jurnal', function () {
    // Setujui AI
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => Carbon::now('UTC')]);
    masukSebagai('petani-arif');

    // Buat berkas foto uji di DB
    $berkasId = Str::lower((string) Str::ulid());
    DB::table('berkas')->insert([
        'id' => $berkasId,
        'pemilik_id' => 'petani-arif',
        'jalur' => 'berkas/uji-tanaman.jpg',
        'jenis' => 'image/jpeg',
        'ukuran_byte' => 12345,
        'dibuat_pada' => Carbon::now('UTC'),
    ]);

    $res = $this->postJson('/api/v1/deteksi', [
        'berkas_id' => $berkasId,
        'siklus_id' => 'siklus-arif-sawi',
    ])->assertStatus(201);

    $res->assertJsonStructure([
        'data' => [
            'id',
            'pengguna_id',
            'siklus_id',
            'berkas_id',
            'hasil' => [
                'dugaan',
                'gejala_terlihat',
                'langkah_aman',
                'perlu_penyuluh',
                'catatan',
            ],
            'model',
            'dibuat_pada',
        ],
    ]);

    $deteksiId = $res->json('data.id');
    expect(DB::table('deteksi_tanaman')->where('id', $deteksiId)->exists())->toBeTrue();

    // Memastikan jurnal otomatis terbentuk
    $jurnal = DB::table('jurnal')
        ->where('siklus_id', 'siklus-arif-sawi')
        ->where('catatan', 'like', 'Dugaan dari foto:%')
        ->first();
    expect($jurnal)->not->toBeNull();
    expect($jurnal->foto)->toBe($berkasId);
});

it('deteksi penyakit: pagar AI menyaring pola dosis dan nama merek', function () {
    // Uji fungsi murni PemeriksaPagarAI
    expect(PemeriksaPagarAI::memuatDosis('Semprotkan 2 ml per liter air'))->toBeTrue();
    expect(PemeriksaPagarAI::memuatDosis('Larutkan 5 gram / tangki'))->toBeTrue();
    expect(PemeriksaPagarAI::memuatDosis('Siram tanaman secara teratur di pagi hari'))->toBeFalse();

    expect(PemeriksaPagarAI::temukanMerek('Gunakan pupuk Kandang Subur untuk dasar'))->toBe('Kandang Subur');
    expect(PemeriksaPagarAI::temukanMerek('Gunakan kompos daun organik buatan sendiri'))->toBeNull();

    $hasilBandel = [
        'dugaan' => [['nama' => 'Hawar Daun', 'keyakinan' => 'tinggi', 'alasan' => 'Daun bercak hitam']],
        'gejala_terlihat' => ['Bercak hitam'],
        'langkah_aman' => ['Semprot dengan Daun Lebat 5 ml per liter air setiap sore'],
        'perlu_penyuluh' => false,
        'catatan' => 'Saran otomatis',
    ];

    $hasilTersaring = PemeriksaPagarAI::saringHasilDeteksi($hasilBandel);

    expect($hasilTersaring['perlu_penyuluh'])->toBeTrue();
    expect(str_contains(json_encode($hasilTersaring['langkah_aman']), '5 ml per liter'))->toBeFalse();
    expect(str_contains(json_encode($hasilTersaring['langkah_aman']), 'Daun Lebat'))->toBeFalse();
    expect(str_contains($hasilTersaring['catatan'], 'Pemberitahuan sistem'))->toBeTrue();
});

it('deteksi penyakit: riwayat dan akses silang', function () {
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => Carbon::now('UTC')]);
    masukSebagai('petani-arif');

    $berkasId = Str::lower((string) Str::ulid());
    DB::table('berkas')->insert([
        'id' => $berkasId,
        'pemilik_id' => 'petani-arif',
        'jalur' => 'berkas/uji-tanaman.jpg',
        'jenis' => 'image/jpeg',
        'ukuran_byte' => 12345,
        'dibuat_pada' => Carbon::now('UTC'),
    ]);

    $id = $this->postJson('/api/v1/deteksi', ['berkas_id' => $berkasId])
        ->assertStatus(201)
        ->json('data.id');

    // Arif bisa melihat miliknya
    $this->getJson('/api/v1/deteksi')->assertOk()->assertJsonCount(1, 'data');
    $this->getJson("/api/v1/deteksi/{$id}")->assertOk();

    // Petani lain tidak bisa melihat milik Arif (404)
    masukSebagai('petani-dewi');
    $this->getJson("/api/v1/deteksi/{$id}")
        ->assertStatus(404)
        ->assertJsonPath('galat.kode', 'TIDAK_DITEMUKAN');
});

it('deteksi penyakit: dinonaktifkan via sakelar fitur', function () {
    config(['fitur.deteksi' => false]);

    masukSebagai('petani-arif');
    $this->postJson('/api/v1/deteksi', ['berkas_id' => 'berkas-1'])
        ->assertStatus(501)
        ->assertJsonPath('galat.kode', 'BELUM_TERSEDIA');
});
