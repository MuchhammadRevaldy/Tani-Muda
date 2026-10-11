<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum Peran: string
{
    use NilaiEnum;

    case Petani = 'petani';
    case Pembeli = 'pembeli';
    case Mentor = 'mentor';
    case Admin = 'admin';
}
