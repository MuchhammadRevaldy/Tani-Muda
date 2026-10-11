<?php

namespace App\Domain\Otp;

/** Pengirim kode OTP (arsitektur-backend.md bagian 5). Penyedia SMS ditambahkan nanti. */
interface PengirimOtp
{
    public function kirim(string $nomorHp, string $kode): void;
}
