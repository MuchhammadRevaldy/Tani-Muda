<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/*
 * Aturan hapus kunci asing (tanggapan D-52, arsitektur-backend.md bagian 7):
 * - baris uang dan transaksi tidak pernah dihapus, cukup diberi status, jadi semua kunci asing di
 *   tabel transaksi dan yang menunjuk ke sana memakai RESTRICT;
 * - siklus menahan lahan dan versi resepnya (P0-04; DELETE /lahan ditolak bila masih dipakai);
 * - CASCADE hanya untuk anak yang tidak bermakna tanpa induknya.
 */
const TABEL_TRANSAKSI = ['pesanan', 'alokasi_pesanan', 'pengiriman', 'pembayaran', 'rating', 'sengketa', 'stok', 'pesanan_stok'];

/** Anak yang boleh ikut terhapus bersama induknya: tabel.kolom. */
const BOLEH_CASCADE = [
    'profil_pembeli.pengguna_id', 'lahan.petani_id', 'anggota_kelompok_tani.kelompok_id', 'anggota_kelompok_tani.petani_id',
    'konversi_satuan.wilayah_id', 'merek_input.input_id', 'laporan_harga.merek_id', 'laporan_harga.pelapor_id',
    'kelayakan_subsidi.input_id', 'kelayakan_subsidi.komoditas_id', 'promo.wilayah_id', 'resep_input.resep_id',
    'resep_tugas.resep_id', 'progres_modul.pengguna_id', 'progres_modul.modul_id', 'permintaan_resep.pengguna_id',
    'rencana_item.siklus_id', 'tugas.siklus_id', 'hasil_pengukuran.tugas_id', 'hasil_pengukuran.siklus_id',
    'jurnal.siklus_id', 'pengaturan_pengingat.siklus_id', 'log_notifikasi.pengguna_id', 'kunci_idempoten.pengguna_id',
    'lencana_pengguna.pengguna_id', 'pengetahuan_potongan.sumber_id', 'obrolan_bot.pengguna_id',
    'pesan.percakapan_id',
];

/** @return list<object{tabel: string, kolom: string, induk: string, aturan: string}> */
function kunciAsing(): array
{
    return DB::select(<<<'SQL'
        SELECT k.TABLE_NAME AS tabel, k.COLUMN_NAME AS kolom, k.REFERENCED_TABLE_NAME AS induk, r.DELETE_RULE AS aturan
        FROM information_schema.KEY_COLUMN_USAGE k
        JOIN information_schema.REFERENTIAL_CONSTRAINTS r
          ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND r.TABLE_NAME = k.TABLE_NAME
        WHERE k.TABLE_SCHEMA = DATABASE() AND k.REFERENCED_TABLE_NAME IS NOT NULL
        SQL);
}

function hapusDitolak(string $tabel, string $id): string
{
    try {
        DB::transaction(fn () => DB::table($tabel)->where('id', $id)->delete());
    } catch (QueryException $e) {
        return $e->getMessage();
    }
    test()->fail("{$tabel} {$id} terhapus padahal masih dirujuk");
}

beforeEach(function () {
    $this->id = isiDataDasar();
});

it('menghapus pesanan yang punya pembayaran ditolak basis data', function () {
    DB::table('pembayaran')->insert(['id' => 'bayar-uji', 'pesanan_id' => 'pesanan-uji', 'jenis' => 'uang_muka',
        'nominal' => 48000, 'status' => 'ditahan', 'referensi' => 'TIRUAN-1']);

    expect(hapusDitolak('pesanan', 'pesanan-uji'))->toContain('foreign key constraint')
        ->and(DB::table('pembayaran')->where('id', 'bayar-uji')->exists())->toBeTrue();
});

it('baris transaksi yang dirujuk tidak bisa dihapus', function (string $tabel, string $id) {
    expect(hapusDitolak($tabel, $id))->toContain('foreign key constraint');
})->with([
    'alokasi yang punya kiriman' => ['alokasi_pesanan', 'alokasi-uji'],
    'pesanan yang punya alokasi' => ['pesanan', 'pesanan-uji'],
    'pembeli yang punya pesanan' => ['pengguna', 'pembeli-uji'],
]);

