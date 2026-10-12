<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `modul` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $komoditas_id
 * @property string $metode_id
 * @property string $tahap
 * @property string $judul
 * @property string $ringkasan
 * @property int $menit
 * @property int $urutan
 * @property int $hst_mulai
 * @property string|null $video_url
 * @property float|null $ukuran_video_mb
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Modul extends Model
{
    protected $table = 'modul';

    protected function casts(): array
    {
        return [
            'menit' => 'integer',
            'urutan' => 'integer',
            'hst_mulai' => 'integer',
            'ukuran_video_mb' => 'float',
        ];
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    /** @return BelongsTo<MetodeTanam, $this> */
    public function metode(): BelongsTo
    {
        return $this->belongsTo(MetodeTanam::class, 'metode_id');
    }
}
