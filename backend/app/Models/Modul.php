<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `modul` (kontrak-api.md bagian 2). */
class Modul extends Model
{
    protected $table = 'modul';

    protected function casts(): array
    {
        return [
            'menit' => 'integer',
            'urutan' => 'integer',
            'hst_mulai' => 'integer',
            'ukuran_video_mb' => 'float',
        ];
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    /** @return BelongsTo<MetodeTanam, $this> */
    public function metode(): BelongsTo
    {
        return $this->belongsTo(MetodeTanam::class, 'metode_id');
    }
}
