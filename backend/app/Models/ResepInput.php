<?php

namespace App\Models;

use App\Enums\DasarDosis;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabel `resep_input` (kontrak-api.md bagian 2).
 *
 * @property int $nomor
 * @property string $resep_id
 * @property string $id
 * @property int $urutan
 * @property string|null $input_id
 * @property string $nama
 * @property string $grup
 * @property float $dosis
 * @property string $satuan_dosis
 * @property DasarDosis $dasar_dosis
 * @property string $satuan_beli
 * @property float|null $isi_satuan_beli
 * @property float $ukuran_kemasan
 * @property bool $alat_sekali_beli
 * @property int|null $harga_contoh
 */
class ResepInput extends Model
{
    protected $table = 'resep_input';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'dosis' => 'float',
            'dasar_dosis' => DasarDosis::class,
            'isi_satuan_beli' => 'float',
            'ukuran_kemasan' => 'float',
            'alat_sekali_beli' => 'boolean',
            'harga_contoh' => 'integer',
        ];
    }

    /** @return BelongsTo<ResepTanam, $this> */
    public function resep(): BelongsTo
    {
        return $this->belongsTo(ResepTanam::class, 'resep_id');
    }

    /** @return BelongsTo<InputPertanian, $this> */
    public function inputPertanian(): BelongsTo
    {
        return $this->belongsTo(InputPertanian::class, 'input_id');
    }
}
