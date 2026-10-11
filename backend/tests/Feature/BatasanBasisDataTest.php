<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/*
 * Batasan yang ditegakkan basis data sendiri (T5.05–T5.07): CHECK, kunci unik, dan kunci asing.
 * MariaDB 10.4 menegakkan CHECK (D-25). Aplikasi tetap memvalidasi lebih dulu dengan pesan yang
 * jelas; batasan ini lapisan terakhir bila ada jalur yang terlewat.
 */
beforeEach(function () {
    $this->id = isiDataDasar();
});

/** Jalankan perubahan dan pastikan basis data menolaknya; kembalikan pesan galatnya. */
function ditolak(Closure $ubah): string
{
    try {
        DB::transaction($ubah);
    } catch (QueryException $e) {
        return $e->getMessage();
    }
    test()->fail('basis data menerima perubahan yang seharusnya ditolak');
}

it('data dasar yang sah diterima', function () {
    expect(DB::table('pengiriman')->count())->toBe(1);
});

it('harga dan jumlah negatif ditolak basis data', function (string $tabel, string $kolom, int|float $nilai, string $kunci) {
    $pesan = ditolak(fn () => DB::table($tabel)->where($kunci, $this->id[match ($tabel) {
        'komoditas' => 'komoditas', 'siklus_tanam' => 'siklus', 'pesanan' => 'pesanan', 'pengiriman' => 'kiriman',
    }])->update([$kolom => $nilai]));

    expect($pesan)->toMatch('/CONSTRAINT|Out of range|out of range/i');
})->with([
    'harga jual contoh komoditas' => ['komoditas', 'harga_jual_contoh', -1, 'id'],
    'harga jual siklus' => ['siklus_tanam', 'harga_jual', -6000, 'id'],
    'luas siklus' => ['siklus_tanam', 'luas_m2', -1.5, 'id'],
    'harga per kg pesanan' => ['pesanan', 'harga_per_kg', -1, 'id'],
    'jumlah per kiriman' => ['pesanan', 'jumlah_per_kiriman_kg', -10, 'id'],
    'jumlah kiriman' => ['pengiriman', 'jumlah_kg', -2, 'id'],
]);

it('dosis resep negatif ditolak', function () {
    expect(ditolak(fn () => DB::table('resep_input')->insert([
        'resep_id' => $this->id['resep'], 'id' => 'benih', 'urutan' => 1, 'nama' => 'Benih', 'grup' => 'benih',
        'dosis' => -0.5, 'satuan_dosis' => 'g', 'dasar_dosis' => 'per_m2', 'satuan_beli' => 'bungkus', 'ukuran_kemasan' => 1,
    ])))->toContain('resep_input_dosis_tidak_negatif');
});

it('alasan "lainnya" tanpa keterangan ditolak (D-14)', function (?string $keterangan) {
    expect(ditolak(fn () => DB::table('pengiriman')->where('id', $this->id['kiriman'])->update([
        'status' => 'ditolak_sebagian', 'jumlah_ditolak_kg' => 2, 'alasan_penolakan' => 'lainnya', 'keterangan_penolakan' => $keterangan,
    ])))->toContain('pengiriman_lainnya_wajib_keterangan');
})->with(['kosong' => [null], 'hanya spasi' => ['   ']]);

it('alasan "lainnya" dengan keterangan diterima', function () {
    DB::table('pengiriman')->where('id', $this->id['kiriman'])->update([
        'status' => 'ditolak_sebagian', 'jumlah_ditolak_kg' => 2, 'alasan_penolakan' => 'lainnya', 'keterangan_penolakan' => 'Ada batang patah',
    ]);
    expect(DB::table('pengiriman')->value('alasan_penolakan'))->toBe('lainnya');
});

it('jumlah ditolak lebih dari jumlah dikirim ditolak', function () {
    expect(ditolak(fn () => DB::table('pengiriman')->where('id', $this->id['kiriman'])->update([
        'status' => 'ditolak_sebagian', 'jumlah_ditolak_kg' => 10.5, 'alasan_penolakan' => 'jumlah_kurang',
    ])))->toContain('pengiriman_ditolak_tidak_melebihi_dikirim');
});

it('kunci idempoten pembayaran ganda ditolak', function () {
    $bayar = fn (string $id) => DB::table('pembayaran')->insert(['id' => $id, 'pesanan_id' => $this->id['pesanan'],
        'jenis' => 'uang_muka', 'nominal' => 48000, 'status' => 'ditahan', 'referensi' => "TIRUAN-{$id}", 'kunci_idempoten' => 'kunci-sama']);
    $bayar('bayar-1');

    expect(ditolak(fn () => $bayar('bayar-2')))->toContain('Duplicate');
});

it('satu resep per komoditas, metode, dan versi; versi baru diterima', function () {
    $resep = fn (string $id, int $versi) => DB::table('resep_tanam')->insert(['id' => $id, 'komoditas_id' => 'sawi',
        'metode_id' => 'bedengan', 'versi' => $versi, 'status' => 'draf', 'hasil_per_satuan' => 2.5, 'dasar_ukuran' => 'luas',
        'umur_panen_hari' => 28, 'standar_kualitas' => '[]']);

    expect(ditolak(fn () => $resep('resep-ganda', 1)))->toContain('Duplicate');
    $resep('resep-sawi-bedengan-v2', 2);
    expect(DB::table('resep_tanam')->where('komoditas_id', 'sawi')->count())->toBe(2);
});

