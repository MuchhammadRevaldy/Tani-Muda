<?php

/*
 * Kirim satu permintaan GET ke aplikasi dengan APP_ENV dari lingkungan proses (DemoLokalTest).
 * Argumen: jalur. Mencetak JSON berisi status dan kode galat.
 */

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$respons = $app->make(Kernel::class)->handle(Request::create($argv[1], 'GET', server: ['HTTP_ACCEPT' => 'application/json']));
echo json_encode([
    'lingkungan' => $app->environment(),
    'status' => $respons->getStatusCode(),
    'kode' => json_decode((string) $respons->getContent(), true)['galat']['kode'] ?? null,
]);
