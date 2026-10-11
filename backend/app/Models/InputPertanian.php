<?php

namespace App\Models;

use App\Enums\KategoriInput;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Tabel `input_pertanian` (kontrak-api.md bagian 2). */
class InputPertanian extends Model
{
    protected $table = 'input_pertanian';

    protected function casts(): array
    {
        return [
            'kategori' => KategoriInput::class,
        ];
    }

    /** @return HasMany<MerekInput, $this> */
    public function merek(): HasMany
    {
        return $this->hasMany(MerekInput::class, 'input_id');
    }
}
