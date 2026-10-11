<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum KeputusanSengketa: string
{
    use NilaiEnum;

    case CairkanKePetani = 'cairkan_ke_petani';
    case KembalikanKePembeli = 'kembalikan_ke_pembeli';
}
