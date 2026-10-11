<?php

namespace App\Models;

use App\Enums\SatuanKonversi;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `konversi_satuan` (kontrak-api.md bagian 2). */
class KonversiSatuan extends Model
{
    protected $table = 'konversi_satuan';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    protected function casts(): array
    {
        return [
            'satuan' => SatuanKonversi::class,
            'nilai_m2' => 'float',
        ];
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }
}
