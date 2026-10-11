<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tabel `wilayah` (kontrak-api.md bagian 2). */
class Wilayah extends Model
{
    protected $table = 'wilayah';

    protected function casts(): array
    {
        return [
            'lintang' => 'float',
            'bujur' => 'float',
            'koordinat_perkiraan' => 'boolean',
            'kode_terverifikasi' => 'boolean',
        ];
    }

    /** @return HasMany<Pengguna, $this> */
    public function pengguna(): HasMany
    {
        return $this->hasMany(Pengguna::class, 'wilayah_id');
    }

    /** @return HasMany<Lahan, $this> */
    public function lahan(): HasMany
    {
        return $this->hasMany(Lahan::class, 'wilayah_id');
    }
}
