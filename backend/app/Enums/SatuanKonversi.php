<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum SatuanKonversi: string
{
    use NilaiEnum;

    case Ru = 'ru';
    case Bata = 'bata';
}
