<?php

namespace App\Models;

use Illuminate\Support\Carbon;

/**
 * Tabel `kode_otp` (kontrak-api.md bagian 2).
 *
 * @property int $nomor
 * @property string $nomor_hp
 * @property string $hash_kode
 * @property Carbon|null $kedaluwarsa_pada
 * @property int $percobaan
 * @property Carbon|null $dipakai_pada
 * @property Carbon|null $dibatalkan_pada
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class KodeOtp extends Model
{
    protected $table = 'kode_otp';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    protected function casts(): array
    {
        return [
            'kedaluwarsa_pada' => 'datetime',
            'dipakai_pada' => 'datetime',
            'dibatalkan_pada' => 'datetime',
            'percobaan' => 'integer',
        ];
    }
}
