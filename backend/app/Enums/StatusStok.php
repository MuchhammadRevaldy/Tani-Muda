<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusStok: string
{
    use NilaiEnum;

    case Tersedia = 'tersedia';
    case Habis = 'habis';
    case Ditarik = 'ditarik';
}
