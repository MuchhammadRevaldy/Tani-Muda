<?php

/*
 * Kirim satu permintaan dengan header jam uji ke rute sementara yang mengembalikan now(), dengan
 * APP_ENV dari lingkungan proses (JamUjiLokalTest). Argumen: waktu ISO 8601. Mencetak JSON.
 */

use App\Http\Middleware\JamUjiLokal;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
Route::middleware('api')->get('/api/uji-jam', fn () => ['sekarang' => now()->toIso8601String()]);
$respons = $kernel->handle(Request::create('/api/uji-jam', 'GET', server: [
    'HTTP_ACCEPT' => 'application/json',
    'HTTP_'.strtoupper(str_replace('-', '_', JamUjiLokal::HEADER)) => $argv[1],
]));
echo json_encode([
    'lingkungan' => $app->environment(),
    'sekarang' => json_decode((string) $respons->getContent(), true)['sekarang'] ?? null,
]);
