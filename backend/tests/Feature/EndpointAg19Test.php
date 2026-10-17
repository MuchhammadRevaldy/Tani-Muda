<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\DB;

/* Endpoint sederhana [AG-19]: pengingat, merek, jurnal, pengeluaran (kontrak 3.2 dan 3.5). */

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'petani-arif'])->assertOk();
    app('auth')->forgetGuards();
});

it('PUT pengingat: jam pagi 05:00–07:00, tersimpan dan terbaca ulang', function () {
    $isi = ['jam_pagi' => '06:30', 'pengingat_sore' => false, 'tipe_aktif' => ['sekali' => true, 'berulang' => false, 'ukur' => true]];
    $this->putJson('/api/v1/siklus/siklus-arif-sawi/pengingat', $isi)->assertOk()
        ->assertJsonPath('data.jam_pagi', '06:30')->assertJsonPath('data.tipe_aktif.berulang', false);
    $this->getJson('/api/v1/siklus/siklus-arif-sawi/pengingat')->assertOk()
        ->assertJsonPath('data.pengingat_sore', false)->assertJsonPath('data.siklus_id', 'siklus-arif-sawi');
    foreach (['04:59', '07:01', '7:00', 'pagi'] as $jam) {
        $this->putJson('/api/v1/siklus/siklus-arif-sawi/pengingat', ['jam_pagi' => $jam] + $isi)
            ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['jam_pagi']]]);
    }
    $this->putJson('/api/v1/siklus/siklus-arif-sawi/pengingat', ['tipe_aktif' => ['sekali' => true]] + $isi)->assertStatus(422);
    // Siklus petani lain: 404 (D-22).
    $lain = DB::table('siklus_tanam')->where('petani_id', '!=', 'petani-arif')->value('id');
    $this->putJson("/api/v1/siklus/{$lain}/pengingat", $isi)->assertStatus(404);
});

it('GET merek: laporan terbaru di kecamatan pengguna lebih dulu, tanpa laporan di akhir', function () {
    $data = $this->getJson('/api/v1/input/benih-sawi/merek')->assertOk()->json('data');
    expect(array_column(array_column($data, 'merek'), 'id'))->toBe(['merek-1', 'merek-2'])
        ->and($data[0])->toHaveKeys(['harga_kemasan', 'harga_per_satuan', 'jumlah_pelapor', 'hari_lalu'])
        ->and($data[0]['hari_lalu'])->toBe(9)
        ->and($data[0]['merek'])->not->toHaveKey('dibuat_pada');
    $this->getJson('/api/v1/input/tidak-ada/merek')->assertStatus(404);
});

it('POST jurnal: catatan atau foto wajib; hari ke dihitung dari tanggal tanam; terbaru dulu', function () {
    $this->postJson('/api/v1/siklus/siklus-arif-sawi/jurnal', ['tanggal' => '2026-10-10', 'catatan' => '  '])
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['catatan']]]);
    $tanam = DB::table('siklus_tanam')->where('id', 'siklus-arif-sawi')->value('tanggal_tanam');
    $hariIni = CarbonImmutable::now()->toDateString();
    // Jurnal contoh hari ini dibuat saat seeding; jurnal baru dibuat sesudahnya (urutan terbaru dulu).
    $this->travel(5)->seconds();
    $j = $this->postJson('/api/v1/siklus/siklus-arif-sawi/jurnal', ['tanggal' => $hariIni, 'catatan' => ' Daun mulai lebar '])
        ->assertOk()->json('data');
    expect($j['catatan'])->toBe('Daun mulai lebar')
        ->and($j['hari_ke'])->toBe((int) CarbonImmutable::parse($tanam)->diffInDays($hariIni))
        ->and($j['tugas_id'])->toBeNull();
    expect($this->getJson('/api/v1/siklus/siklus-arif-sawi/jurnal')->json('data.0.id'))->toBe($j['id']);
});

it('POST pengeluaran: idempoten, validasi nama, nominal, tanggal, dan rencana item milik siklus', function () {
    $isi = ['kunci_idempoten' => 'p-1', 'nama' => 'Tali rafia uji', 'nominal' => 25000, 'tanggal' => '2026-10-10'];
    $a = $this->postJson('/api/v1/siklus/siklus-arif-sawi/pengeluaran', $isi)->assertOk()->json('data');
    $b = $this->postJson('/api/v1/siklus/siklus-arif-sawi/pengeluaran', $isi)->assertOk()->json('data');
    expect($b['id'])->toBe($a['id'])->and($a['nominal'])->toBe(25000)->and($a['rencana_item_id'])->toBeNull();
    expect(DB::table('pengeluaran')->where('nama', 'Tali rafia uji')->count())->toBe(1);
    $this->postJson('/api/v1/siklus/siklus-arif-sawi/pengeluaran', ['kunci_idempoten' => 'p-2', 'nama' => '', 'nominal' => -1, 'tanggal' => 'x', 'rencana_item_id' => 'bukan'])
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['nama', 'nominal', 'tanggal', 'rencana_item_id']]])
        ->assertJsonPath('galat.rincian.nominal.0', 'Harga tidak boleh kurang dari nol');
});

it('POST tunda: geser tugas sejenis, tolak di luar 1–3 hari dan tugas yang tidak boleh digeser', function () {
    $sebelum = DB::table('tugas')->where('id', 'siklus-arif-sawi:pupuk-2@14')->value('tanggal');
    $r = $this->postJson('/api/v1/tugas/siklus-arif-sawi:pupuk-2@14/tunda', ['hari' => 2])->assertOk()->json('data');
    $sesudah = collect($r['tugas'])->firstWhere('id', 'siklus-arif-sawi:pupuk-2@14')['tanggal'];
    expect($r['diterapkan'])->toBeTrue()
        ->and(CarbonImmutable::parse($sesudah)->greaterThan(CarbonImmutable::parse($sebelum)))->toBeTrue();
    $this->postJson('/api/v1/tugas/siklus-arif-sawi:cek-hama@20/tunda', ['hari' => 4])
        ->assertStatus(422)->assertJsonPath('galat.kode', 'TUNDA_DI_LUAR_BATAS')->assertJsonStructure(['galat' => ['rincian' => ['hari']]]);
    $this->postJson('/api/v1/tugas/siklus-arif-sawi:panen@28/tunda', ['hari' => 1])
        ->assertStatus(422)->assertJsonPath('galat.kode', 'TIDAK_BOLEH_DIGESER');
    $this->postJson('/api/v1/tugas/tidak-ada/tunda', ['hari' => 1])->assertStatus(404);
});

it('POST akhiri: aktif menjadi selesai, simpan pendapatan nyata, dan hitung untung', function () {
    $this->postJson('/api/v1/siklus/siklus-arif-sawi/akhiri', ['pendapatan_nyata' => 700000])
        ->assertOk()
        ->assertJsonPath('data.siklus.status', 'selesai')
        ->assertJsonPath('data.siklus.pendapatan_nyata', 700000)
        ->assertJsonPath('data.untung_sebenarnya', 483000)
        ->assertJsonPath('data.untung_rencana', 320000);

    // Sudah selesai tidak boleh diakhiri lagi
    $this->postJson('/api/v1/siklus/siklus-arif-sawi/akhiri', ['pendapatan_nyata' => 100000])
        ->assertStatus(409)
        ->assertJsonPath('galat.kode', 'STATUS_TIDAK_SESUAI');

    // Nilai negatif ditolak
    $this->postJson('/api/v1/siklus/siklus-arif-hidro/akhiri', ['pendapatan_nyata' => -1000])
        ->assertStatus(422);
});
