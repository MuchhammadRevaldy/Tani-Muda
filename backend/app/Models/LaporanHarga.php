<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `laporan_harga` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $merek_id
 * @property string $pelapor_id
 * @property int $harga_kemasan
 * @property string $kecamatan
 * @property Carbon $tanggal
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class LaporanHarga extends Model
{
    protected $table = 'laporan_harga';

    protected function casts(): array
    {
        return [
            'harga_kemasan' => 'integer',
            'tanggal' => 'date:Y-m-d',
        ];
    }

    /** @return BelongsTo<MerekInput, $this> */
    public function merek(): BelongsTo
    {
        return $this->belongsTo(MerekInput::class, 'merek_id');
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pelapor(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pelapor_id');
    }
}
