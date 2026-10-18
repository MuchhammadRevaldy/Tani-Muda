<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `wilayah_kecamatan` (D-67, AG-41).
 *
 * @property string $id Kode PP.KK.CC
 * @property string $nama Nama kecamatan
 * @property string $kabupaten_id Kode PP.KK
 * @property float|null $lintang
 * @property float|null $bujur
 * @property bool $koordinat_perkiraan
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class WilayahKecamatan extends Model
{
    protected $table = 'wilayah_kecamatan';

    protected $guarded = ['dibuat_pada', 'diperbarui_pada'];

    protected function casts(): array
    {
        return [
            'lintang' => 'float',
            'bujur' => 'float',
            'koordinat_perkiraan' => 'boolean',
        ];
    }

    /** @return BelongsTo<WilayahKabupaten, $this> */
    public function kabupaten(): BelongsTo
    {
        return $this->belongsTo(WilayahKabupaten::class, 'kabupaten_id');
    }

    /** @return HasMany<Wilayah, $this> */
    public function desa(): HasMany
    {
        return $this->hasMany(Wilayah::class, 'kecamatan_id');
    }
}
