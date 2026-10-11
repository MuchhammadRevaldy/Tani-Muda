<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum StatusAkun: string
{
    use NilaiEnum;

    case Aktif = 'aktif';
    case DinonaktifkanSementara = 'dinonaktifkan_sementara';
}
