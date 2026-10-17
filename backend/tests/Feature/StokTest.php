<?php

use App\Domain\Stok\LayananStok;
use App\Http\Galat\GalatApi;
use App\Models\Pembayaran;
use App\Models\Pengguna;
use App\Models\Stok;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
    app('auth')->forgetGuards();
});

function masuk(string $penggunaId): void
{
    app('auth')->forgetGuards();
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $penggunaId])->assertOk();
    app('auth')->forgetGuards();
}

it('petani dapat menambah dan melihat stok miliknya', function () {
    masuk('petani-arif');

    $payload = [
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 50,
        'harga_per_kg' => 8000,
        'tanggal_panen' => now()->toDateString(),
    ];

    $res = $this->postJson('/api/v1/stok', $payload);
    $res->assertCreated();
    $res->assertJsonPath('data.komoditas_id', 'sawi');
    $res->assertJsonPath('data.jumlah_kg', 50);
    $res->assertJsonPath('data.sisa_kg', 50);
    $res->assertJsonPath('data.status', 'tersedia');

    $stokId = $res->json('data.id');

    // Ambil daftar stok saya
    $daftar = $this->getJson('/api/v1/stok')->assertOk();
    $ids = collect($daftar->json('data'))->pluck('id')->all();
    expect($ids)->toContain($stokId);

    // Ubah harga dan status stok
    $ubah = $this->patchJson("/api/v1/stok/{$stokId}", [
        'harga_per_kg' => 8500,
        'status' => 'ditarik',
    ])->assertOk();
    $ubah->assertJsonPath('data.harga_per_kg', 8500);
    $ubah->assertJsonPath('data.status', 'ditarik');
});

it('pembeli terverifikasi dapat melihat stok di sekitar', function () {
    // Petani menambah stok
    masuk('petani-arif');
    $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'tomat',
        'jumlah_kg' => 100,
        'harga_per_kg' => 12000,
        'tanggal_panen' => now()->toDateString(),
    ])->assertCreated();

    // Masuk sebagai pembeli ratna (terverifikasi)
    masuk('pembeli-ratna');
    $res = $this->getJson('/api/v1/stok/sekitar?komoditas=tomat')->assertOk();
    $data = $res->json('data');
    expect($data)->not->toBeEmpty();
    expect($data[0]['komoditas_id'])->toBe('tomat');
    expect($data[0])->toHaveKey('jarak_km');
});

it('pembelian dengan COD berhasil mengurangi sisa_kg dan TIDAK PERNAH membuat baris pembayaran', function () {
    // Petani menambah stok
    masuk('petani-arif');
    $stokRes = $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 30,
        'harga_per_kg' => 10000,
        'tanggal_panen' => now()->toDateString(),
    ])->assertCreated();
    $stokId = $stokRes->json('data.id');

    // Pembeli membeli dengan COD
    masuk('pembeli-ratna');
    $beliRes = $this->postJson("/api/v1/stok/{$stokId}/beli", [
        'jumlah_kg' => 10,
        'metode_bayar' => 'cod',
        'alamat_antar' => 'Jl. Kebon Sirih No. 10',
    ])->assertCreated();

    $pesananStokId = $beliRes->json('data.id');
    expect($beliRes->json('data.status'))->toBe('menunggu');
    expect($beliRes->json('data.nilai'))->toBe(100000);

    // Cek sisa_kg stok
    $stok = Stok::find($stokId);
    expect($stok->sisa_kg)->toBe(20.0);

    // BUKTI TEGAS: COD TIDAK PERNAH membuat baris pembayaran
    $adaPembayaran = Pembayaran::where('pesanan_stok_id', $pesananStokId)->exists();
    expect($adaPembayaran)->toBeFalse();
});

