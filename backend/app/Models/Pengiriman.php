<?php

namespace App\Models;

use App\Casts\FotoBerkas;
use App\Enums\AlasanPenolakan;
use App\Enums\StatusPengiriman;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * Tabel `pengiriman` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $alokasi_id
 * @property string $pesanan_id
 * @property int $ke
 * @property Carbon $tanggal_jadwal
 * @property float $jumlah_kg
 * @property int $harga_per_kg
 * @property string|null $foto_kualitas
 * @property string|null $foto_timbangan
 * @property StatusPengiriman $status
 * @property Carbon|null $dikirim_pada
 * @property Carbon|null $batas_periksa_pada
 * @property Carbon|null $dikonfirmasi_pada
 * @property bool $dianggap_diterima
 * @property float $jumlah_ditolak_kg
 * @property AlasanPenolakan|null $alasan_penolakan
 * @property string|null $keterangan_penolakan
 * @property string|null $foto_penolakan
 * @property int|null $nilai_diterima
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Pengiriman extends Model
{
    protected $table = 'pengiriman';

    protected function casts(): array
    {
        return [
            'foto_kualitas' => FotoBerkas::class,
            'foto_timbangan' => FotoBerkas::class,
            'foto_penolakan' => FotoBerkas::class,
            'ke' => 'integer',
            'tanggal_jadwal' => 'date:Y-m-d',
            'jumlah_kg' => 'float',
            'harga_per_kg' => 'integer',
            'status' => StatusPengiriman::class,
            'dikirim_pada' => 'datetime',
            'batas_periksa_pada' => 'datetime',
            'dikonfirmasi_pada' => 'datetime',
            'dianggap_diterima' => 'boolean',
            'jumlah_ditolak_kg' => 'float',
            'alasan_penolakan' => AlasanPenolakan::class,
            'nilai_diterima' => 'integer',
        ];
    }

    /** @return BelongsTo<AlokasiPesanan, $this> */
    public function alokasi(): BelongsTo
    {
        return $this->belongsTo(AlokasiPesanan::class, 'alokasi_id');
    }

    /** @return BelongsTo<Pesanan, $this> */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }

    /** @return HasMany<Rating, $this> */
    public function rating(): HasMany
    {
        return $this->hasMany(Rating::class, 'pengiriman_id');
    }

    /** @return HasOne<Sengketa, $this> */
    public function sengketa(): HasOne
    {
        return $this->hasOne(Sengketa::class, 'pengiriman_id');
    }

    /** @return HasMany<Pembayaran, $this> */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'pengiriman_id');
    }
}
