<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `kunci_idempoten` (kontrak-api.md bagian 2). */
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
