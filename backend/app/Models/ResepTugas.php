<?php

namespace App\Models;

use App\Enums\TipeTugas;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabel `resep_tugas` (kontrak-api.md bagian 2).
 *
 * @property int $nomor
 * @property string $resep_id
 * @property string $id
 * @property int $urutan
 * @property string $judul
 * @property TipeTugas $tipe
 * @property int $hst_mulai
 * @property int|null $hst_selesai
 * @property int|null $interval
 * @property array<mixed>|null $ukur
 * @property bool $boleh_digeser
 * @property string|null $saran_terlambat
 * @property array<mixed>|null $cara_mengerjakan
 */
class ResepTugas extends Model
{
    protected $table = 'resep_tugas';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'tipe' => TipeTugas::class,
            'hst_mulai' => 'integer',
            'hst_selesai' => 'integer',
            'interval' => 'integer',
            'ukur' => 'array',
            'boleh_digeser' => 'boolean',
            'cara_mengerjakan' => 'array',
        ];
    }

    /** @return BelongsTo<ResepTanam, $this> */
    public function resep(): BelongsTo
    {
        return $this->belongsTo(ResepTanam::class, 'resep_id');
    }
}
