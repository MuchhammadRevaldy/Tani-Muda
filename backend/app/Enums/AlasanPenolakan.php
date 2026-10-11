<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum AlasanPenolakan: string
{
    use NilaiEnum;

    case LayuAtauBusuk = 'layu_atau_busuk';
    case JumlahKurang = 'jumlah_kurang';
    case TidakSesuaiStandar = 'tidak_sesuai_standar';
    case Lainnya = 'lainnya';
}
