<?php

namespace App\Models;

use App\Enums\DasarUkuran;
use App\Enums\ModalAwal;

/** Tabel `metode_tanam` (kontrak-api.md bagian 2). */
class MetodeTanam extends Model
{
    protected $table = 'metode_tanam';

    protected function casts(): array
    {
        return [
            'dasar_ukuran' => DasarUkuran::class,
            'modal_awal' => ModalAwal::class,
            'bisa_vertikultur' => 'boolean',
        ];
    }
}
