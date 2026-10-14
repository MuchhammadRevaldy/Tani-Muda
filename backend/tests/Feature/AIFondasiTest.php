<?php

use App\Domain\AI\DriverOpenAI;
use App\Domain\AI\DriverTiruan;
use App\Domain\AI\LayananAI;
use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

it('driver tiruan mengembalikan respons berlabel tanpa internet', function () {
    $driver = new DriverTiruan();

    $teks = $driver->teks([['role' => 'user', 'content' => 'Halo']]);
    expect($teks->tiruan)->toBeTrue()
        ->and($teks->model)->toBe('tiruan')
        ->and($teks->konten)->toContain('mode tanpa internet');

    $gambar = $driver->gambar('path/palsu.jpg', []);
    expect($gambar->tiruan)->toBeTrue()
        ->and($gambar->dataTerstruktur)->toBeArray()
        ->and($gambar->dataTerstruktur)->toHaveKey('dugaan');

    $embedding = $driver->embedding(['uji']);
    expect($embedding)->toBeArray()
        ->and($embedding[0])->toBeArray();

    $json = $driver->jsonTerstruktur([], []);
    expect($json)->toBeArray()
        ->and($json)->toHaveKey('status');
});

it('driver openai melempar galat bila kunci API kosong', function () {
    config(['ai.api_key' => '']);
    $driver = new DriverOpenAI(modelTeks: 'model-teks-contoh');

    $driver->teks([['role' => 'user', 'content' => 'Halo']]);
})->throws(GalatApi::class);

it('driver openai melempar galat bila nama model kosong', function () {
    config(['ai.api_key' => 'sk-test-ai', 'ai.model_teks' => null]);
    $driver = new DriverOpenAI(apiKey: 'sk-test-ai', modelTeks: null);

    $driver->teks([['role' => 'user', 'content' => 'Halo']]);
})->throws(GalatApi::class);

it('driver openai memanggil chat completions dengan format OpenAI yang benar', function () {
    Http::fake([
        'https://ai.contoh.test/v1/chat/completions' => Http::response([
            'choices' => [
                ['message' => ['content' => 'Jawaban dari model AI contoh.']],
            ],
            'usage' => [
                'prompt_tokens' => 12,
                'completion_tokens' => 20,
            ],
        ], 200),
    ]);

    $driver = new DriverOpenAI(
        apiKey: 'sk-test-ai',
        baseUrl: 'https://ai.contoh.test/v1',
        modelTeks: 'model-teks-contoh',
    );

    $jawaban = $driver->teks([['role' => 'user', 'content' => 'Cek tanaman']]);

    expect($jawaban->konten)->toBe('Jawaban dari model AI contoh.')
        ->and($jawaban->tokenMasuk)->toBe(12)
        ->and($jawaban->tokenKeluar)->toBe(20)
        ->and($jawaban->tiruan)->toBeFalse();

    Http::assertSent(function ($request) {
        return $request->hasHeader('Authorization', 'Bearer sk-test-ai')
            && $request['model'] === 'model-teks-contoh'
            && $request['messages'][0]['content'] === 'Cek tanaman';
    });
});

it('layanan AI mewajibkan persetujuan privasi AI', function () {
    $ids = isiDataDasar();
    $layanan = new LayananAI(new DriverTiruan());

    // Petani belum setuju AI (setuju_ai_pada = null)
    expect(fn () => $layanan->teks('uji', $ids['petani'], [['role' => 'user', 'content' => 'Tanya']]))
        ->toThrow(GalatApi::class);

    // Setujui AI
    $layanan->catatPersetujuan($ids['petani']);
    $pengguna = Pengguna::find($ids['petani']);
    expect($pengguna?->setuju_ai_pada)->not->toBeNull();

    // Sekarang berhasil
    $jawaban = $layanan->teks('uji', $ids['petani'], [['role' => 'user', 'content' => 'Tanya']]);
    expect($jawaban->konten)->toContain('mode tanpa internet');
});

it('layanan AI menegakkan batas harian panggilan', function () {
    $ids = isiDataDasar();
    $layanan = new LayananAI(new DriverTiruan());
    $layanan->catatPersetujuan($ids['petani']);

    config(['ai.batas_harian' => 3]);

    $layanan->teks('uji', $ids['petani'], [['role' => 'user', 'content' => 'Panggilan 1']]);
    $layanan->teks('uji', $ids['petani'], [['role' => 'user', 'content' => 'Panggilan 2']]);
    $layanan->teks('uji', $ids['petani'], [['role' => 'user', 'content' => 'Panggilan 3']]);

    // Panggilan ke-4 harus ditolak
    expect(fn () => $layanan->teks('uji', $ids['petani'], [['role' => 'user', 'content' => 'Panggilan 4']]))
        ->toThrow(GalatApi::class);
});

it('layanan AI mencatat riwayat ke tabel log_ai tanpa membocorkan rahasia', function () {
    $ids = isiDataDasar();
    $layanan = new LayananAI(new DriverTiruan());
    $layanan->catatPersetujuan($ids['petani']);

    $layanan->teks('konsultasi', $ids['petani'], [['role' => 'user', 'content' => 'Pertanyaan rahasia']]);

    $log = DB::table('log_ai')->where('pengguna_id', $ids['petani'])->first();
    expect($log)->not->toBeNull()
        ->and($log->fitur)->toBe('konsultasi')
        ->and($log->berhasil)->toBe(1);

    // Memastikan tidak ada kolom penyimpan isi pertanyaan atau gambar di log_ai
    expect(Schema::hasColumn('log_ai', 'pertanyaan'))->toBeFalse()
        ->and(Schema::hasColumn('log_ai', 'foto'))->toBeFalse()
        ->and(Schema::hasColumn('log_ai', 'kunci'))->toBeFalse();
});
