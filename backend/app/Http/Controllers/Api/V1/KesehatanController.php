<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * GET /api/v1/kesehatan: tanda backend hidup dan tersambung ke basis data. Tanpa masuk, tanpa
 * data pengguna. Bila basis data tidak terjangkau: 503 SUMBER_BELUM_TERSEDIA.
 */
class KesehatanController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::select('select 1');
        } catch (Throwable $e) {
            report($e);
            throw new GalatApi('SUMBER_BELUM_TERSEDIA');
        }

        return Respons::data([
            'status' => 'sehat',
            'basis_data' => 'tersambung',
            'waktu' => Date::now(),
        ]);
    }
}
