<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tabel `pengaturan_pengingat` (kontrak-api.md bagian 2). */
class PengaturanPengingat extends Model
{
    protected $table = 'pengaturan_pengingat';

    protected $primaryKey = 'siklus_id';

    protected function casts(): array
    {
        return [
            'pengingat_sore' => 'boolean',
            'tipe_aktif' => 'array',
        ];
    }

    /** @return BelongsTo<SiklusTanam, $this> */
    public function siklus(): BelongsTo
    {
        return $this->belongsTo(SiklusTanam::class, 'siklus_id');
    }
}
