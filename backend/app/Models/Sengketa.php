<?php

namespace App\Models;

use App\Enums\KeputusanSengketa;
use App\Enums\StatusSengketa;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `sengketa` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $pengiriman_id
 * @property StatusSengketa $status
 * @property KeputusanSengketa|null $keputusan
 * @property string|null $catatan
 * @property Carbon|null $diputuskan_pada
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
