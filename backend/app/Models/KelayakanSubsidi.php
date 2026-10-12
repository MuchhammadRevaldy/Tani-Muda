<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `kelayakan_subsidi` (kontrak-api.md bagian 2).
 *
 * @property int $nomor
 * @property string $input_id
 * @property string $komoditas_id
 * @property Carbon $berlaku_mulai
 * @property Carbon $berlaku_sampai
 * @property int $het_per_satuan
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
