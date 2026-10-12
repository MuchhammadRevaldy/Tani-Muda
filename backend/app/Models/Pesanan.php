<?php

namespace App\Models;

use App\Enums\JenisPesanan;
use App\Enums\StatusPesanan;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `pesanan` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $pembeli_id
 * @property JenisPesanan $jenis
 * @property string $komoditas_id
 * @property float|null $jumlah_per_kiriman_kg
 * @property int|null $frekuensi_hari
 * @property int $jumlah_kiriman
 * @property float $jumlah_total_kg
 * @property Carbon|null $tanggal_mulai
 * @property Carbon|null $tanggal_selesai
 * @property string|null $perkiraan_bulan_panen
 * @property int $harga_per_kg
 * @property array<mixed> $standar_kualitas
 * @property string $wilayah_id
 * @property string $alamat_antar
 * @property string|null $patokan
 * @property string|null $batas_jam_antar
 * @property StatusPesanan $status
 * @property int $nilai_pesanan
 * @property int $uang_muka
 * @property int $biaya_layanan
 * @property int $saldo_uang_muka
 * @property float $terambil_kg
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class Pesanan extends Model
{
    protected $table = 'pesanan';

    protected function casts(): array
    {
        return [
            'jenis' => JenisPesanan::class,
            'jumlah_per_kiriman_kg' => 'float',
            'frekuensi_hari' => 'integer',
            'jumlah_kiriman' => 'integer',
            'jumlah_total_kg' => 'float',
            'tanggal_mulai' => 'date:Y-m-d',
            'tanggal_selesai' => 'date:Y-m-d',
            'harga_per_kg' => 'integer',
            'standar_kualitas' => 'array',
            'status' => StatusPesanan::class,
            'nilai_pesanan' => 'integer',
            'uang_muka' => 'integer',
            'biaya_layanan' => 'integer',
            'saldo_uang_muka' => 'integer',
            'terambil_kg' => 'float',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pembeli(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pembeli_id');
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }

    /** @return HasMany<AlokasiPesanan, $this> */
    public function alokasi(): HasMany
    {
        return $this->hasMany(AlokasiPesanan::class, 'pesanan_id');
    }

    /** @return HasMany<Pengiriman, $this> */
    public function pengiriman(): HasMany
    {
        return $this->hasMany(Pengiriman::class, 'pesanan_id');
    }

    /** @return HasMany<Pembayaran, $this> */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'pesanan_id');
    }
}
