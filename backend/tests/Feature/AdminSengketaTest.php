<?php

use App\Domain\Invarian\InvarianPesanan;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\DB;

/* Panel admin, sengketa kiriman: daftar dan putuskan (kontrak 3.10, P0-25, D-46) [AG-51]. */

beforeEach(function () {
    DataContohSeeder::isi(CarbonImmutable::now());
});

function masukSebagaiAdminSengketa(string $id): void
{
    test()->postJson('/api/v1/demo/masuk', ['pengguna_id' => $id])->assertOk();
    app('auth')->forgetGuards();
}

/** Jumlah baris pembayaran untuk kiriman sengketa-1 menurut jenis. */
function bayarSengketa1(string $jenis): int
{
    return DB::table('pembayaran')->where('pengiriman_id', 'kiriman-imas-arif-2')->where('jenis', $jenis)->count();
}

it('daftar sengketa: lengkap dengan kiriman dan nama, bisa disaring status', function () {
    masukSebagaiAdminSengketa('admin-tani');
    $data = $this->getJson('/api/v1/admin/sengketa')->assertOk()->json('data');
    expect($data)->toHaveCount(1)
        ->and($data[0])->toHaveKeys(['id', 'pengiriman_id', 'status', 'keputusan', 'catatan', 'dibuat_pada', 'diputuskan_pada', 'pengiriman', 'nama_petani', 'nama_pembeli'])
        ->and($data[0]['pengiriman']['id'])->toBe('kiriman-imas-arif-2')
        ->and($data[0]['nama_petani'])->toBe('Arif Setiawan')
        ->and($data[0]['nama_pembeli'])->toBe(DB::table('pengguna')->where('id', 'pembeli-imas')->value('nama'));
    $this->getJson('/api/v1/admin/sengketa?status=terbuka')->assertOk()->assertJsonCount(1, 'data');
    $this->getJson('/api/v1/admin/sengketa?status=diputuskan')->assertOk()->assertJsonCount(0, 'data');
    $this->getJson('/api/v1/admin/sengketa?status=entah')->assertStatus(422);
});

it('cairkan ke petani: sisa dana kiriman + bagian uang muka cair sekali; putusan kedua 409 tanpa pencairan ganda', function () {
    masukSebagaiAdminSengketa('admin-tani');
    $saldoAwal = DB::table('pesanan')->where('id', 'pesanan-imas-bayam')->value('saldo_uang_muka');
    $nilaiAwal = DB::table('pengiriman')->where('id', 'kiriman-imas-arif-2')->value('nilai_diterima');
    $pencairanAwal = bayarSengketa1('pencairan');
    $totalCairAwal = (int) DB::table('pembayaran')->where('pengiriman_id', 'kiriman-imas-arif-2')->where('jenis', 'pencairan')->sum('nominal');

    $this->postJson('/api/v1/admin/sengketa/sengketa-1/putuskan', ['keputusan' => 'entah'])
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['keputusan']]]);
    $this->postJson('/api/v1/admin/sengketa/tidak-ada/putuskan', ['keputusan' => 'cairkan_ke_petani'])->assertStatus(404);

    $this->postJson('/api/v1/admin/sengketa/sengketa-1/putuskan', ['keputusan' => 'cairkan_ke_petani', 'catatan' => ' Foto petani jelas '])
        ->assertOk()
        ->assertJsonPath('data.status', 'diputuskan')
        ->assertJsonPath('data.keputusan', 'cairkan_ke_petani')
        ->assertJsonPath('data.catatan', 'Foto petani jelas');

    // 1 kg ditolak × Rp6.000: sisa kiriman Rp4.800 (80%) + bagian uang muka Rp1.200 (20%).
    expect(bayarSengketa1('pencairan'))->toBe($pencairanAwal + 2)
        ->and((int) DB::table('pembayaran')->where('pengiriman_id', 'kiriman-imas-arif-2')->where('jenis', 'pencairan')->sum('nominal') - $totalCairAwal)->toBe(6000)
        ->and(DB::table('pesanan')->where('id', 'pesanan-imas-bayam')->value('saldo_uang_muka'))->toBe($saldoAwal - 1200)
        ->and(DB::table('pengiriman')->where('id', 'kiriman-imas-arif-2')->value('nilai_diterima'))->toBe($nilaiAwal + 6000)
        ->and(DB::table('pembayaran')->where('pengiriman_id', 'kiriman-imas-arif-2')->where('jenis', 'kiriman')->value('status'))->toBe('cair')
        ->and(InvarianPesanan::periksa())->toBe([]);

    // Idempoten: putusan kedua (apa pun isinya) ditolak dan tidak mengubah uang.
    foreach (['cairkan_ke_petani', 'kembalikan_ke_pembeli'] as $k) {
        $this->postJson('/api/v1/admin/sengketa/sengketa-1/putuskan', ['keputusan' => $k])
            ->assertStatus(409)->assertJsonPath('galat.kode', 'STATUS_TIDAK_SESUAI');
    }
    expect(bayarSengketa1('pencairan'))->toBe($pencairanAwal + 2)
        ->and(bayarSengketa1('pengembalian'))->toBe(0)
        ->and(DB::table('sengketa')->where('id', 'sengketa-1')->value('keputusan'))->toBe('cairkan_ke_petani');
});

it('kembalikan ke pembeli: sisa dana kiriman kembali, uang muka tidak berubah', function () {
    masukSebagaiAdminSengketa('admin-tani');
    $saldoAwal = DB::table('pesanan')->where('id', 'pesanan-imas-bayam')->value('saldo_uang_muka');
    $this->postJson('/api/v1/admin/sengketa/sengketa-1/putuskan', ['keputusan' => 'kembalikan_ke_pembeli'])
        ->assertOk()->assertJsonPath('data.keputusan', 'kembalikan_ke_pembeli')->assertJsonPath('data.catatan', null);
    $kembali = DB::table('pembayaran')->where('pengiriman_id', 'kiriman-imas-arif-2')->where('jenis', 'pengembalian')->get();
    expect($kembali)->toHaveCount(1)
        ->and($kembali[0]->nominal)->toBe(4800)
        ->and($kembali[0]->status)->toBe('dikembalikan')
        ->and(DB::table('pesanan')->where('id', 'pesanan-imas-bayam')->value('saldo_uang_muka'))->toBe($saldoAwal)
        ->and(DB::table('pembayaran')->where('pengiriman_id', 'kiriman-imas-arif-2')->where('jenis', 'kiriman')->value('status'))->toBe('dikembalikan')
        ->and(InvarianPesanan::periksa())->toBe([]);
    $this->getJson('/api/v1/admin/sengketa?status=diputuskan')->assertOk()->assertJsonCount(1, 'data');
});

it('hanya admin: peran lain 403, tanpa sesi 401', function () {
    $this->getJson('/api/v1/admin/sengketa')->assertStatus(401);
    foreach (['petani-arif', 'pembeli-imas', 'mentor-rahmat'] as $id) {
        masukSebagaiAdminSengketa($id);
        $this->getJson('/api/v1/admin/sengketa')->assertStatus(403)->assertJsonPath('galat.kode', 'TIDAK_DIIZINKAN');
        $this->postJson('/api/v1/admin/sengketa/sengketa-1/putuskan', ['keputusan' => 'cairkan_ke_petani'])->assertStatus(403);
    }
    expect(DB::table('sengketa')->where('id', 'sengketa-1')->value('status'))->toBe('terbuka');
});
