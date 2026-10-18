<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `wilayah_kabupaten` (D-67, AG-41).
 *
 * @property string $id Kode PP.KK
 * @property string $nama Nama kabupaten/kota
 * @property string $provinsi_id Kode PP
 * @property float|null $lintang
 * @property float|null $bujur
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class WilayahKabupaten extends Model
{
    protected $table = 'wilayah_kabupaten';

    protected $guarded = ['dibuat_pada', 'diperbarui_pada'];

    protected function casts(): array
    {
        return [
            'lintang' => 'float',
            'bujur' => 'float',
        ];
    }

    /** @return HasMany<WilayahKecamatan, $this> */
    public function kecamatan(): HasMany
    {
        return $this->hasMany(WilayahKecamatan::class, 'kabupaten_id');
    }

    /** @return HasMany<Wilayah, $this> */
    public function desa(): HasMany
    {
        return $this->hasMany(Wilayah::class, 'kabupaten_id');
    }
}
