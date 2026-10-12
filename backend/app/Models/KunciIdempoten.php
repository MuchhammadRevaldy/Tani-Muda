<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `kunci_idempoten` (kontrak-api.md bagian 2).
 *
 * @property int $nomor
 * @property string $pengguna_id
 * @property string $kunci
 * @property string $endpoint
 * @property int|null $status_http
 * @property array<mixed>|null $respons
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class KunciIdempoten extends Model
{
    protected $table = 'kunci_idempoten';

    protected $primaryKey = 'nomor';

    public $incrementing = true;

    protected $keyType = 'int';

    protected function casts(): array
    {
        return [
            'status_http' => 'integer',
            'respons' => 'array',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}
