<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tabel `merek_input` (kontrak-api.md bagian 2). */
class MerekInput extends Model
{
    protected $table = 'merek_input';

    protected function casts(): array
    {
        return [
            'isi_kemasan' => 'float',
        ];
    }

    /** @return BelongsTo<InputPertanian, $this> */
    public function input(): BelongsTo
    {
        return $this->belongsTo(InputPertanian::class, 'input_id');
    }

    /** @return HasMany<LaporanHarga, $this> */
    public function laporanHarga(): HasMany
    {
        return $this->hasMany(LaporanHarga::class, 'merek_id');
    }
}
