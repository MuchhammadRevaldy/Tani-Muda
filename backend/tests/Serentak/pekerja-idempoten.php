<?php

/*
 * Pekerja untuk IdempotensiSerentakTest: satu proses PHP = satu permintaan. Argumen: kunci, lama
 * operasi (ms), dan `gagal` bila operasi harus melempar galat setelah menulis pembayaran.
 * Mencetak JSON hasil Idempotensi::jalankan beserta waktu mulai dan selesai.
 */

use App\Domain\Idempotensi\Idempotensi;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

[, $kunci, $lamaMs, $mode] = $argv + [3 => 'berhasil'];

$mulai = microtime(true);
try {
    $hasil = Idempotensi::jalankan('pembeli-uji', 'uji/bayar', $kunci, function () use ($lamaMs, $mode) {
        $id = 'bayar-'.Str::lower((string) Str::ulid());
        DB::table('pembayaran')->insert(['id' => $id, 'pesanan_id' => 'pesanan-uji', 'jenis' => 'pencairan',
            'nominal' => 1000, 'status' => 'cair', 'referensi' => 'TIRUAN-UM-UJI']);
        usleep((int) $lamaMs * 1000);
        if ($mode === 'gagal') {
            throw new RuntimeException('gagal di tengah transaksi');
        }

        return ['status' => 201, 'respons' => ['data' => ['id' => $id]]];
    });
} catch (RuntimeException $e) {
    $hasil = ['galat' => $e->getMessage()];
}

echo json_encode($hasil + ['mulai' => $mulai, 'selesai' => microtime(true)]);
