<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `pengaturan_pengingat` (kontrak-api.md bagian 2).
 *
 * @property string $siklus_id
 * @property string $jam_pagi
 * @property bool $pengingat_sore
 * @property array<mixed> $tipe_aktif
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class PengaturanPengingat extends Model
{
    protected $table = 'pengaturan_pengingat';

    protected $primaryKey = 'siklus_id';

    protected function casts(): array
    {
        return [
            'pengingat_sore' => 'boolean',
            'tipe_aktif' => 'array',
        ];
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }
}
