<?php

namespace App\Models;

use App\Enums\JenisLahan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tabel `lahan` (kontrak-api.md bagian 2). */
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
