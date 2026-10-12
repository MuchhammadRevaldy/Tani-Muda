<?php

namespace App\Models;

use App\Enums\StatusAlokasi;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `alokasi_pesanan` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $pesanan_id
 * @property string $petani_id
 * @property float $jumlah_kg
 * @property StatusAlokasi $status
 * @property Carbon|null $disetujui_pada
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class AlokasiPesanan extends Model
{
    protected $table = 'alokasi_pesanan';

    protected function casts(): array
    {
        return [
            'jumlah_kg' => 'float',
            'status' => StatusAlokasi::class,
            'disetujui_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Pesanan, $this> */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'petani_id');
    }

    /** @return HasMany<SiklusTanam, $this> */
    public function siklus(): HasMany
    {
        return $this->hasMany(SiklusTanam::class, 'alokasi_pesanan_id');
    }

    /** @return HasMany<Pengiriman, $this> */
    public function pengiriman(): HasMany
    {
        return $this->hasMany(Pengiriman::class, 'alokasi_id');
    }
}
