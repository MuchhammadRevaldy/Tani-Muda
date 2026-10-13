<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;

/**
 * Endpoint kontrak yang belum dikerjakan di backend ([AG-19]): dijawab 501 `BELUM_TERSEDIA` dengan
 * pesan "Fitur ini belum tersedia di versi demo", bukan 404 yang tampil sebagai galat umum.
 * Daftarnya di routes/api.php (`$endpointBelumTersedia`); hapus baris di sana saat endpoint dibuat.
 */
class BelumTersediaController extends Controller
{
    public function __invoke(): never
    {
        throw new GalatApi('BELUM_TERSEDIA');
    }
}
