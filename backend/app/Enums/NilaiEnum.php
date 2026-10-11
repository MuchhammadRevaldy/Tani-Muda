<?php

namespace App\Enums;

/** Daftar nilai enum, dipakai kolom `enum` di migrasi dan aturan validasi. */
trait NilaiEnum
{
    /** @return list<string> */
    public static function nilai(): array
    {
        return array_column(self::cases(), 'value');
    }
}
