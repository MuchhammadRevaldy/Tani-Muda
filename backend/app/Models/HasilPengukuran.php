<?php

namespace App\Models;

use App\Enums\StatusUkur;
use App\Enums\SumberUkur;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `hasil_pengukuran` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $tugas_id
 * @property string $siklus_id
 * @property string $besaran
 * @property float $nilai
 * @property StatusUkur $status
 * @property SumberUkur $sumber
 * @property Carbon $tanggal
 * @property Carbon $dicatat_pada
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class HasilPengukuran extends Model
{
    protected $table = 'hasil_pengukuran';

    protected function casts(): array
    {
        return [
            'nilai' => 'float',
            'status' => StatusUkur::class,
            'sumber' => SumberUkur::class,
            'tanggal' => 'date:Y-m-d',
            'dicatat_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Tugas, $this> */
    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }
}
