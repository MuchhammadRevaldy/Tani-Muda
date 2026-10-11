<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `jurnal` (kontrak-api.md bagian 2). */
class Jurnal extends Model
{
    protected $table = 'jurnal';

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'hari_ke' => 'integer',
        ];
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }

    /** @return BelongsTo<Tugas, $this> */
    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }
}
