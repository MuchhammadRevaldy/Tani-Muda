<?php

namespace App\Support;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\ColumnDefinition;
use Illuminate\Support\Facades\DB;

/**
 * Pembantu migrasi: tipe kolom bersama (arsitektur-backend.md bagian 7) dan batasan CHECK.
 */
final class Skema
{
    /** Panjang ID string. ID data contoh dipakai apa adanya (mis. `petani-arif`); ID baru berupa ULID. */
    public const PANJANG_ID = 64;

    public static function id(Blueprint $t, string $kolom = 'id'): void
    {
        $t->string($kolom, self::PANJANG_ID)->primary();
    }

    /** `dibuat_pada` dan `diperbarui_pada` (UTC). */
    public static function waktu(Blueprint $t): void
    {
        $t->timestamp('dibuat_pada')->useCurrent();
        $t->timestamp('diperbarui_pada')->nullable();
    }

    /** Rupiah bulat, tidak negatif. */
    public static function uang(Blueprint $t, string $kolom): ColumnDefinition
    {
        return $t->unsignedBigInteger($kolom);
    }

    /** Berat dan luas. */
    public static function jumlah(Blueprint $t, string $kolom): ColumnDefinition
    {
        return $t->decimal($kolom, 12, 2);
    }

    /** Dosis dan faktor resep yang butuh lebih dari dua desimal. */
    public static function faktor(Blueprint $t, string $kolom): ColumnDefinition
    {
        return $t->decimal($kolom, 12, 4);
    }

    /**
     * Batasan CHECK bernama. MariaDB 10.4 menegakkannya (D-25); nama batasan dipakai tes.
     */
    public static function periksa(string $tabel, string $nama, string $syarat): void
    {
        DB::statement("ALTER TABLE `{$tabel}` ADD CONSTRAINT `{$nama}` CHECK ({$syarat})");
    }

    /** CHECK `kolom >= 0` untuk setiap kolom angka yang tidak boleh negatif. */
    public static function tidakNegatif(string $tabel, string ...$kolom): void
    {
        foreach ($kolom as $k) {
            self::periksa($tabel, "{$tabel}_{$k}_tidak_negatif", "`{$k}` IS NULL OR `{$k}` >= 0");
        }
    }
}
