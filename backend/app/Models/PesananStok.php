<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * Tabel `pesanan_stok` (F-07 Pesanan stok siap jual).
 *
 * @property string $id
 * @property string $pembeli_id
 * @property string $stok_id
 * @property string $petani_id
 * @property float $jumlah_kg
 * @property int $harga_per_kg
 * @property int $nilai
 * @property string $metode_bayar
 * @property string $alamat_antar
 * @property string $status
 * @property Carbon|null $waktu_menunggu
 * @property Carbon|null $waktu_diterima
 * @property Carbon|null $waktu_dikirim
 * @property Carbon|null $waktu_selesai
 * @property Carbon|null $waktu_dibatalkan
 * @property Carbon|null $waktu_ditolak
 * @property string|null $alasan_batal
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class PesananStok extends Model
{
    protected $table = 'pesanan_stok';

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'jumlah_kg' => 'float',
            'harga_per_kg' => 'integer',
            'nilai' => 'integer',
            'waktu_menunggu' => 'datetime',
            'waktu_diterima' => 'datetime',
            'waktu_dikirim' => 'datetime',
            'waktu_selesai' => 'datetime',
            'waktu_dibatalkan' => 'datetime',
            'waktu_ditolak' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Pengguna, $this>
     */
    public function pembeli(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pembeli_id');
    }

    /**
     * @return BelongsTo<Stok, $this>
     */
    public function stok(): BelongsTo
    {
        return $this->belongsTo(Stok::class, 'stok_id');
    }

    /**
     * @return BelongsTo<Pengguna, $this>
     */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'petani_id');
    }

    /**
     * @return HasMany<Pembayaran, $this>
     */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'pesanan_stok_id');
    }

    /**
     * @return HasOne<Rating, $this>
     */
    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class, 'pesanan_stok_id');
    }
}
