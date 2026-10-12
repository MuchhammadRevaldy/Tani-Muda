<?php

namespace App\Http\Middleware;

use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

/**
 * Jam uji untuk rangkaian tes kontrak frontend terhadap backend lokal (D-58): header
 * `X-Tani-Muda-Waktu: <ISO 8601>` menyetel "sekarang" selama satu permintaan, seperti jam tiruan di
 * klien tiruan. Hanya berlaku saat APP_ENV=local atau testing; di lingkungan lain header ini
 * diabaikan.
 */
class JamUjiLokal
{
    public const HEADER = 'X-Tani-Muda-Waktu';

    public function handle(Request $request, Closure $next): Response
    {
        $waktu = $request->header(self::HEADER);
        if (! app()->environment('local', 'testing') || ! is_string($waktu) || $waktu === '') {
            return $next($request);
        }
        $saat = CarbonImmutable::parse($waktu);
        Carbon::setTestNow($saat);
        CarbonImmutable::setTestNow($saat);
        try {
            return $next($request);
        } finally {
            Carbon::setTestNow();
            CarbonImmutable::setTestNow();
        }
    }
}
