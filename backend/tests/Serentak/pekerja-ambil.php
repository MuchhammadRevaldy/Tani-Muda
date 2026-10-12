<?php

/*
 * Pekerja untuk AmbilPesananSerentakTest. Argumen pertama:
 * - `tahan <ms>`: kunci baris pesanan-kafe-bayam, tambahkan alokasi 3 kg petani lain, tunggu, commit;
 * - `ambil`: panggil POST /api/v1/pesanan/pesanan-kafe-bayam/ambil 3 kg sebagai petani-arif.
 * Mencetak JSON berisi status, kode galat, dan waktu mulai/selesai.
 */

use App\Models\Pengguna;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Contracts\Http\Kernel as KernelHttp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

[, $mode, $lamaMs] = $argv + [2 => '0'];
$mulai = microtime(true);

if ($mode === 'tahan') {
    DB::transaction(function () use ($lamaMs) {
        DB::table('pesanan')->where('id', 'pesanan-kafe-bayam')->lockForUpdate()->first();
        DB::table('alokasi_pesanan')->insert(['id' => 'alokasi-serentak', 'pesanan_id' => 'pesanan-kafe-bayam',
            'petani_id' => 'petani-dewi', 'jumlah_kg' => 3, 'status' => 'menunggu_kesepakatan', 'dibuat_pada' => now()]);
        usleep((int) $lamaMs * 1000);
    });
    echo json_encode(['mulai' => $mulai, 'selesai' => microtime(true)]);
    exit;
}

Sanctum::actingAs(Pengguna::findOrFail('petani-arif'));
$respons = $app->make(KernelHttp::class)->handle(Request::create('/api/v1/pesanan/pesanan-kafe-bayam/ambil', 'POST', server: [
    'HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json',
], content: json_encode(['kunci_idempoten' => 'serentak-1', 'jumlah_kg' => 3, 'lahan_id' => 'lahan-arif-kebun'])));
echo json_encode([
    'status' => $respons->getStatusCode(),
    'kode' => json_decode((string) $respons->getContent(), true)['galat']['kode'] ?? null,
    'mulai' => $mulai,
    'selesai' => microtime(true),
]);
