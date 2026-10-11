<?php

namespace App\Domain\Otp;

use App\Http\Galat\GalatApi;
use Illuminate\Support\Facades\DB;

/**
 * Kirim dan cocokkan kode OTP (arsitektur-backend.md bagian 5, aturan sama dengan
 * frontend/src/penyedia/otp/otp-tiruan.ts): 6 digit, hanya hash HMAC-SHA256 yang disimpan,
 * kedaluwarsa 5 menit, paling banyak 5 percobaan, kirim ulang setelah 60 detik dan paling banyak
 * 5 kali per jam per nomor.
 */
final class LayananOtp
{
    public const PANJANG = 6;

    public const KEDALUWARSA_DETIK = 300;

    public const JEDA_KIRIM_ULANG_DETIK = 60;

    public const MAKS_KIRIM_PER_JAM = 5;

    public const MAKS_PERCOBAAN = 5;

    public function __construct(private readonly PengirimOtp $pengirim) {}

    /** @return array{nomor_hp: string, kirim_ulang_dalam_detik: int, kedaluwarsa_dalam_detik: int} */
    public function kirim(string $nomorHp): array
    {
        $sekarang = now();
        $kiriman = DB::table('kode_otp')->where('nomor_hp', $nomorHp)
            ->where('dibuat_pada', '>', $sekarang->copy()->subHour())
            ->orderBy('dibuat_pada')->pluck('dibuat_pada')->all();
        $terakhir = end($kiriman);
        if ($terakhir !== false) {
            $tunggu = self::JEDA_KIRIM_ULANG_DETIK - (int) $sekarang->diffInSeconds($terakhir, true);
            if ($tunggu > 0) {
                throw new GalatApi('TERLALU_SERING', cobaLagiDalam: $tunggu);
            }
        }
        if (count($kiriman) >= self::MAKS_KIRIM_PER_JAM) {
            $tunggu = 3600 - (int) $sekarang->diffInSeconds($kiriman[0], true);
            throw new GalatApi('TERLALU_SERING', cobaLagiDalam: max(1, $tunggu));
        }

        $kode = str_pad((string) random_int(0, 10 ** self::PANJANG - 1), self::PANJANG, '0', STR_PAD_LEFT);
        DB::transaction(function () use ($nomorHp, $kode, $sekarang) {
            // Kode lama untuk nomor yang sama dibatalkan.
            DB::table('kode_otp')->where('nomor_hp', $nomorHp)->whereNull('dipakai_pada')->whereNull('dibatalkan_pada')
                ->update(['dibatalkan_pada' => $sekarang]);
            DB::table('kode_otp')->insert([
                'nomor_hp' => $nomorHp,
                'hash_kode' => self::hash($nomorHp, $kode),
                'kedaluwarsa_pada' => $sekarang->copy()->addSeconds(self::KEDALUWARSA_DETIK),
                'dibuat_pada' => $sekarang,
            ]);
        });
        $this->pengirim->kirim($nomorHp, $kode);

        return [
            'nomor_hp' => $nomorHp,
            'kirim_ulang_dalam_detik' => self::JEDA_KIRIM_ULANG_DETIK,
            'kedaluwarsa_dalam_detik' => self::KEDALUWARSA_DETIK,
        ];
    }

    /** Cocokkan kode; gagal → OTP_KEDALUWARSA, OTP_SALAH, atau OTP_TERKUNCI. */
    public function verifikasi(string $nomorHp, string $kode): void
    {
        $hasil = DB::transaction(function () use ($nomorHp, $kode) {
            $baris = DB::table('kode_otp')->where('nomor_hp', $nomorHp)
                ->whereNull('dibatalkan_pada')->orderByDesc('nomor')->lockForUpdate()->first();
            if ($baris === null || $baris->dipakai_pada !== null) {
                return 'OTP_KEDALUWARSA';
            }
            if ($baris->percobaan >= self::MAKS_PERCOBAAN) {
                return 'OTP_TERKUNCI';
            }
            if (now()->greaterThanOrEqualTo($baris->kedaluwarsa_pada)) {
                return 'OTP_KEDALUWARSA';
            }
            $percobaan = $baris->percobaan + 1;
            if (! hash_equals($baris->hash_kode, self::hash($nomorHp, $kode))) {
                DB::table('kode_otp')->where('nomor', $baris->nomor)->update(['percobaan' => $percobaan]);

                return $percobaan >= self::MAKS_PERCOBAAN ? 'OTP_TERKUNCI' : 'OTP_SALAH';
            }
            DB::table('kode_otp')->where('nomor', $baris->nomor)->update(['percobaan' => $percobaan, 'dipakai_pada' => now()]);

            return null;
        });
        if ($hasil !== null) {
            throw new GalatApi($hasil);
        }
        PengirimOtpLog::lupakan($nomorHp);
    }

    public static function hash(string $nomorHp, string $kode): string
    {
        return hash_hmac('sha256', "{$nomorHp}:{$kode}", (string) config('app.key'));
    }
}
