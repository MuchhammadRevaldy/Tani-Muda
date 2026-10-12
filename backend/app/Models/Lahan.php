<?php

namespace App\Models;

use App\Enums\JenisLahan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `lahan` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $petani_id
 * @property string $nama
 * @property JenisLahan $jenis_lahan
 * @property float $luas_m2
 * @property string $satuan_asli
 * @property float $nilai_asli
 * @property string $wilayah_id
 * @property float|null $lintang
 * @property float|null $bujur
 * @property int|null $kapasitas_lubang
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Lahan extends Model
{
    protected $table = 'lahan';

    protected function casts(): array
    {
        return [
            'jenis_lahan' => JenisLahan::class,
            'luas_m2' => 'float',
            'nilai_asli' => 'float',
            'lintang' => 'float',
            'bujur' => 'float',
            'kapasitas_lubang' => 'integer',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'petani_id');
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }

    /** @return HasMany<SiklusTanam, $this> */
    public function siklus(): HasMany
    {
        return $this->hasMany(SiklusTanam::class, 'lahan_id');
    }
}
