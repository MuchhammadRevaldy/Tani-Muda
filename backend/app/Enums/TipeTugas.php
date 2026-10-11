<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum TipeTugas: string
{
    use NilaiEnum;

    case Sekali = 'sekali';
    case Berulang = 'berulang';
    case Ukur = 'ukur';
}
