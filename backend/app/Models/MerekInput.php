<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `merek_input` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $input_id
 * @property string $nama
 * @property string|null $produsen
 * @property float $isi_kemasan
 * @property string $teks_kemasan
 * @property string|null $nomor_pendaftaran
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
