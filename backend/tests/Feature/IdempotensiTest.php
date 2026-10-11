<?php

use App\Domain\Idempotensi\Idempotensi;
use Illuminate\Support\Facades\DB;

/*
 * Kunci idempoten di transaksi yang sama dengan operasi uang (D-54). Uji serentak dengan dua proses
 * ada di tests/Serentak/IdempotensiSerentakTest.php.
 */

function bayarUji(string $id): Closure
{
    return function () use ($id) {
        DB::table('pembayaran')->insert(['id' => $id, 'pesanan_id' => 'pesanan-uji', 'jenis' => 'pencairan',
            'nominal' => 1000, 'status' => 'cair', 'referensi' => 'TIRUAN-UM-UJI']);

        return ['status' => 201, 'respons' => ['data' => ['id' => $id]]];
    };
}

it('(b) permintaan yang gagal di tengah transaksi bisa diulang dengan kunci yang sama', function () {
    isiDataDasar();
    $gagal = function () {
        bayarUji('bayar-setengah')();
        throw new RuntimeException('gerbang pembayaran putus');
    };

    expect(fn () => Idempotensi::jalankan('pembeli-uji', 'uji/bayar', 'kunci-1', $gagal))
        ->toThrow(RuntimeException::class, 'gerbang pembayaran putus');
    // Pembayaran setengah jadi dan baris kuncinya ikut di-rollback: tidak ada kunci yatim.
    expect(DB::table('pembayaran')->where('id', 'bayar-setengah')->exists())->toBeFalse()
        ->and(DB::table('kunci_idempoten')->count())->toBe(0);

    $ulang = Idempotensi::jalankan('pembeli-uji', 'uji/bayar', 'kunci-1', bayarUji('bayar-ulang'));
    expect($ulang)->toBe(['status' => 201, 'respons' => ['data' => ['id' => 'bayar-ulang']], 'diulang' => false]);

    // Permintaan berikutnya dengan kunci yang sama tidak menjalankan operasi lagi.
    $dijalankan = false;
    $lagi = Idempotensi::jalankan('pembeli-uji', 'uji/bayar', 'kunci-1', function () use (&$dijalankan) {
        $dijalankan = true;

        return ['status' => 500, 'respons' => []];
    });
    expect($dijalankan)->toBeFalse()
        ->and($lagi)->toBe(['status' => 201, 'respons' => ['data' => ['id' => 'bayar-ulang']], 'diulang' => true])
        ->and(DB::table('pembayaran')->where('jenis', 'pencairan')->count())->toBe(1)
        ->and(DB::table('kunci_idempoten')->value('status_http'))->toBe(201);
});

it('kunci sama di endpoint atau pengguna lain adalah permintaan berbeda', function () {
    isiDataDasar();
    Idempotensi::jalankan('pembeli-uji', 'uji/bayar', 'kunci-1', bayarUji('bayar-a'));
    $lain = Idempotensi::jalankan('pembeli-uji', 'uji/kembalikan', 'kunci-1', bayarUji('bayar-b'));
    $orang = Idempotensi::jalankan('petani-uji', 'uji/bayar', 'kunci-1', bayarUji('bayar-c'));

    expect([$lain['diulang'], $orang['diulang']])->toBe([false, false])
        ->and(DB::table('kunci_idempoten')->count())->toBe(3);
});
