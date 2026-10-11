<?php

namespace App\Models;

use App\Enums\StatusSiklus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** Tabel `siklus_tanam` (kontrak-api.md bagian 2). */
class SiklusTanam extends Model
{
    protected $table = 'siklus_tanam';

    protected function casts(): array
    {
        return [
            'resep_versi' => 'integer',
            'status' => StatusSiklus::class,
            'luas_m2' => 'float',
            'jumlah_lubang' => 'integer',
            'jumlah_polybag' => 'integer',
            'volume_tandon_liter' => 'float',
            'vertikultur' => 'boolean',
            'nilai_asli' => 'float',
            'tanggal_tanam' => 'date:Y-m-d',
            'dapat_subsidi' => 'boolean',
            'harga_jual' => 'integer',
            'perkiraan_panen_kg' => 'float',
            'petak_ke' => 'integer',
            'pendapatan_nyata' => 'integer',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'petani_id');
    }

    /** @return BelongsTo<Lahan, $this> */
    public function lahan(): BelongsTo
    {
        return $this->belongsTo(Lahan::class, 'lahan_id');
    }

    /** @return BelongsTo<ResepTanam, $this> */
    public function resep(): BelongsTo
    {
        return $this->belongsTo(ResepTanam::class, 'resep_id');
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }

    /** @return BelongsTo<MetodeTanam, $this> */
    public function metode(): BelongsTo
    {
        return $this->belongsTo(MetodeTanam::class, 'metode_id');
    }

    /** @return BelongsTo<AlokasiPesanan, $this> */
    public function alokasi(): BelongsTo
    {
        return $this->belongsTo(AlokasiPesanan::class, 'alokasi_pesanan_id');
    }

    /** @return HasMany<RencanaItem, $this> */
    public function rencanaItem(): HasMany
    {
        return $this->hasMany(RencanaItem::class, 'siklus_id');
    }

    /** @return HasMany<Tugas, $this> */
    public function tugas(): HasMany
    {
        return $this->hasMany(Tugas::class, 'siklus_id');
    }

    /** @return HasMany<HasilPengukuran, $this> */
    public function hasilPengukuran(): HasMany
    {
        return $this->hasMany(HasilPengukuran::class, 'siklus_id');
    }

    /** @return HasMany<Pengeluaran, $this> */
    public function pengeluaran(): HasMany
    {
        return $this->hasMany(Pengeluaran::class, 'siklus_id');
    }

    /** @return HasMany<Jurnal, $this> */
    public function jurnal(): HasMany
    {
        return $this->hasMany(Jurnal::class, 'siklus_id');
    }

    /** @return HasOne<PengaturanPengingat, $this> */
    public function pengaturanPengingat(): HasOne
    {
        return $this->hasOne(PengaturanPengingat::class, 'siklus_id');
    }
}
