<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `kelompok_tani` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $nama
 * @property string $wilayah_id
 * @property string|null $ketua_id
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
