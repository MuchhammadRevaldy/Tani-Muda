<?php

namespace App\Enums;

enum StatusPermintaanKontak: string
{
    use NilaiEnum;

    case Menunggu = 'menunggu';
    case Diterima = 'diterima';
    case Ditolak = 'ditolak';
}
