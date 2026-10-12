<?php

namespace App\Models;

use App\Enums\JenisCatatan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `catatan_petani` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $petani_id
 * @property JenisCatatan $jenis
 * @property string|null $pengiriman_id
 * @property string $isi
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class CatatanPetani extends Model
{
    protected $table = 'catatan_petani';

    protected function casts(): array
    {
        return [
            'jenis' => JenisCatatan::class,
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'petani_id');
    }

    /** @return BelongsTo<Pengiriman, $this> */
    public function pengiriman(): BelongsTo
    {
        return $this->belongsTo(Pengiriman::class, 'pengiriman_id');
    }
}
