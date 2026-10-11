<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum JenisPesanan: string
{
    use NilaiEnum;

    case Rutin = 'rutin';
    case SekaliPanen = 'sekali_panen';
}
