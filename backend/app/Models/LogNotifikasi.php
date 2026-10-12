<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `log_notifikasi` (kontrak-api.md bagian 2).
 *
 * @property int $nomor
 * @property string $pengguna_id
 * @property string $jenis
 * @property string $kunci
 * @property Carbon $dikirim_pada
 */
class LogNotifikasi extends Model
{
    protected $table = 'log_notifikasi';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'dikirim_pada' => 'datetime',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}
