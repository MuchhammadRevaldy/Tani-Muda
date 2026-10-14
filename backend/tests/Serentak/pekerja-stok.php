<?php

/*
 * Pekerja untuk StokSerentakTest. Argumen:
 * - mode: `tahan` atau `beli`
 * - stok_id
 * - jumlah_kg
 * - pembeli_id
 * - lama_ms (khusus tahan)
 */

use App\Models\Pengguna;
use App\Models\PesananStok;
use App\Models\Stok;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Contracts\Http\Kernel as KernelHttp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

[, $mode, $stokId, $jumlahKg, $pembeliId, $lamaMs] = $argv + [2 => '', 3 => '5', 4 => 'pembeli-ratna', 5 => '0'];
$mulai = microtime(true);
$jumlahBeli = (float) $jumlahKg;

if ($mode === 'tahan') {
    DB::transaction(function () use ($stokId, $jumlahBeli, $pembeliId, $lamaMs) {
        $stok = Stok::where('id', $stokId)->lockForUpdate()->firstOrFail();
        if ($stok->sisa_kg >= $jumlahBeli) {
            $stok->sisa_kg = round($stok->sisa_kg - $jumlahBeli, 2);
            if ($stok->sisa_kg <= 0) {
                $stok->status = 'habis';
            }
            $stok->save();

            PesananStok::create([
                'id' => 'pesanan-stok-serentak-tahan',
                'pembeli_id' => $pembeliId,
                'stok_id' => $stok->id,
                'petani_id' => $stok->petani_id,
                'jumlah_kg' => $jumlahBeli,
                'harga_per_kg' => $stok->harga_per_kg,
                'nilai' => (int) round($jumlahBeli * $stok->harga_per_kg),
                'metode_bayar' => 'cod',
                'alamat_antar' => 'Alamat Uji Tahan',
                'status' => 'menunggu',
            ]);
        }
        usleep((int) $lamaMs * 1000);
    });

    echo json_encode(['mulai' => $mulai, 'selesai' => microtime(true), 'status' => 200]);
    exit;
}

Sanctum::actingAs(Pengguna::findOrFail($pembeliId));
$respons = $app->make(KernelHttp::class)->handle(Request::create("/api/v1/stok/{$stokId}/beli", 'POST', server: [
    'HTTP_ACCEPT' => 'application/json',
    'CONTENT_TYPE' => 'application/json',
], content: json_encode([
    'jumlah_kg' => $jumlahBeli,
    'metode_bayar' => 'cod',
    'alamat_antar' => 'Alamat Uji Beli',
])));

$isi = json_decode((string) $respons->getContent(), true) ?: [];
echo json_encode([
    'status' => $respons->getStatusCode(),
    'kode' => $isi['galat']['kode'] ?? null,
    'mulai' => $mulai,
    'selesai' => microtime(true),
]);
