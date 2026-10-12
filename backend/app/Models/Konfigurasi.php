<?php

namespace App\Models;

use Illuminate\Support\Carbon;

/**
 * Tabel `konfigurasi` (kontrak-api.md bagian 2).
 *
 * @property string $kunci
 * @property array<mixed> $nilai
 * @property string|null $keterangan
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
