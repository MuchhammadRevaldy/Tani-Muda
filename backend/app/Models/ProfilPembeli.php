<?php

namespace App\Models;

use App\Enums\JenisUsaha;
use App\Enums\StatusVerifikasi;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabel `profil_pembeli` (kontrak-api.md bagian 2).
 *
 * @property JenisUsaha $jenis_usaha
 * @property StatusVerifikasi $status_verifikasi
 */
class ProfilPembeli extends Model
{
    protected $table = 'profil_pembeli';

    protected $primaryKey = 'pengguna_id';

    protected function casts(): array
    {
        return [
            'jenis_usaha' => JenisUsaha::class,
            'status_verifikasi' => StatusVerifikasi::class,
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }
}
