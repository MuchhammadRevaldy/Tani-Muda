<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `berkas` (kontrak-api.md bagian 2). */
class Berkas extends Model
{
    protected $table = 'berkas';

    protected function casts(): array
    {
        return [
            'ukuran_byte' => 'integer',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pemilik(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pemilik_id');
    }
}
