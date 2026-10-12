<?php

use App\Domain\Invarian\InvarianPesanan;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\DB;

/*
 * Alur docs/naskah-demo.md lewat API (D-57): kebun, ambil pesanan, buat pesanan, bayar uang muka,
 * konfirmasi kiriman. Perilaku rinci dibandingkan dengan klien tiruan lewat uji naskah di peramban
 * (frontend/scripts/uji-naskah.mjs); tes ini menjaga aturan uang dan akses di server.
 */

beforeEach(function () {
    // 2026-10-05 08.00 WIB, hari acuan data contoh.
    $this->travelTo(CarbonImmutable::parse('2026-10-05 01:00:00', 'UTC'));
    DataContohSeeder::isi(CarbonImmutable::now());
});

function sebagai(string $id): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $id])->assertOk();
    app('auth')->forgetGuards();
}

it('referensi dan wilayah: konfigurasi publik, komoditas dengan pesanan di sekitar, desa tersedia lebih dulu', function () {
    $this->getJson('/api/v1/konfigurasi')->assertOk()->assertJsonPath('data.persen_uang_muka', 20);
    $this->getJson('/api/v1/publik/contoh')->assertOk()->assertJsonCount(3, 'data.contoh');
    $this->getJson('/api/v1/komoditas')->assertStatus(401);
    sebagai('petani-arif');
    $sawi = collect($this->getJson('/api/v1/komoditas')->json('data'))->firstWhere('id', 'sawi');
    expect($sawi)->toMatchArray(['status_resep' => 'tersedia', 'jumlah_pesanan_sekitar' => 1])->not->toHaveKey('dibuat_pada');
    $w = $this->getJson('/api/v1/wilayah?per_halaman=100')->assertOk()->json('data');
    expect(end($w))->toMatchArray(['desa' => 'Cihideung', 'tersedia_pilot' => false])
        ->and($w[0]['tersedia_pilot'])->toBeTrue();
    $this->getJson('/api/v1/harga-sekitar?input_id=urea')->assertOk()->assertJsonStructure(['data' => ['input_id', 'harga_per_satuan', 'jumlah_laporan']]);
    $this->getJson('/api/v1/resep/resep-sawi-bedengan')->assertOk()->assertJsonPath('data.tugas.0.id', 'siram');
});

it('kebun: buat siklus dengan tugas dan kapasitas; pengukuran di luar batas membuat ukur ulang', function () {
    sebagai('petani-arif');
    $resep = $this->getJson('/api/v1/resep/resep-sawi-bedengan')->json('data');
    $siklus = $this->postJson('/api/v1/siklus', [
        'resep_id' => 'resep-sawi-bedengan', 'lahan_id' => 'lahan-arif-kebun', 'luas_m2' => 20, 'satuan_asli' => 'm2', 'nilai_asli' => 20,
        'tanggal_tanam' => '2026-10-05', 'dapat_subsidi' => false, 'harga_jual' => 5000, 'bagi_alat' => false, 'jumlah_siklus_pembagian' => 10,
        'rencana_item' => [['resep_input_id' => $resep['input'][0]['id'], 'nama' => 'Benih', 'grup' => 'Benih', 'jumlah' => 1, 'satuan' => 'bungkus', 'harga_satuan' => 25000, 'alat_sekali_beli' => false]],
    ])->assertOk()->json('data');
    expect($siklus)->toMatchArray(['status' => 'aktif', 'hari_ke' => 0, 'perkiraan_panen_kg' => 30])
        ->and($siklus['modal']['total_modal'])->toBe(25000)
        ->and($siklus)->not->toHaveKey('urutan');
    expect(DB::table('tugas')->where('siklus_id', $siklus['id'])->count())->toBeGreaterThan(10);
    $this->postJson('/api/v1/siklus', ['resep_id' => 'resep-sawi-bedengan', 'lahan_id' => 'lahan-arif-kebun', 'luas_m2' => 500,
        'tanggal_tanam' => '2026-10-05', 'harga_jual' => 5000, 'rencana_item' => []])->assertStatus(409)->assertJsonPath('galat.kode', 'LAHAN_TIDAK_CUKUP');

    $tugasUkur = collect($this->getJson('/api/v1/siklus/siklus-arif-hidro/tugas')->json('data'))
        ->first(fn ($t) => $t['tipe'] === 'ukur' && $t['status'] === 'belum' && $t['tanggal'] === '2026-10-05');
    $masukan = ['kunci_idempoten' => 'ukur-1', 'nilai' => [['besaran' => 'pH', 'nilai' => 6.2], ['besaran' => 'PPM', 'nilai' => 600]]];
    $r = $this->postJson('/api/v1/tugas/'.rawurlencode($tugasUkur['id']).'/pengukuran', $masukan)->assertOk()->json('data');
    expect(array_column($r['hasil'], 'status'))->toBe(['normal', 'terlalu-rendah'])
        ->and($r['tugas_ukur_ulang'])->toMatchArray(['tanggal' => '2026-10-06', 'judul' => 'Ukur ulang: '.$tugasUkur['judul']]);
    // Idempoten: permintaan ulang dengan kunci sama tidak mencatat dua kali.
    $this->postJson('/api/v1/tugas/'.rawurlencode($tugasUkur['id']).'/pengukuran', $masukan)->assertOk()->assertJson(['data' => $r]);
    expect(DB::table('hasil_pengukuran')->where('tugas_id', $tugasUkur['id'])->count())->toBe(2);

    sebagai('petani-dewi');
    $this->getJson('/api/v1/siklus/siklus-arif-hidro')->assertStatus(404);
});

