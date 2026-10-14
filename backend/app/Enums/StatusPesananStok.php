<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusPesananStok: string
{
    use NilaiEnum;

    case Menunggu = 'menunggu';
    case Diterima = 'diterima';
    case Dikirim = 'dikirim';
    case Selesai = 'selesai';
    case Dibatalkan = 'dibatalkan';
    case Ditolak = 'ditolak';
}
