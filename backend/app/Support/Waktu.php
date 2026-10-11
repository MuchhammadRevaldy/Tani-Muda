<?php

namespace App\Support;

use DateTimeInterface;
use Illuminate\Support\Carbon;

/**
 * Waktu dikirim sebagai ISO 8601 UTC dengan milidetik dan akhiran `Z`, mis.
 * `2026-10-05T01:00:00.000Z` (kontrak-api.md bagian 1.5, D-31). Basis data dan aplikasi memakai
 * UTC; tampilan menurut `pengguna.zona_waktu` dikerjakan frontend.
 */
final class Waktu
{
    public const FORMAT = 'Y-m-d\TH:i:s.v\Z';

    public static function iso(DateTimeInterface $waktu): string
    {
        return Carbon::instance($waktu)->utc()->format(self::FORMAT);
    }
}
