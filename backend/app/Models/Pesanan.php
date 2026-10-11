<?php

namespace App\Models;

use App\Enums\JenisPesanan;
use App\Enums\StatusPesanan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tabel `pesanan` (kontrak-api.md bagian 2). */
class Pesanan extends Model
{
    protected $table = 'pesanan';

    protected function casts(): array
    {
        return [
            'jenis' => JenisPesanan::class,
            'jumlah_per_kiriman_kg' => 'float',
            'frekuensi_hari' => 'integer',
            'jumlah_kiriman' => 'integer',
            'jumlah_total_kg' => 'float',
            'tanggal_mulai' => 'date:Y-m-d',
            'tanggal_selesai' => 'date:Y-m-d',
            'harga_per_kg' => 'integer',
            'standar_kualitas' => 'array',
            'status' => StatusPesanan::class,
            'nilai_pesanan' => 'integer',
            'uang_muka' => 'integer',
            'biaya_layanan' => 'integer',
            'saldo_uang_muka' => 'integer',
            'terambil_kg' => 'float',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pembeli(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pembeli_id');
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }

    /** @return HasMany<AlokasiPesanan, $this> */
    public function alokasi(): HasMany
    {
        return $this->hasMany(AlokasiPesanan::class, 'pesanan_id');
    }

    /** @return HasMany<Pengiriman, $this> */
    public function pengiriman(): HasMany
    {
        return $this->hasMany(Pengiriman::class, 'pesanan_id');
    }

    /** @return HasMany<Pembayaran, $this> */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'pesanan_id');
    }
}
