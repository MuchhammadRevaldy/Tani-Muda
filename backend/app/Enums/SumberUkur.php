<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum SumberUkur: string
{
    use NilaiEnum;

    case Manual = 'manual';
    case Sensor = 'sensor';
}
