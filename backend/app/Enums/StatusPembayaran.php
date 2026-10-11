<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusPembayaran: string
{
    use NilaiEnum;

    case Menunggu = 'menunggu';
    case Ditahan = 'ditahan';
    case Cair = 'cair';
    case Dikembalikan = 'dikembalikan';
    case Gagal = 'gagal';
}
