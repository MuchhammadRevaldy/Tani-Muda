<?php

namespace App\Models;

use App\Enums\KategoriKomoditas;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `komoditas` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $nama
 * @property KategoriKomoditas $kategori
 * @property array<mixed> $jenis_lahan_cocok
 * @property string $satuan_panen
 * @property int $umur_panen_hari
 * @property int|null $harga_jual_contoh
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
