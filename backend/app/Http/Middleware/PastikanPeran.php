<?php

namespace App\Http\Middleware;

use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * `peran:petani`, `peran:pembeli`, `peran:mentor,admin` (arsitektur-backend.md bagian 6). Dipasang
 * setelah `auth:sanctum`. Peran kosong → 403 PERAN_BELUM_DIPILIH; peran lain → 403 TIDAK_DIIZINKAN.
 */
class PastikanPeran
{
    public function handle(Request $request, Closure $next, string ...$peran): Response
    {
        /** @var Pengguna $pengguna */
        $pengguna = $request->user();
        if ($pengguna->peran === null) {
            throw new GalatApi('PERAN_BELUM_DIPILIH');
        }
        if (! in_array($pengguna->peran->value, $peran, true)) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        return $next($request);
    }
}
