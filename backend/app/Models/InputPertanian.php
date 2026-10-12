<?php

namespace App\Models;

use App\Enums\KategoriInput;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `input_pertanian` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $nama
 * @property KategoriInput $kategori
 * @property string|null $kandungan
 * @property string $satuan
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
