<?php

namespace App\Models;

use App\Enums\KategoriKomoditas;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tabel `komoditas` (kontrak-api.md bagian 2). */
class Komoditas extends Model
{
    protected $table = 'komoditas';

    protected function casts(): array
    {
        return [
            'kategori' => KategoriKomoditas::class,
            'jenis_lahan_cocok' => 'array',
            'umur_panen_hari' => 'integer',
            'harga_jual_contoh' => 'integer',
        ];
    }

    /** @return HasMany<ResepTanam, $this> */
    public function resep(): HasMany
    {
        return $this->hasMany(ResepTanam::class, 'komoditas_id');
    }

    /** @return HasMany<Modul, $this> */
    public function modul(): HasMany
    {
        return $this->hasMany(Modul::class, 'komoditas_id');
    }
}
