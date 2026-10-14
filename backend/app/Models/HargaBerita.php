<?php

namespace App\Models;

use App\Enums\JenisHargaBerita;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model untuk tabel harga_berita (F-10).
 *
 * @property string $id
 * @property string $komoditas_id
 * @property string $kabupaten
 * @property int $harga
 * @property string $satuan
 * @property JenisHargaBerita $jenis_harga
 * @property string $lokasi
 * @property string $tanggal_berita
 * @property string $judul
 * @property string $media
 * @property string $url
 * @property CarbonImmutable $dibuat_pada
 * @property CarbonImmutable $diperbarui_pada
 * @property-read Komoditas $komoditas
 */
class HargaBerita extends Model
{
    protected $table = 'harga_berita';

    protected function casts(): array
    {
        return [
            'harga' => 'integer',
            'jenis_harga' => JenisHargaBerita::class,
            'tanggal_berita' => 'date:Y-m-d',
        ];
    }

    /** @return BelongsTo<Komoditas, $this> */
    public function komoditas(): BelongsTo
    {
        return $this->belongsTo(Komoditas::class, 'komoditas_id');
    }
}
