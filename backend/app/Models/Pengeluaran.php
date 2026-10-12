<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `pengeluaran` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $siklus_id
 * @property string|null $rencana_item_id
 * @property string $nama
 * @property int $nominal
 * @property Carbon $tanggal
 * @property string|null $foto_nota
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected function casts(): array
    {
        return [
            'nominal' => 'integer',
            'tanggal' => 'date:Y-m-d',
        ];
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }

    /** @return BelongsTo<RencanaItem, $this> */
    public function rencanaItem(): BelongsTo
    {
        return $this->belongsTo(RencanaItem::class, 'rencana_item_id');
    }
}
