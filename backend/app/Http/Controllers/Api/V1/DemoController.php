<?php

namespace App\Http\Controllers\Api\V1;

use App\Console\Commands\AturUlangDemo;
use App\Domain\Otp\PengirimOtpLog;
use App\Http\Bentuk\BentukAkun;
use App\Http\Controllers\Controller;
use App\Http\Respons;
use App\Models\Pengguna;
use App\Support\NomorHp;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

/**
 * Endpoint demo lokal (kontrak-api.md 3.13, D-57): pemilih akun demo, panel kode uji, dan atur
 * ulang data untuk klien HTTP. Rutenya hanya didaftarkan saat APP_ENV=local (dan tes).
 */
class DemoController extends Controller
{
    /** GET /demo/pengguna */
    public function pengguna(): JsonResponse
    {
        $uji = DataContohSeeder::bacaBerkas('pengguna')['pengguna_uji'];
        $pengguna = Pengguna::whereIn('id', array_column($uji, 'pengguna_id'))->get()->keyBy('id');
        $hasil = [];
        foreach ($uji as $u) {
            $p = $pengguna->get($u['pengguna_id']);
            if ($p !== null) {
                $hasil[] = ['id' => $p->id, 'nama' => $p->nama ?? '', 'peran' => $p->peran->value ?? '', 'keterangan' => $u['keterangan']];
            }
        }

        return Respons::data($hasil);
    }

    /** POST /demo/masuk */
    public function masuk(Request $request): JsonResponse
    {
        $pengguna = Pengguna::findOrFail((string) $request->input('pengguna_id'));
        AuthController::masukkan($request, $pengguna);

        return Respons::data(BentukAkun::dari($pengguna));
    }

    /** GET /demo/kode-otp?nomor_hp= */
    public function kodeOtp(Request $request): JsonResponse
    {
        $nomorHp = NomorHp::normalisasi((string) $request->query('nomor_hp'));

        return Respons::data(['kode' => $nomorHp === null ? null : PengirimOtpLog::kodeTerakhir($nomorHp)]);
    }

    /** POST /demo/atur-ulang: data contoh dengan waktu relatif saat ini (D-47); sesi diakhiri. */
    public function aturUlang(Request $request): Response
    {
        AturUlangDemo::jalankan(CarbonImmutable::now());
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
