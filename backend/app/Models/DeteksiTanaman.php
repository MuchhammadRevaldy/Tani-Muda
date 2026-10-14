<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `deteksi_tanaman` (PRD Tambahan F-04).
 *
 * @property string $id
 * @property string $pengguna_id
 * @property string|null $siklus_id
 * @property string|null $tugas_id
 * @property string $berkas_id
 * @property array<string, mixed> $hasil
 * @property string $model
 * @property Carbon $dibuat_pada
 */
class DeteksiTanaman extends Model
{
    protected $table = 'deteksi_tanaman';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'hasil' => 'array',
            'dibuat_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
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

    /** @return BelongsTo<Berkas, $this> */
    public function berkas(): BelongsTo
    {
        return $this->belongsTo(Berkas::class, 'berkas_id');
    }
}
