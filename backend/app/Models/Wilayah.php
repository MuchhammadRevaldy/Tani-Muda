<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `wilayah` (kontrak-api.md bagian 2, D-67).
 *
 * @property string $id
 * @property string $desa
 * @property string $kecamatan
 * @property string $kabupaten
 * @property string $provinsi
 * @property string|null $kabupaten_id
 * @property string|null $kecamatan_id
 * @property float|null $lintang
 * @property float|null $bujur
 * @property bool $koordinat_perkiraan
 * @property bool $kode_terverifikasi
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Wilayah extends Model
{
    protected $table = 'wilayah';

    protected $guarded = ['dibuat_pada', 'diperbarui_pada'];

    protected function casts(): array
    {
        return [
            'lintang' => 'float',
            'bujur' => 'float',
            'koordinat_perkiraan' => 'boolean',
            'kode_terverifikasi' => 'boolean',
        ];
    }

    /** @return BelongsTo<WilayahKabupaten, $this> */
    public function dataKabupaten(): BelongsTo
    {
        return $this->belongsTo(WilayahKabupaten::class, 'kabupaten_id');
    }

    /** @return BelongsTo<WilayahKecamatan, $this> */
    public function dataKecamatan(): BelongsTo
    {
        return $this->belongsTo(WilayahKecamatan::class, 'kecamatan_id');
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
