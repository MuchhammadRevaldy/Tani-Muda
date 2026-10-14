<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `pesan` (kontrak-api.md 2.14, PRD Tambahan F-09).
 *
 * @property string $id
 * @property string $percakapan_id
 * @property string $pengirim_id
 * @property string $isi
 * @property Carbon|null $dibaca_pada
 * @property string|null $kunci_idempoten
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Pesan extends Model
{
    protected $table = 'pesan';

    protected function casts(): array
    {
        return [
            'dibaca_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Percakapan, $this> */
    public function percakapan(): BelongsTo
    {
        return $this->belongsTo(Percakapan::class, 'percakapan_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pengirim(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengirim_id');
    }
}
