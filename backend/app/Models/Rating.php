<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `rating` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string|null $pengiriman_id
 * @property string|null $pesanan_stok_id
 * @property string $pemberi_id
 * @property string $penerima_id
 * @property int $nilai
 * @property string|null $komentar
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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

    /** @return BelongsTo<PesananStok, $this> */
    public function pesananStok(): BelongsTo
    {
        return $this->belongsTo(PesananStok::class, 'pesanan_stok_id');
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