it('pembelian dengan bayar di aplikasi membuat baris pembayaran ditahan dan cair saat selesai', function () {
    // Petani menambah stok
    masuk('petani-arif');
    $stokRes = $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'cabai',
        'jumlah_kg' => 20,
        'harga_per_kg' => 50000,
        'tanggal_panen' => now()->toDateString(),
    ])->assertCreated();
    $stokId = $stokRes->json('data.id');

    // Pembeli beli bayar_di_aplikasi
    masuk('pembeli-ratna');
    $beliRes = $this->postJson("/api/v1/stok/{$stokId}/beli", [
        'jumlah_kg' => 5,
        'metode_bayar' => 'bayar_di_aplikasi',
        'alamat_antar' => 'Jl. Sunda No. 45',
        'kunci_idempoten' => 'uji-bayar-stok-1',
    ])->assertCreated();

    $pesananStokId = $beliRes->json('data.id');

    // Cek ada pembayaran ditahan
    $bayar = Pembayaran::where('pesanan_stok_id', $pesananStokId)->first();
    expect($bayar)->not->toBeNull();
    expect($bayar->nominal)->toBe(250000);
    expect($bayar->status->value)->toBe('ditahan');
    expect($bayar->pesanan_id)->toBeNull();

    // Petani menerima lalu mengirim
    masuk('petani-arif');
    $this->postJson("/api/v1/pesanan-stok/{$pesananStokId}/terima")->assertOk();
    $this->postJson("/api/v1/pesanan-stok/{$pesananStokId}/dikirim")->assertOk();

    // Pembeli menyelesaikan pesanan
    masuk('pembeli-ratna');
    $this->postJson("/api/v1/pesanan-stok/{$pesananStokId}/selesai")->assertOk();

    // Pembayaran otomatis cair
    $bayar->refresh();
    expect($bayar->status->value)->toBe('cair');
});

it('dua pembelian berurutan membuktikan stok tidak pernah minus dan menolak kelebihan beli', function () {
    masuk('petani-arif');
    $stokRes = $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 10,
        'harga_per_kg' => 10000,
        'tanggal_panen' => now()->toDateString(),
    ])->assertCreated();
    $stokId = $stokRes->json('data.id');

    // Simulasikan dua proses transaksi bersaing dengan sisa_kg hanya 10
    // Keduanya mencoba membeli 8 kg
    $pembeli = Pengguna::find('pembeli-ratna');

    $sukses = 0;
    $gagal = 0;

    // Transaksi 1
    try {
        app(LayananStok::class)->beliStok($pembeli, $stokId, [
            'jumlah_kg' => 8,
            'metode_bayar' => 'cod',
            'alamat_antar' => 'Alamat A',
        ]);
        $sukses++;
    } catch (Throwable) {
        $gagal++;
    }

    // Transaksi 2 (harus gagal STOK_TIDAK_CUKUP karena sisa_kg hanya 2)
    try {
        app(LayananStok::class)->beliStok($pembeli, $stokId, [
            'jumlah_kg' => 8,
            'metode_bayar' => 'cod',
            'alamat_antar' => 'Alamat B',
        ]);
        $sukses++;
    } catch (GalatApi $e) {
        expect($e->kode)->toBe('STOK_TIDAK_CUKUP');
        $gagal++;
    }

    expect($sukses)->toBe(1);
    expect($gagal)->toBe(1);

    $stok = Stok::find($stokId);
    expect($stok->sisa_kg)->toBe(2.0);
    expect($stok->sisa_kg)->toBeGreaterThanOrEqual(0);
});

it('menolak atau membatalkan pesanan mengembalikan sisa_kg ke stok', function () {
    masuk('petani-arif');
    $stokRes = $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 10,
        'harga_per_kg' => 10000,
        'tanggal_panen' => now()->toDateString(),
    ])->assertCreated();
    $stokId = $stokRes->json('data.id');

    // Beli semua sehingga status habis
    masuk('pembeli-ratna');
    $beliRes = $this->postJson("/api/v1/stok/{$stokId}/beli", [
        'jumlah_kg' => 10,
        'metode_bayar' => 'cod',
        'alamat_antar' => 'Alamat',
    ])->assertCreated();
    $pesananStokId = $beliRes->json('data.id');

    expect(Stok::find($stokId)->status)->toBe('habis');
    expect(Stok::find($stokId)->sisa_kg)->toBe(0.0);

    // Petani menolak pesanan
    masuk('petani-arif');
    $this->postJson("/api/v1/pesanan-stok/{$pesananStokId}/tolak", ['alasan' => 'Stok rusak'])->assertOk();

    // Sisa kg kembali dan status kembali tersedia
    $stok = Stok::find($stokId);
    expect($stok->sisa_kg)->toBe(10.0);
    expect($stok->status)->toBe('tersedia');
});

