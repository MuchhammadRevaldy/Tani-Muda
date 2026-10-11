<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusSiklus: string
{
    use NilaiEnum;

    case Rencana = 'rencana';
    case Aktif = 'aktif';
    case Selesai = 'selesai';
}
