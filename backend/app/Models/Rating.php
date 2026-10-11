<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `rating` (kontrak-api.md bagian 2). */
class Rating extends Model
{
    protected $table = 'rating';

    protected function casts(): array
    {
        return [
            'nilai' => 'integer',
        ];
    }

    /** @return BelongsTo<Pengiriman, $this> */
    public function pengiriman(): BelongsTo
    {
        return $this->belongsTo(Pengiriman::class, 'pengiriman_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pemberi(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pemberi_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function penerima(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'penerima_id');
    }
}
