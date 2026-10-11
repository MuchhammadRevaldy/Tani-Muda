<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Otp\LayananOtp;
use App\Http\Bentuk\BentukAkun;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Pengguna;
use App\Support\Konfigurasi;
use App\Support\NomorHp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Masuk dengan nomor HP dan OTP (kontrak-api.md 3.1, arsitektur-backend.md bagian 5, D-04, D-21):
 * sesi cookie Sanctum untuk aplikasi web.
 */
class AuthController extends Controller
{
    public function __construct(private readonly LayananOtp $otp) {}

    /** POST /auth/otp/kirim */
    public function kirim(Request $request): JsonResponse
    {
        return Respons::data($this->otp->kirim(NomorHp::wajib($request->input('nomor_hp'))));
    }

    /** POST /auth/otp/verifikasi */
    public function verifikasi(Request $request): JsonResponse
    {
        $nomorHp = NomorHp::wajib($request->input('nomor_hp'));
        $pengguna = Pengguna::where('nomor_hp', $nomorHp)->first();
        // Pengguna baru wajib menyetujui kebijakan privasi (D-30); dicek sebelum kode dipakai.
        if ($pengguna === null && $request->input('setuju_privasi') !== true) {
            throw GalatApi::validasi(['setuju_privasi' => 'PRIVASI_WAJIB']);
        }
        $kode = $request->input('kode');
        if (! is_string($kode) || ! preg_match('/^\d{6}$/', $kode)) {
            throw GalatApi::validasi(['kode' => 'OTP_SALAH']);
        }
        $this->otp->verifikasi($nomorHp, $kode);

        $baru = $pengguna === null;
        $pengguna ??= DB::transaction(fn () => Pengguna::forceCreate([
            'nomor_hp' => $nomorHp,
            'setuju_privasi_pada' => now(),
            'versi_privasi' => self::versiPrivasi(),
        ]));
        self::masukkan($request, $pengguna);

        return Respons::data([
            'akun' => BentukAkun::dari($pengguna),
            'pengguna_baru' => $baru || $pengguna->peran === null,
        ]);
    }

    /** POST /auth/keluar */
    public function keluar(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    /** Buka sesi baru untuk pengguna ini (ID sesi diperbarui, mencegah session fixation). */
    public static function masukkan(Request $request, Pengguna $pengguna): void
    {
        Auth::guard('web')->login($pengguna);
        $request->session()->regenerate();
    }

    private static function versiPrivasi(): ?string
    {
        $nilai = Konfigurasi::semua()['versi_privasi'] ?? null;

        return is_string($nilai) ? $nilai : null;
    }
}
