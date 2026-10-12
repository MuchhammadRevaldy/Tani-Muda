<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `permintaan_resep` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $pengguna_id
 * @property string $komoditas_id
 * @property string|null $metode_id
 * @property string|null $wilayah_id
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 * @property string|null $metode_kunci
 */
class PermintaanResep extends Model
{
    protected $table = 'permintaan_resep';

    /** @return BelongsTo<Pengguna, $this> */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    /** @return BelongsTo<MetodeTanam, $this> */
    public function metode(): BelongsTo
    {
        return $this->belongsTo(MetodeTanam::class, 'metode_id');
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }
}
