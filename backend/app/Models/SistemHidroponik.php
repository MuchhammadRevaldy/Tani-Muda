<?php

namespace App\Models;

use Illuminate\Support\Carbon;

/**
 * Tabel `sistem_hidroponik` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $nama
 * @property string $keterangan
 * @property float $liter_tandon_per_lubang
 * @property float $tempat_per_lubang_m2
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
