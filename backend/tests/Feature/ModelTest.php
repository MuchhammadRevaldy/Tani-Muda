<?php

use App\Enums\Peran;
use App\Enums\StatusPengiriman;
use App\Enums\StatusSiklus;
use App\Models\AlokasiPesanan;
use App\Models\Lahan;
use App\Models\Pengguna;
use App\Models\Pengiriman;
use App\Models\Pesanan;
use App\Models\ResepTanam;
use App\Models\SiklusTanam;
use App\Models\Wilayah;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

/*
 * Model Eloquent (T5.04–T5.07): relasi yang dipakai endpoint, cast sesuai kontrak, ID baru ULID,
 * dan waktu berformat kontrak.
 */
beforeEach(function () {
    $this->id = isiDataDasar();
});

it('relasi petani: lahan, siklus, alokasi; siklus ke resep, lahan, dan alokasi', function () {
    $petani = Pengguna::findOrFail('petani-uji');
    SiklusTanam::whereKey('siklus-uji')->update(['alokasi_pesanan_id' => 'alokasi-uji']);

    expect($petani->lahan->pluck('id')->all())->toBe(['lahan-uji'])
        ->and($petani->siklus->first()->lahan->id)->toBe('lahan-uji')
        ->and($petani->alokasi->first()->pesanan->pembeli->id)->toBe('pembeli-uji')
        ->and($petani->wilayah->desa)->toBe('Lembang')
        ->and(SiklusTanam::findOrFail('siklus-uji')->resep->komoditas->nama)->toBe('Sawi hijau')
        ->and(AlokasiPesanan::findOrFail('alokasi-uji')->siklus->pluck('id')->all())->toBe(['siklus-uji']);
});

it('relasi pesanan: pembeli, alokasi, kiriman; kiriman ke alokasi dan pesanan', function () {
    $pesanan = Pesanan::with(['alokasi.pengiriman', 'pembeli', 'wilayah'])->findOrFail('pesanan-uji');

    expect($pesanan->pembeli->peran)->toBe(Peran::Pembeli)
        ->and($pesanan->alokasi->first()->pengiriman->first()->id)->toBe('kiriman-uji')
        ->and(Pengiriman::findOrFail('kiriman-uji')->pesanan->id)->toBe('pesanan-uji')
        ->and(Pengguna::findOrFail('pembeli-uji')->pesanan->pluck('id')->all())->toBe(['pesanan-uji']);
});

it('resep punya input dan tugas berurutan', function () {
    $resep = ResepTanam::findOrFail('resep-sawi-bedengan');
    $resep->input()->forceCreate(['id' => 'benih', 'urutan' => 1, 'nama' => 'Benih sawi', 'grup' => 'benih', 'dosis' => 0.5,
        'satuan_dosis' => 'g', 'dasar_dosis' => 'per_m2', 'satuan_beli' => 'bungkus', 'ukuran_kemasan' => 1]);
    $resep->tugas()->forceCreate(['id' => 'siram', 'urutan' => 1, 'judul' => 'Siram', 'tipe' => 'berulang',
        'hst_mulai' => 0, 'interval' => 1, 'cara_mengerjakan' => ['Siram pagi']]);

    expect($resep->input->first()->dosis)->toBe(0.5)
        ->and($resep->tugas->first()->cara_mengerjakan)->toBe(['Siram pagi'])
        ->and($resep->standar_kualitas)->toBe(['Daun segar'])
        ->and($resep->contoh)->toBeTrue();
});

it('baris baru tanpa ID diberi ULID huruf kecil; ID data contoh dipakai apa adanya', function () {
    $lahan = new Lahan(['petani_id' => 'petani-uji', 'nama' => 'Kebun baru', 'jenis_lahan' => 'pekarangan',
        'luas_m2' => 12, 'satuan_asli' => 'm2', 'nilai_asli' => 12, 'wilayah_id' => '32.17.01.2003']);
    $lahan->save();

    expect($lahan->id)->toMatch('/^[0-9a-hjkmnp-tv-z]{26}$/')
        ->and(Lahan::find('lahan-uji'))->not->toBeNull();
});

it('ID dan kolom waktu tidak bisa diisi massal dari permintaan', function () {
    $lahan = new Lahan(['id' => 'pilihan-klien', 'dibuat_pada' => '2000-01-01', 'nama' => 'X']);

    expect($lahan->id)->toBeNull()->and($lahan->dibuat_pada)->toBeNull()->and($lahan->nama)->toBe('X');
});

it('cast mengikuti kontrak: enum, angka desimal, uang bulat, tanggal tanpa jam', function () {
    $siklus = SiklusTanam::findOrFail('siklus-uji');
    $json = $siklus->toArray();

    expect($siklus->status)->toBe(StatusSiklus::Aktif)
        ->and($json['status'])->toBe('aktif')
        ->and($json['luas_m2'])->toBe(40.0)
        ->and($json['harga_jual'])->toBe(6000)
        ->and($json['tanggal_tanam'])->toBe('2026-10-01')
        ->and(Pengiriman::findOrFail('kiriman-uji')->status)->toBe(StatusPengiriman::Terjadwal)
        ->and(Wilayah::findOrFail('32.17.01.2003')->toArray()['lintang'])->toBe(-6.8117);
});

it('waktu disimpan UTC dan dikirim sebagai ISO 8601 `…000Z`', function () {
    Carbon::setTestNow(Carbon::parse('2026-10-05 08:00:00', 'Asia/Jakarta'));
    $pengguna = Pengguna::query()->forceCreate(['nomor_hp' => '+6281200000099', 'zona_waktu' => 'Asia/Jakarta']);
    Carbon::setTestNow();

    expect($pengguna->fresh()->toArray()['dibuat_pada'])->toBe('2026-10-05T01:00:00.000Z')
        ->and(DB::table('pengguna')->where('id', $pengguna->id)->value('dibuat_pada'))->toBe('2026-10-05 01:00:00');
});

it('Pengguna bisa masuk lewat Sanctum tanpa kata sandi', function () {
    Sanctum::actingAs(Pengguna::findOrFail('petani-uji'));

    expect(auth()->id())->toBe('petani-uji')
        ->and(Pengguna::findOrFail('petani-uji')->createToken('hp')->plainTextToken)->toContain('|');
});
