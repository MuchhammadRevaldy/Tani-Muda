<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `progres_modul` (kontrak-api.md bagian 2).
 *
 * @property int $nomor
 * @property string $pengguna_id
 * @property string $modul_id
 * @property Carbon $selesai_pada
 */
class ProgresModul extends Model
{
    protected $table = 'progres_modul';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'selesai_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    /** @return BelongsTo<Modul, $this> */
    public function modul(): BelongsTo
    {
        return $this->belongsTo(Modul::class, 'modul_id');
    }
}
