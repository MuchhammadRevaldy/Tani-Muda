<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum DasarDosis: string
{
    use NilaiEnum;

    case PerM2 = 'per_m2';
    case PerTanaman = 'per_tanaman';
    case PerLiter = 'per_liter';
    case PerSiklus = 'per_siklus';
}
