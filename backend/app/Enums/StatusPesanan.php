<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusPesanan: string
{
    use NilaiEnum;

    case MenungguPembayaran = 'menunggu_pembayaran';
    case MencariPetani = 'mencari_petani';
    case Berjalan = 'berjalan';
    case Selesai = 'selesai';
    case Dibatalkan = 'dibatalkan';
}
