<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum KategoriKomoditas: string
{
    use NilaiEnum;

    case SayuranDaun = 'sayuran_daun';
    case SayuranBuah = 'sayuran_buah';
    case TanamanPangan = 'tanaman_pangan';
}