it('metode tanam berupa data: metode baru cukup ditambah barisnya', function () {
    DB::table('metode_tanam')->insert(['id' => 'polybag', 'nama' => 'Polybag', 'dasar_ukuran' => 'polybag',
        'modal_awal' => 'rendah', 'kebutuhan_lahan' => 'Teras', 'frekuensi_perawatan' => 'Harian']);

    expect(DB::table('metode_tanam')->pluck('id')->all())->toContain('bedengan', 'polybag');
});

it('satu lahan boleh punya beberapa siklus aktif, dan siklus menyimpan versi resep', function () {
    DB::table('siklus_tanam')->insert(['id' => 'siklus-kedua', 'petani_id' => 'petani-uji', 'lahan_id' => 'lahan-uji',
        'resep_id' => 'resep-sawi-bedengan', 'resep_versi' => 1, 'komoditas_id' => 'sawi', 'metode_id' => 'bedengan',
        'status' => 'aktif', 'luas_m2' => 30, 'satuan_asli' => 'm2', 'nilai_asli' => 30, 'harga_jual' => 6000, 'perkiraan_panen_kg' => 75]);

    expect(DB::table('siklus_tanam')->where(['lahan_id' => 'lahan-uji', 'status' => 'aktif'])->count())->toBe(2)
        ->and(DB::table('siklus_tanam')->where('id', 'siklus-kedua')->value('resep_versi'))->toBe(1);
});

it('permintaan resep ganda ditolak, termasuk yang tanpa metode', function (?string $metode) {
    $minta = fn (string $id) => DB::table('permintaan_resep')->insert(['id' => $id, 'pengguna_id' => 'petani-uji',
        'komoditas_id' => 'sawi', 'metode_id' => $metode]);
    $minta('minta-1');

    expect(ditolak(fn () => $minta('minta-2')))->toContain('Duplicate');
})->with(['dengan metode' => ['bedengan'], 'tanpa metode' => [null]]);

it('rating di luar 1–5 atau untuk diri sendiri ditolak; rating kedua dari pemberi yang sama ditolak', function () {
    $rating = fn (string $id, int $nilai, string $penerima = 'petani-uji') => DB::table('rating')->insert(['id' => $id,
        'pengiriman_id' => 'kiriman-uji', 'pemberi_id' => 'pembeli-uji', 'penerima_id' => $penerima, 'nilai' => $nilai]);

    expect(ditolak(fn () => $rating('r-6', 6)))->toContain('rating_nilai_1_sampai_5')
        ->and(ditolak(fn () => $rating('r-diri', 5, 'pembeli-uji')))->toContain('rating_bukan_diri_sendiri');
    $rating('r-1', 5);
    expect(ditolak(fn () => $rating('r-2', 4)))->toContain('Duplicate');
});

it('lahan hidroponik wajib kapasitas lubang', function () {
    expect(ditolak(fn () => DB::table('lahan')->insert(['id' => 'hidro', 'petani_id' => 'petani-uji', 'nama' => 'Rak',
        'jenis_lahan' => 'hidroponik', 'luas_m2' => 12, 'satuan_asli' => 'm2', 'nilai_asli' => 12, 'wilayah_id' => '32.17.01.2003'])))
        ->toContain('lahan_hidroponik_wajib_lubang');
});

it('pembeli ditolak verifikasinya wajib punya alasan', function () {
    expect(ditolak(fn () => DB::table('profil_pembeli')->insert(['pengguna_id' => 'pembeli-uji', 'nama_usaha' => 'Katering',
        'jenis_usaha' => 'katering', 'alamat' => 'Lembang', 'wilayah_id' => '32.17.01.2003', 'status_verifikasi' => 'ditolak'])))
        ->toContain('profil_pembeli_alasan_wajib_bila_ditolak');
});

it('pilihan di luar enum ditolak', function () {
    expect(ditolak(fn () => DB::table('pengguna')->where('id', 'petani-uji')->update(['peran' => 'penyuluh'])))
        ->toMatch('/Data truncated|Incorrect|enum/i');
});

it('kunci asing menolak rujukan ke baris yang tidak ada', function () {
    expect(ditolak(fn () => DB::table('lahan')->insert(['id' => 'lahan-yatim', 'petani_id' => 'tidak-ada', 'nama' => 'X',
        'jenis_lahan' => 'kebun', 'luas_m2' => 1, 'satuan_asli' => 'm2', 'nilai_asli' => 1, 'wilayah_id' => '32.17.01.2003'])))
        ->toContain('foreign key constraint');
});

it('nomor HP unik', function () {
    expect(ditolak(fn () => DB::table('pengguna')->insert(['id' => 'kembar', 'nomor_hp' => '+6281200000001'])))
        ->toContain('Duplicate');
});
