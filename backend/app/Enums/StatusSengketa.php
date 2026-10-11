<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusSengketa: string
{
    use NilaiEnum;

    case Terbuka = 'terbuka';
    case Diputuskan = 'diputuskan';
}
