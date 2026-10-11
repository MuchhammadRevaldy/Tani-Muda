<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusTugas: string
{
    use NilaiEnum;

    case Belum = 'belum';
    case Selesai = 'selesai';
}
