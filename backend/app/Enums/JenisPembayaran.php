<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum JenisPembayaran: string
{
    use NilaiEnum;

    case UangMuka = 'uang_muka';
    case BiayaLayanan = 'biaya_layanan';
    case Kiriman = 'kiriman';
    case Pencairan = 'pencairan';
    case Pengembalian = 'pengembalian';
    case Kompensasi = 'kompensasi';
}
