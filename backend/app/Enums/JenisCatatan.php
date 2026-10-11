<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum JenisCatatan: string
{
    use NilaiEnum;

    case TidakMemberiKabar = 'tidak_memberi_kabar';
    case Lainnya = 'lainnya';
}
