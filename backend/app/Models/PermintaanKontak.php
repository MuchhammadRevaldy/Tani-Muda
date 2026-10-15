<?php

namespace App\Models;

use App\Enums\StatusPermintaanKontak;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `permintaan_kontak` (alur request kontak).
 *
 * @property string $id
 * @property string $pemohon_id
 * @property string $target_id
 * @property string $nomor_hp
 * @property string|null $pesan
 * @property StatusPermintaanKontak $status
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class PermintaanKontak extends Model
{
    protected $table = 'permintaan_kontak';

    protected function casts(): array
    {
        return [
            'status' => StatusPermintaanKontak::class,
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pemohon(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pemohon_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function target(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'target_id');
    }
}