it('lahan dan versi resep yang dipakai siklus tidak bisa dihapus (P0-04)', function () {
    expect(hapusDitolak('lahan', 'lahan-uji'))->toContain('foreign key constraint')
        ->and(hapusDitolak('resep_tanam', 'resep-sawi-bedengan'))->toContain('foreign key constraint');
});

it('alokasi yang dipakai siklus tidak bisa dihapus; siklus tidak kehilangan pesanannya', function () {
    DB::table('pengiriman')->delete();
    DB::table('siklus_tanam')->where('id', 'siklus-uji')->update(['alokasi_pesanan_id' => 'alokasi-uji']);

    expect(hapusDitolak('alokasi_pesanan', 'alokasi-uji'))->toContain('foreign key constraint');
});

it('anak yang tidak bermakna tanpa induk ikut terhapus: resep tanpa siklus beserta input dan tugasnya', function () {
    DB::table('resep_tanam')->insert(['id' => 'resep-cadangan', 'komoditas_id' => 'sawi', 'metode_id' => 'bedengan', 'versi' => 9,
        'status' => 'draf', 'hasil_per_satuan' => 2, 'dasar_ukuran' => 'luas', 'umur_panen_hari' => 28, 'standar_kualitas' => '[]']);
    DB::table('resep_tugas')->insert(['resep_id' => 'resep-cadangan', 'id' => 'siram', 'urutan' => 1, 'judul' => 'Siram',
        'tipe' => 'berulang', 'hst_mulai' => 0]);

    DB::table('resep_tanam')->where('id', 'resep-cadangan')->delete();

    expect(DB::table('resep_tugas')->where('resep_id', 'resep-cadangan')->exists())->toBeFalse();
});

it('semua kunci asing di tabel transaksi dan yang menunjuk ke sana memakai RESTRICT', function () {
    $salah = array_filter(kunciAsing(), fn ($k) => (in_array($k->tabel, TABEL_TRANSAKSI, true) || in_array($k->induk, TABEL_TRANSAKSI, true))
        && $k->aturan !== 'RESTRICT');

    expect(array_map(fn ($k) => "{$k->tabel}.{$k->kolom} → {$k->induk}: {$k->aturan}", array_values($salah)))->toBe([]);
});

it('siklus menahan lahan, resep, dan alokasi; pengeluaran menahan siklus', function () {
    $aturan = collect(kunciAsing())->mapWithKeys(fn ($k) => ["{$k->tabel}.{$k->kolom}" => $k->aturan]);

    expect($aturan->only(['siklus_tanam.lahan_id', 'siklus_tanam.resep_id', 'siklus_tanam.alokasi_pesanan_id', 'pengeluaran.siklus_id'])->unique()->values()->all())
        ->toBe(['RESTRICT']);
});

it('CASCADE hanya untuk anak yang terdaftar', function () {
    $cascade = collect(kunciAsing())->where('aturan', 'CASCADE')->map(fn ($k) => "{$k->tabel}.{$k->kolom}")->sort()->values()->all();

    expect($cascade)->toBe(collect(BOLEH_CASCADE)->sort()->values()->all());
});

it('setiap kolom kunci asing dan kunci utama string memakai ascii_bin', function () {
    $kolom = DB::select(<<<'SQL'
        SELECT DISTINCT c.TABLE_NAME AS tabel, c.COLUMN_NAME AS kolom, c.COLLATION_NAME AS collation
        FROM information_schema.COLUMNS c
        JOIN information_schema.KEY_COLUMN_USAGE k
          ON k.TABLE_SCHEMA = c.TABLE_SCHEMA AND k.TABLE_NAME = c.TABLE_NAME AND k.COLUMN_NAME = c.COLUMN_NAME
        WHERE c.TABLE_SCHEMA = DATABASE() AND c.DATA_TYPE = 'varchar'
          AND (k.REFERENCED_TABLE_NAME IS NOT NULL OR k.CONSTRAINT_NAME = 'PRIMARY')
          AND c.TABLE_NAME NOT IN ('migrations', 'cache', 'cache_locks', 'sessions', 'jobs', 'job_batches', 'failed_jobs', 'konfigurasi')
        SQL);

    expect(count($kolom))->toBeGreaterThan(60)
        ->and(array_values(array_map(fn ($c) => "{$c->tabel}.{$c->kolom}: {$c->collation}", array_filter($kolom, fn ($c) => $c->collation !== 'ascii_bin'))))
        ->toBe([]);
});
