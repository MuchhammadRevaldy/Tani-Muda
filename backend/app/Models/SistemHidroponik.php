<?php

namespace App\Models;

/** Tabel `sistem_hidroponik` (kontrak-api.md bagian 2). */
class SistemHidroponik extends Model
{
    protected $table = 'sistem_hidroponik';

    protected function casts(): array
    {
        return [
            'liter_tandon_per_lubang' => 'float',
            'tempat_per_lubang_m2' => 'float',
        ];
    }
}
