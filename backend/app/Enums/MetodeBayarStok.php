<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum MetodeBayarStok: string
{
    use NilaiEnum;

    case Cod = 'cod';
    case BayarDiAplikasi = 'bayar_di_aplikasi';
}
