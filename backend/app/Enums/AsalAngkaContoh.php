<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum AsalAngkaContoh: string
{
    use NilaiEnum;

    case Desain = 'desain';
    case Dikarang = 'dikarang';
}
