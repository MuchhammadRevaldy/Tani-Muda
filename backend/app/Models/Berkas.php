<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `berkas` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $pemilik_id
 * @property string $jalur
 * @property string $jenis
 * @property int $ukuran_byte
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
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
