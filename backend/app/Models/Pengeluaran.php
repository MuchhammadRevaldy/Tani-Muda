<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `pengeluaran` (kontrak-api.md bagian 2). */
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
