<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `kelompok_tani` (kontrak-api.md bagian 2). */
class KelompokTani extends Model
{
    protected $table = 'kelompok_tani';

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function ketua(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'ketua_id');
    }
}
