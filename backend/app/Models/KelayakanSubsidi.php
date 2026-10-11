<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `kelayakan_subsidi` (kontrak-api.md bagian 2). */
class KelayakanSubsidi extends Model
{
    protected $table = 'kelayakan_subsidi';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    protected function casts(): array
    {
        return [
            'berlaku_mulai' => 'date:Y-m-d',
            'berlaku_sampai' => 'date:Y-m-d',
            'het_per_satuan' => 'integer',
        ];
    }

    /** @return BelongsTo<InputPertanian, $this> */
    public function input(): BelongsTo
    {
        return $this->belongsTo(InputPertanian::class, 'input_id');
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }
}
