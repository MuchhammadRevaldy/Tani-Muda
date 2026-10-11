<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusAlokasi: string
{
    use NilaiEnum;

    case MenungguKesepakatan = 'menunggu_kesepakatan';
    case Disepakati = 'disepakati';
    case Berjalan = 'berjalan';
    case Selesai = 'selesai';
    case Gagal = 'gagal';
    case Dibatalkan = 'dibatalkan';
}
