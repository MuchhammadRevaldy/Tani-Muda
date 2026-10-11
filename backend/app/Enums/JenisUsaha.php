<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum JenisUsaha: string
{
    use NilaiEnum;

    case Katering = 'katering';
    case Restoran = 'restoran';
    case Warung = 'warung';
    case Koperasi = 'koperasi';
    case Penggilingan = 'penggilingan';
    case Lainnya = 'lainnya';
}
