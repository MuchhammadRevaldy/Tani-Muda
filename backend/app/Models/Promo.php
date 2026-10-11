<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `promo` (kontrak-api.md bagian 2). */
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
