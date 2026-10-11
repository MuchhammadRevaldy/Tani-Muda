<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusResep: string
{
    use NilaiEnum;

    case Draf = 'draf';
    case Divalidasi = 'divalidasi';
}
