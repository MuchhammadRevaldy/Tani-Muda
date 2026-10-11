<?php

namespace App\Models;

/** Tabel `konfigurasi` (kontrak-api.md bagian 2). */
class Konfigurasi extends Model
{
    protected $table = 'konfigurasi';

    protected $primaryKey = 'kunci';

    protected function casts(): array
    {
        return [
            'nilai' => 'array',
        ];
    }
}
