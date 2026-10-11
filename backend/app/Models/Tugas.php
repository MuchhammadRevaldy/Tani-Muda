<?php

namespace App\Models;

use App\Enums\StatusTugas;
use App\Enums\TipeTugas;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tabel `tugas` (kontrak-api.md bagian 2). */
class Tugas extends Model
{
    protected $table = 'tugas';

    protected function casts(): array
    {
        return [
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
