<?php

namespace App\Enums;

/**
 * Jenis harga pada pemantauan berita (F-10).
 */
enum JenisHargaBerita: string
{
    case Pasar = 'pasar';
    case Eceran = 'eceran';
    case Petani = 'petani';

    /** @return list<string> */
    public static function nilai(): array
    {
        return array_column(self::cases(), 'value');
    }
}
