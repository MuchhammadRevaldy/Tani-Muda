<?php

namespace App\Models;

use App\Enums\AlasanPenolakan;
use App\Enums\StatusPengiriman;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** Tabel `pengiriman` (kontrak-api.md bagian 2). */
class Pengiriman extends Model
{
    protected $table = 'pengiriman';

    protected function casts(): array
    {
        return [
            'ke' => 'integer',
            'tanggal_jadwal' => 'date:Y-m-d',
            'jumlah_kg' => 'float',
            'harga_per_kg' => 'integer',
            'status' => StatusPengiriman::class,
            'dikirim_pada' => 'datetime',
            'batas_periksa_pada' => 'datetime',
            'dikonfirmasi_pada' => 'datetime',
            'dianggap_diterima' => 'boolean',
            'jumlah_ditolak_kg' => 'float',
            'alasan_penolakan' => AlasanPenolakan::class,
            'nilai_diterima' => 'integer',
        ];
    }

    /** @return BelongsTo<AlokasiPesanan, $this> */
    public function alokasi(): BelongsTo
    {
        return $this->belongsTo(AlokasiPesanan::class, 'alokasi_id');
    }

    /** @return BelongsTo<Pesanan, $this> */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }

    /** @return HasMany<Rating, $this> */
    public function rating(): HasMany
    {
        return $this->hasMany(Rating::class, 'pengiriman_id');
    }

    /** @return HasOne<Sengketa, $this> */
    public function sengketa(): HasOne
    {
        return $this->hasOne(Sengketa::class, 'pengiriman_id');
    }

    /** @return HasMany<Pembayaran, $this> */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'pengiriman_id');
    }
}
