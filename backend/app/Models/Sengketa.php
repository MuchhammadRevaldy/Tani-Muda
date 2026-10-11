<?php

namespace App\Models;

use App\Enums\KeputusanSengketa;
use App\Enums\StatusSengketa;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `sengketa` (kontrak-api.md bagian 2). */
class Sengketa extends Model
{
    protected $table = 'sengketa';

    protected function casts(): array
    {
        return [
            'status' => StatusSengketa::class,
            'keputusan' => KeputusanSengketa::class,
            'diputuskan_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Pengiriman, $this> */
    public function pengiriman(): BelongsTo
    {
        return $this->belongsTo(Pengiriman::class, 'pengiriman_id');
    }
}
