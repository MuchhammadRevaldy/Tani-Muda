<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `laporan_harga` (kontrak-api.md bagian 2). */
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