it('jual: ambil pesanan dan setuju; buat pesanan, bayar gagal lalu berhasil dengan kunci sama; konfirmasi dan rating', function () {
    sebagai('petani-arif');
    $sekitar = $this->getJson('/api/v1/pesanan/sekitar')->assertOk()->json('data');
    expect(array_column($sekitar, 'id'))->toBe(['pesanan-ratna-sawi', 'pesanan-koperasi-gabah', 'pesanan-kafe-bayam'])
        ->and($sekitar[2])->toMatchArray(['alokasi_saya' => null, 'alamat_antar' => null, 'sisa_kg' => 4]);
    $this->getJson('/api/v1/pesanan/sekitar?radius_km=30')->assertStatus(422);
    $this->postJson('/api/v1/pesanan/pesanan-kafe-bayam/ambil', ['kunci_idempoten' => 'a1', 'jumlah_kg' => 5, 'lahan_id' => 'lahan-arif-kebun'])
        ->assertStatus(409)->assertJsonPath('galat.kode', 'MELEBIHI_PESANAN');
    $ambil = $this->postJson('/api/v1/pesanan/pesanan-kafe-bayam/ambil', ['kunci_idempoten' => 'a2', 'jumlah_kg' => 4, 'lahan_id' => 'lahan-arif-kebun'])
        ->assertOk()->json('data');
    expect($ambil['siklus_ids'])->toHaveCount(7)->and($ambil['alokasi']['status'])->toBe('menunggu_kesepakatan');
    $this->postJson('/api/v1/alokasi/'.$ambil['alokasi']['id'].'/setuju')->assertOk()->assertJsonPath('data.status', 'disepakati');
    expect(DB::table('pengiriman')->where('alokasi_id', $ambil['alokasi']['id'])->count())->toBe(7)
        ->and(DB::table('tugas')->where('siklus_id', $ambil['siklus_ids'][0])->count())->toBeGreaterThan(0)
        ->and(InvarianPesanan::periksa())->toBe([]);

    sebagai('pembeli-imas');
    $pesanan = $this->postJson('/api/v1/pembeli/pesanan', ['jenis' => 'rutin', 'komoditas_id' => 'sawi', 'jumlah_per_kiriman_kg' => 10, 'frekuensi_hari' => 7,
        'durasi_hari' => 84, 'tanggal_mulai' => '2026-11-05', 'harga_per_kg' => 5000, 'standar_kualitas' => [], 'wilayah_id' => '32.17.01.2002', 'alamat_antar' => 'Jl. A'])
        ->assertOk()->json('data');
    expect($pesanan)->toMatchArray(['status' => 'menunggu_pembayaran', 'nilai_pesanan' => 600000, 'uang_muka' => 120000, 'biaya_layanan' => 30000, 'jumlah_kiriman' => 12]);
    $bayar = '/api/v1/pembeli/pesanan/'.$pesanan['id'].'/bayar-uang-muka';
    $this->postJson($bayar, ['kunci_idempoten' => 'b1', 'simulasi' => 'gagal'])->assertStatus(402)->assertJsonPath('galat.kode', 'PEMBAYARAN_GAGAL');
    // Percobaan gagal tercatat tanpa memakai kunci idempoten (D-57), jadi kunci yang sama berhasil.
    expect(DB::table('kunci_idempoten')->where('kunci', 'b1')->count())->toBe(0);
    $hasil = $this->postJson($bayar, ['kunci_idempoten' => 'b1'])->assertOk()->json('data');
    expect(array_map(fn ($b) => [$b['jenis'], $b['nominal'], $b['status']], $hasil))->toBe([['uang_muka', 120000, 'ditahan'], ['biaya_layanan', 30000, 'cair']])
        ->and($hasil[0]['referensi'])->toStartWith('TIRUAN-');
    $this->postJson($bayar, ['kunci_idempoten' => 'b1'])->assertOk()->assertJson(['data' => $hasil]);
    expect(DB::table('pembayaran')->where('pesanan_id', $pesanan['id'])->pluck('status')->sort()->values()->all())->toBe(['cair', 'ditahan', 'gagal']);

    $dasbor = $this->getJson('/api/v1/pembeli/pesanan')->assertOk()->json('data');
    $bayam = collect($dasbor)->firstWhere('id', 'pesanan-imas-bayam');
    expect($bayam['kiriman_menunggu'][0]['id'])->toBe('kiriman-imas-arif-3')
        ->and($bayam['kebun'][0])->not->toHaveKeys(['lintang', 'bujur']);
    $k = $this->postJson('/api/v1/kiriman/kiriman-imas-arif-3/konfirmasi', ['kunci_idempoten' => 'k1', 'keputusan' => 'terima_semua'])->assertOk()->json('data');
    expect($k['pengiriman'])->toMatchArray(['status' => 'diterima', 'nilai_diterima' => 30000])
        ->and(array_column($k['pembayaran'], 'nominal'))->toBe([24000, 6000]);
    $this->postJson('/api/v1/kiriman/kiriman-imas-arif-3/rating', ['nilai' => 5])->assertOk();
    $this->postJson('/api/v1/kiriman/kiriman-imas-arif-3/rating', ['nilai' => 4])->assertStatus(409)->assertJsonPath('galat.kode', 'SUDAH_DINILAI');
    $this->getJson('/api/v1/pembeli/pembayaran')->assertOk()->assertJsonPath('meta.halaman', 1);
    expect(InvarianPesanan::periksa())->toBe([]);

    // Petani lain dan peran lain tidak bisa membaca kiriman ini.
    sebagai('petani-dewi');
    $this->getJson('/api/v1/kiriman/kiriman-imas-arif-3')->assertStatus(404);
    sebagai('mentor-rahmat');
    $this->getJson('/api/v1/kiriman/kiriman-imas-arif-3')->assertStatus(403);
});

it('kiriman yang melewati batas periksa dianggap diterima saat dibaca (D-01)', function () {
    sebagai('pembeli-imas');
    $this->travel(6)->hours();
    $x = $this->getJson('/api/v1/kiriman/kiriman-imas-arif-3')->assertOk()->json('data');
    expect($x)->toMatchArray(['status' => 'diterima', 'dianggap_diterima' => true])
        ->and(InvarianPesanan::periksa())->toBe([]);
});