it('pelanggaran batasan CHECK basis data ditolak', function () {
    // 1. sisa_kg > jumlah_kg
    expect(function () {
        DB::table('stok')->insert([
            'id' => 'stok-rusak-1',
            'petani_id' => 'petani-arif',
            'komoditas_id' => 'sawi',
            'jumlah_kg' => 10,
            'sisa_kg' => 15, // MELANGGAR
            'harga_per_kg' => 10000,
            'tanggal_panen' => now()->toDateString(),
            'status' => 'tersedia',
        ]);
    })->toThrow(QueryException::class);

    // 2. Pembayaran dengan dua rujukan (pesanan_id dan pesanan_stok_id sama-sama terisi)
    expect(function () {
        DB::table('pembayaran')->insert([
            'id' => 'bayar-rusak-1',
            'pesanan_id' => 'pesanan-uji',
            'pesanan_stok_id' => 'stok-uji',
            'jenis' => 'kiriman',
            'nominal' => 10000,
            'status' => 'ditahan',
            'referensi' => 'TIRUAN-X',
        ]);
    })->toThrow(QueryException::class);

    // 3. Pembayaran tanpa rujukan sama sekali (keduanya NULL)
    expect(function () {
        DB::table('pembayaran')->insert([
            'id' => 'bayar-rusak-2',
            'pesanan_id' => null,
            'pesanan_stok_id' => null,
            'jenis' => 'kiriman',
            'nominal' => 10000,
            'status' => 'ditahan',
            'referensi' => 'TIRUAN-Y',
        ]);
    })->toThrow(QueryException::class);
});

it('tes hak akses silang: pemilik 200, peran salah 403, pengguna lain 403/404, tanpa sesi 401', function () {
    // Tanpa sesi -> 401
    $this->flushSession();
    app('auth')->forgetGuards();
    $this->getJson('/api/v1/stok')->assertStatus(401);

    // Petani Arif membuat stok
    masuk('petani-arif');
    $stokRes = $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 20,
        'harga_per_kg' => 10000,
        'tanggal_panen' => now()->toDateString(),
    ])->assertCreated();
    $stokId = $stokRes->json('data.id');

    // Pembeli mencoba membuat stok -> 403
    masuk('pembeli-ratna');
    $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 20,
        'harga_per_kg' => 10000,
        'tanggal_panen' => now()->toDateString(),
    ])->assertStatus(403);

    // Petani lain (Budi) mencoba mengubah stok Arif -> 403
    masuk('petani-budi');
    $this->patchJson("/api/v1/stok/{$stokId}", ['harga_per_kg' => 15000])->assertStatus(403);
});

it('petani dapat mengunggah foto stok dan menolak jenis berkas/ukuran yang salah', function () {
    Storage::fake('local');
    masuk('petani-arif');

    // 1. Jenis berkas salah (misal PDF) ditolak
    $pdf = UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf');
    $this->post('/api/v1/berkas', ['berkas' => $pdf], ['Accept' => 'application/json'])
        ->assertStatus(422)
        ->assertJsonStructure(['galat' => ['rincian' => ['jenis']]]);

    // 2. Ukuran berkas melebihi batas 2 MB ditolak
    $besar = UploadedFile::fake()->image('besar.jpg')->size(2049);
    $this->post('/api/v1/berkas', ['berkas' => $besar], ['Accept' => 'application/json'])
        ->assertStatus(422)
        ->assertJsonStructure(['galat' => ['rincian' => ['isi']]]);

    // 3. Unggah foto yang valid (JPEG)
    $foto = UploadedFile::fake()->image('panen-sawi.jpg', 600, 400);
    $unggahRes = $this->post('/api/v1/berkas', ['berkas' => $foto], ['Accept' => 'application/json'])
        ->assertOk()
        ->json('data');

    expect($unggahRes)->toHaveKeys(['id', 'url', 'jenis']);
    $urlFoto = $unggahRes['url'];

    // 4. Petani membuat stok dengan foto tersebut
    $stokRes = $this->postJson('/api/v1/stok', [
        'komoditas_id' => 'sawi',
        'jumlah_kg' => 15,
        'harga_per_kg' => 9000,
        'tanggal_panen' => now()->toDateString(),
        'foto' => $urlFoto,
    ])->assertCreated();

    $stokId = $stokRes->json('data.id');
    $fotoHasil = $stokRes->json('data.foto');
    expect($fotoHasil)->toStartWith('/api/v1/berkas/');

    // 5. Di database disimpan sebagai berkas:{id}
    $stokDb = DB::table('stok')->where('id', $stokId)->first();
    expect($stokDb->foto)->toBe("berkas:{$unggahRes['id']}");

    // 6. Mengubah foto stok (atau menghapus foto)
    $ubahRes = $this->patchJson("/api/v1/stok/{$stokId}", [
        'foto' => null,
    ])->assertOk();
    expect($ubahRes->json('data.foto'))->toBeNull();
});

