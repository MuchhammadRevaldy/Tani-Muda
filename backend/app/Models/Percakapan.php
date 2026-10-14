<?php

namespace App\Models;

use App\Enums\JenisPercakapan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * Tabel `percakapan` (kontrak-api.md 2.14, PRD Tambahan F-09).
 *
 * @property string $id
 * @property JenisPercakapan $jenis
 * @property string|null $rujukan_id
 * @property string $petani_id
 * @property string $pembeli_id
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Percakapan extends Model
{
    protected $table = 'percakapan';

    protected function casts(): array
    {
        return [
            'jenis' => JenisPercakapan::class,
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'petani_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pembeli(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pembeli_id');
    }

    /** @return HasMany<Pesan, $this> */
    public function pesan(): HasMany
    {
        return $this->hasMany(Pesan::class, 'percakapan_id');
    }

    /** @return HasOne<Pesan, $this> */
    public function pesanTerakhir(): HasOne
    {
        return $this->hasOne(Pesan::class, 'percakapan_id')->latestOfMany('dibuat_pada');
    }
}
