<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum JenisLahan: string
{
    use NilaiEnum;

    case Sawah = 'sawah';
    case Kebun = 'kebun';
    case Pekarangan = 'pekarangan';
    case Hidroponik = 'hidroponik';
}
