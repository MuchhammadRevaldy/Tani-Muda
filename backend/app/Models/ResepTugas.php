<?php

namespace App\Models;

use App\Enums\TipeTugas;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `resep_tugas` (kontrak-api.md bagian 2). */
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
