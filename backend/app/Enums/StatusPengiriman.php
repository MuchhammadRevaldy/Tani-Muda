<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusPengiriman: string
{
    use NilaiEnum;

    case Terjadwal = 'terjadwal';
    case Dikirim = 'dikirim';
    case Diterima = 'diterima';
    case DitolakSebagian = 'ditolak_sebagian';
    case Gagal = 'gagal';
}
