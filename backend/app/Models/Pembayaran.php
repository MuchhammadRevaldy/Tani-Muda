<?php

namespace App\Models;

use App\Enums\JenisPembayaran;
use App\Enums\StatusPembayaran;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `pembayaran` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string|null $pesanan_id
 * @property string|null $pesanan_stok_id
 * @property string|null $pengiriman_id
 * @property JenisPembayaran $jenis
 * @property int $nominal
 * @property StatusPembayaran $status
 * @property string $referensi
 * @property bool $mode_uji_coba
 * @property string|null $kunci_idempoten
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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

    /** @return BelongsTo<PesananStok, $this> */
    public function pesananStok(): BelongsTo
    {
        return $this->belongsTo(PesananStok::class, 'pesanan_stok_id');
    }

    /** @return BelongsTo<Pengiriman, $this> */
    public function pengiriman(): BelongsTo
    {
        return $this->belongsTo(Pengiriman::class, 'pengiriman_id');
    }
}
