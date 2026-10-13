<?php

namespace App\Models;

use App\Casts\FotoBerkas;
use App\Enums\StatusTugas;
use App\Enums\TipeTugas;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `tugas` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $siklus_id
 * @property string $resep_tugas_id
 * @property string $judul
 * @property TipeTugas $tipe
 * @property Carbon $tanggal
 * @property int $hst
 * @property StatusTugas $status
 * @property Carbon|null $selesai_pada
 * @property bool $boleh_digeser
 * @property int|null $interval
 * @property array<mixed>|null $ukur
 * @property string|null $foto
 * @property string|null $catatan
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Tugas extends Model
{
    protected $table = 'tugas';

    protected function casts(): array
    {
        return [
            'foto' => FotoBerkas::class,
            'tipe' => TipeTugas::class,
            'tanggal' => 'date:Y-m-d',
            'hst' => 'integer',
            'status' => StatusTugas::class,
            'selesai_pada' => 'datetime',
            'boleh_digeser' => 'boolean',
            'interval' => 'integer',
            'ukur' => 'array',
        ];
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }

    /** @return HasMany<HasilPengukuran, $this> */
    public function hasilPengukuran(): HasMany
    {
        return $this->hasMany(HasilPengukuran::class, 'tugas_id');
    }
}
