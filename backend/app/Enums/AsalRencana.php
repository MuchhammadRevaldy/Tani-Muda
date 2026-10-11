<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum AsalRencana: string
{
    use NilaiEnum;

    case Resep = 'resep';
    case Tambahan = 'tambahan';
}
