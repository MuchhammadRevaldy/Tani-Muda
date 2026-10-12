<?php

namespace App\Models;

use App\Enums\JenisUsaha;
use App\Enums\StatusVerifikasi;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tabel `profil_pembeli` (kontrak-api.md bagian 2).
 *
 * @property string $pengguna_id
 * @property string $nama_usaha
 * @property JenisUsaha $jenis_usaha
 * @property string $alamat
 * @property string $wilayah_id
 * @property string|null $foto_tempat_usaha
 * @property StatusVerifikasi $status_verifikasi
 * @property string|null $alasan_ditolak
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
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
