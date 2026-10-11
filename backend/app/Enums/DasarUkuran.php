<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum DasarUkuran: string
{
    use NilaiEnum;

    case Luas = 'luas';
    case Polybag = 'polybag';
    case Lubang = 'lubang';
}
