<?php

use App\Domain\AI\JawabanAI;
use App\Domain\AI\PenyediaAI;
use App\Models\ObrolanBot;
use App\Models\PengetahuanPotongan;
use App\Models\PengetahuanSumber;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

function masukSebagaiChat(string $id): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $id])->assertOk();
    app('auth')->forgetGuards();
}

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());

    // Pastikan ada merek_input untuk tes pagar
    DB::table('input_pertanian')->insertOrIgnore([
        'id' => 'input-pestisida-uji',
        'nama' => 'Pestisida Uji',
        'kategori' => 'bahan_lain',
        'satuan' => 'liter',
    ]);

    DB::table('merek_input')->insertOrIgnore([
        'id' => 'merek-racun-uji',
        'input_id' => 'input-pestisida-uji',
        'nama' => 'PestisidaBandel',
        'produsen' => 'PT Uji Sejahtera',
        'isi_kemasan' => 1,
        'teks_kemasan' => '1 liter',
    ]);
});

it('perintah pengetahuan:muat berhasil memuat resep dan modul ke tabel pengetahuan', function () {
    Artisan::call('pengetahuan:muat', ['--segar' => true]);

    expect(PengetahuanSumber::count())->toBeGreaterThan(0)
        ->and(PengetahuanPotongan::count())->toBeGreaterThan(0);

    $sumberResep = PengetahuanSumber::where('jenis', 'resep')->first();
    expect($sumberResep)->not->toBeNull();
});

it('petani belum setuju AI ditolak saat memanggil chatbot', function () {
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => null]);
    masukSebagaiChat('petani-arif');

    $res = $this->postJson('/api/v1/chatbot', [
        'pesan' => 'Bagaimana cara menanam sawi yang baik?',
    ]);

    $res->assertStatus(403)
        ->assertJsonPath('galat.kode', 'PERSETUJUAN_AI_WAJIB');
});

it('petani yang sudah setuju AI mendapat jawaban chatbot bersumber dan tercatat metodenya', function () {
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => now()]);
    masukSebagaiChat('petani-arif');

    // Muat pengetahuan
    Artisan::call('pengetahuan:muat', ['--segar' => true]);

    $res = $this->postJson('/api/v1/chatbot', [
        'pesan' => 'Bagaimana cara perawatan tanaman sawi?',
    ]);

    $res->assertOk()
        ->assertJsonStructure([
            'data' => [
                'jawaban',
                'sumber',
                'percakapan_id',
                'metode_pencarian',
            ],
        ]);

    expect($res->json('data.metode_pencarian'))->toBeIn(['embedding', 'kata_kunci']);

    // Pastikan tersimpan di obrolan_bot
    expect(ObrolanBot::where('pengguna_id', 'petani-arif')->count())->toBe(2);
});

it('pagar AI menyaring nama merek atau pola dosis pada jawaban chatbot', function () {
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => now()]);
    masukSebagaiChat('petani-arif');

    // Muat potongan dummy yang memicu jawaban
    $sumber = PengetahuanSumber::create([
        'id' => (string) Str::ulid(),
        'judul' => 'Uji Hama Sawi',
        'jenis' => 'resep',
        'lisensi' => 'CC-BY-SA-4.0',
    ]);
    PengetahuanPotongan::create([
        'id' => (string) Str::ulid(),
        'sumber_id' => $sumber->id,
        'urutan' => 1,
        'isi' => 'Ulat daun sawi menyerang daun muda.',
    ]);

    // Tirukan PenyediaAI mengembalikan teks memuat merek terlarang
    $mockAi = Mockery::mock(PenyediaAI::class);
    $mockAi->shouldReceive('teks')->andReturn(new JawabanAI(
        konten: 'Gunakan produk PestisidaBandel dengan dosis 5 ml per liter air.',
        tokenMasuk: 10,
        tokenKeluar: 20,
        model: 'tiruan',
    ));
    $this->app->instance(PenyediaAI::class, $mockAi);

    $res = $this->postJson('/api/v1/chatbot', [
        'pesan' => 'Ulat daun sawi',
    ]);

    $res->assertOk();
    $jawaban = $res->json('data.jawaban');
    expect($jawaban)->not->toContain('PestisidaBandel')
        ->and($jawaban)->not->toContain('5 ml per liter')
        ->and($jawaban)->toContain('penyuluh pertanian');
});

it('pertanyaan di luar basis pengetahuan dijawab belum ada di panduan', function () {
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => now()]);
    masukSebagaiChat('petani-arif');

    // Kosongkan tabel pengetahuan
    PengetahuanPotongan::query()->delete();
    PengetahuanSumber::query()->delete();

    $res = $this->postJson('/api/v1/chatbot', [
        'pesan' => 'Bagaimana cara merakit roket ke Mars?',
    ]);

    $res->assertOk()
        ->assertJsonPath('data.jawaban', 'Belum ada di panduan Tani Muda. Tanyakan ke penyuluh lewat tombol di bawah.');
});

it('riwayat percakapan hanya bisa dibaca oleh pemiliknya (uji akses silang)', function () {
    DB::table('pengguna')->where('id', 'petani-arif')->update(['setuju_ai_pada' => now()]);
    DB::table('pengguna')->where('id', 'petani-dewi')->update(['setuju_ai_pada' => now()]);

    masukSebagaiChat('petani-arif');

    ObrolanBot::create([
        'id' => 'obrolan-petani-1',
        'pengguna_id' => 'petani-arif',
        'percakapan_bot_id' => 'percakapan-123',
        'peran' => 'user',
        'isi' => 'Pesan rahasia petani 1',
        'dibuat_pada' => now(),
    ]);

    $res = $this->getJson('/api/v1/chatbot/riwayat?percakapan_id=percakapan-123');
    $res->assertOk();
    expect(count($res->json('data')))->toBe(1);

    // Masuk sebagai petani 2
    masukSebagaiChat('petani-dewi');

    $resLain = $this->getJson('/api/v1/chatbot/riwayat?percakapan_id=percakapan-123');
    $resLain->assertOk();
    // Petani 2 tidak boleh melihat data percakapan milik petani 1
    expect($resLain->json('data'))->toBe([]);
});

it('pengguna peran pembeli ditolak mengakses chatbot', function () {
    masukSebagaiChat('pembeli-ratna');

    $res = $this->postJson('/api/v1/chatbot', [
        'pesan' => 'Halo bot',
    ]);

    $res->assertStatus(403);
});
