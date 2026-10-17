<?php

use App\Http\Galat\PenerjemahGalat;
use App\Http\Middleware\JamUjiLokal;
use App\Http\Middleware\PastikanPeran;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(fn () => null);
        // Sanctum mode SPA: permintaan dari SANCTUM_STATEFUL_DOMAINS memakai cookie sesi (D-21).
        $middleware->statefulApi();
        $middleware->alias(['peran' => PastikanPeran::class]);
        // Jam uji tes kontrak (D-58): hanya berlaku di lingkungan lokal dan tes.
        $middleware->api(prepend: [JamUjiLokal::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Semua galat di /api/* dijawab dengan format kontrak { galat: { kode, pesan, rincian } }.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->render(
            fn (Throwable $e, Request $request) => $request->is('api/*') || $request->expectsJson()
                ? PenerjemahGalat::keRespons($e)
                : null,
        );
    })->create();
