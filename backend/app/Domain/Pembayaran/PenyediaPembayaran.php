<?php

namespace App\Domain\Pembayaran;

/**
 * Penyedia pembayaran (arsitektur-backend.md bagian 10, T5.15). Semua operasi uang lewat antarmuka
 * ini; dipilih lewat PEMBAYARAN_DRIVER. Kegagalan dilempar sebagai GalatApi (MELEBIHI_SALDO,
 * JUMLAH_NEGATIF, GALAT_SERVER), sama dengan `dariGerbang` klien tiruan.
 */
interface PenyediaPembayaran
{
    /** Mode uji coba: tanpa uang sungguhan, UI menampilkan label "Mode uji coba" (D-10, D-41). */
    public function modeUjiCoba(): bool;

    /** Tahan dana baru; kunci yang sama mengembalikan referensi yang sama. @return string referensi */
    public function tahan(int $nominal, string $keterangan, string $kunci): string;

    public function cairkan(string $referensi, int $nominal): void;

    public function kembalikan(string $referensi, int $nominal): void;
}
