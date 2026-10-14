<?php

namespace App\Enums;

enum JenisPercakapan: string
{
    case Alokasi = 'alokasi';
    case PesananStok = 'pesanan_stok';
    case Peta = 'peta';
    case Kontak = 'kontak';

    /** @return list<string> */
    public static function nilai(): array
    {
        return array_column(self::cases(), 'value');
    }
}
