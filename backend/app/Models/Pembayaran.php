<?php

namespace App\Models;

use App\Enums\JenisPembayaran;
use App\Enums\StatusPembayaran;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `pembayaran` (kontrak-api.md bagian 2). */
class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected function casts(): array
    {
        return [
            'jenis' => JenisPembayaran::class,
            'nominal' => 'integer',
            'status' => StatusPembayaran::class,
            'mode_uji_coba' => 'boolean',
        ];
    }

    /** @return BelongsTo<Pesanan, $this> */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }

    /** @return BelongsTo<Pengiriman, $this> */
    public function pengiriman(): BelongsTo
    {
        return $this->belongsTo(Pengiriman::class, 'pengiriman_id');
    }
}
