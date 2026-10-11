<?php

use App\Domain\Invarian\InvarianPesanan;
use Illuminate\Support\Facades\DB;

/*
 * Invarian kolom turunan (tanggapan D-52): saldo_uang_muka, terambil_kg, dan nilai_diterima selalu
 * sama dengan hasil hitung ulang dari pembayaran dan alokasi.
 */
beforeEach(function () {
    isiDataDasar();
});

/** Kiriman ke-1 diterima penuh: 80% dari dana kiriman pembeli + 20% dari saldo uang muka (D-02). */
function konfirmasiKirimanPertama(int $dariUangMuka = 12000): void
{
    DB::table('pembayaran')->insert([
        ['id' => 'bayar-kiriman-1', 'pesanan_id' => 'pesanan-uji', 'pengiriman_id' => 'kiriman-uji', 'jenis' => 'kiriman',
            'nominal' => 48000, 'status' => 'cair', 'referensi' => 'TIRUAN-K1'],
        ['id' => 'cair-kiriman-1', 'pesanan_id' => 'pesanan-uji', 'pengiriman_id' => 'kiriman-uji', 'jenis' => 'pencairan',
            'nominal' => 48000, 'status' => 'cair', 'referensi' => 'TIRUAN-K1'],
        ['id' => 'cair-uang-muka-1', 'pesanan_id' => 'pesanan-uji', 'pengiriman_id' => 'kiriman-uji', 'jenis' => 'pencairan',
            'nominal' => $dariUangMuka, 'status' => 'cair', 'referensi' => 'TIRUAN-UM-UJI'],
    ]);
    DB::table('pengiriman')->where('id', 'kiriman-uji')->update(['status' => 'diterima', 'nilai_diterima' => 48000 + $dariUangMuka]);
    DB::table('pesanan')->where('id', 'pesanan-uji')->update(['saldo_uang_muka' => 48000 - $dariUangMuka]);
}

it('data dasar memenuhi semua invarian', function () {
    expect(InvarianPesanan::periksa())->toBe([]);
});

it('setelah kiriman dikonfirmasi: saldo berkurang sebesar pencairan dari uang muka, dana diterima = pencairan', function () {
    konfirmasiKirimanPertama();

    expect(InvarianPesanan::periksa())->toBe([]);
});

it('menangkap saldo uang muka yang tidak ikut berkurang', function () {
    konfirmasiKirimanPertama();
    DB::table('pesanan')->where('id', 'pesanan-uji')->update(['saldo_uang_muka' => 48000]);

    expect(InvarianPesanan::periksa())->toBe(['pesanan-uji: saldo_uang_muka 48000, seharusnya 36000']);
});

it('menangkap dana diterima yang tidak sama dengan pencairan', function () {
    konfirmasiKirimanPertama();
    DB::table('pengiriman')->where('id', 'kiriman-uji')->update(['nilai_diterima' => 50000]);

    expect(InvarianPesanan::periksa())->toBe(['kiriman-uji: nilai_diterima 50000, seharusnya 60000']);
});

it('kiriman yang belum dikonfirmasi tidak boleh punya dana diterima', function () {
    DB::table('pengiriman')->where('id', 'kiriman-uji')->update(['nilai_diterima' => 0]);

    expect(InvarianPesanan::periksa())->toBe(['kiriman-uji: nilai_diterima 0, seharusnya null']);
});

it('alokasi yang dibatalkan tidak lagi dihitung terambil', function () {
    DB::table('alokasi_pesanan')->where('id', 'alokasi-uji')->update(['status' => 'dibatalkan']);

    expect(InvarianPesanan::periksa())->toBe(['pesanan-uji: terambil_kg 10.00, seharusnya 0'])
        ->and(InvarianPesanan::periksa(['pesanan-lain']))->toBe([]);
});

it('pengembalian dan kompensasi dari uang muka mengurangi saldo; pembayaran gagal tidak dihitung', function () {
    DB::table('pembayaran')->insert([
        ['id' => 'kembali', 'pesanan_id' => 'pesanan-uji', 'jenis' => 'pengembalian', 'nominal' => 8000,
            'status' => 'dikembalikan', 'referensi' => 'TIRUAN-UM-UJI'],
        ['id' => 'kompensasi', 'pesanan_id' => 'pesanan-uji', 'jenis' => 'kompensasi', 'nominal' => 40000,
            'status' => 'cair', 'referensi' => 'TIRUAN-UM-UJI'],
        ['id' => 'um-gagal', 'pesanan_id' => 'pesanan-uji', 'jenis' => 'uang_muka', 'nominal' => 48000,
            'status' => 'gagal', 'referensi' => 'TIRUAN-UM-GAGAL'],
    ]);
    DB::table('pesanan')->where('id', 'pesanan-uji')->update(['saldo_uang_muka' => 0]);

    expect(InvarianPesanan::periksa())->toBe([]);
});
