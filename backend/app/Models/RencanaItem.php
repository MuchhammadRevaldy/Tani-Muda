<?php

namespace App\Models;

use App\Enums\AsalRencana;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `rencana_item` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $siklus_id
 * @property string|null $resep_input_id
 * @property string|null $input_id
 * @property string|null $merek_id
 * @property string $nama
 * @property string $grup
 * @property float $jumlah
 * @property string $satuan
 * @property float|null $harga_satuan
 * @property AsalRencana $asal
 * @property bool $alat_sekali_beli
 * @property int $jumlah_siklus_pembagian
 * @property int $urutan
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class RencanaItem extends Model
{
    protected $table = 'rencana_item';

    protected function casts(): array
    {
        return [
            'jumlah' => 'float',
            'harga_satuan' => 'float',
            'asal' => AsalRencana::class,
            'alat_sekali_beli' => 'boolean',
            'jumlah_siklus_pembagian' => 'integer',
        ];
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }

    /** @return BelongsTo<InputPertanian, $this> */
    public function input(): BelongsTo
    {
        return $this->belongsTo(InputPertanian::class, 'input_id');
    }

    /** @return BelongsTo<MerekInput, $this> */
    public function merek(): BelongsTo
    {
        return $this->belongsTo(MerekInput::class, 'merek_id');
    }
}
