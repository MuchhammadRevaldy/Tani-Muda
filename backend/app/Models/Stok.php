<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `stok` (F-07 Marketplace stok siap jual).
 *
 * @property string $id
 * @property string $petani_id
 * @property string $komoditas_id
 * @property string|null $lahan_id
 * @property float $jumlah_kg
 * @property float $sisa_kg
 * @property int $harga_per_kg
 * @property Carbon $tanggal_panen
 * @property string|null $foto
 * @property string $status
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Stok extends Model
{
    protected $table = 'stok';

    protected function casts(): array
    {
        return [
            'jumlah_kg' => 'float',
            'sisa_kg' => 'float',
            'harga_per_kg' => 'integer',
            'tanggal_panen' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<Pengguna, $this>
     */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'petani_id');
    }

    /**
     * @return BelongsTo<Komoditas, $this>
     */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    /**
     * @return BelongsTo<Lahan, $this>
     */
    public function lahan(): BelongsTo
    {
        return $this->belongsTo(Lahan::class, 'lahan_id');
    }

    /**
     * @return HasMany<PesananStok, $this>
     */
    public function pesanan(): HasMany
    {
        return $this->hasMany(PesananStok::class, 'stok_id');
    }
}
