<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusUkur: string
{
    use NilaiEnum;

    case Normal = 'normal';
    case TerlaluRendah = 'terlalu-rendah';
    case TerlaluTinggi = 'terlalu-tinggi';
}
