<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum ModalAwal: string
{
    use NilaiEnum;

    case Rendah = 'rendah';
    case Sedang = 'sedang';
    case Tinggi = 'tinggi';
}
