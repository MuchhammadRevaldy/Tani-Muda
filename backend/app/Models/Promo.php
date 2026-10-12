<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `promo` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $pemasang
 * @property string $isi
 * @property string $wilayah_id
 * @property float|null $jarak_km
 * @property Carbon $berlaku_mulai
 * @property Carbon $berlaku_sampai
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Promo extends Model
{
    protected $table = 'promo';

    protected function casts(): array
    {
        return [
            'jarak_km' => 'float',
            'berlaku_mulai' => 'date:Y-m-d',
            'berlaku_sampai' => 'date:Y-m-d',
        ];
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }
}
