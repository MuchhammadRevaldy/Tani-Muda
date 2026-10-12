<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `jurnal` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $siklus_id
 * @property Carbon $tanggal
 * @property int $hari_ke
 * @property string|null $foto
 * @property string|null $catatan
 * @property string|null $tugas_id
 * @property string|null $judul_tugas
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Jurnal extends Model
{
    protected $table = 'jurnal';

    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'hari_ke' => 'integer',
        ];
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }

    /** @return BelongsTo<Tugas, $this> */
    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }
}
