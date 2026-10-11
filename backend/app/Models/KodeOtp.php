<?php

namespace App\Models;

/** Tabel `kode_otp` (kontrak-api.md bagian 2). */
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
