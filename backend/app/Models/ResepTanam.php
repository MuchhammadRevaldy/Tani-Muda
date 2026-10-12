<?php

namespace App\Models;

use App\Enums\AsalAngkaContoh;
use App\Enums\DasarUkuran;
use App\Enums\StatusResep;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Tabel `resep_tanam` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $komoditas_id
 * @property string $metode_id
 * @property int $versi
 * @property StatusResep $status
 * @property bool $contoh
 * @property AsalAngkaContoh|null $asal_angka_contoh
 * @property string|null $validator
 * @property Carbon|null $tanggal_validasi
 * @property float $hasil_per_satuan
 * @property DasarUkuran $dasar_ukuran
 * @property int $umur_panen_hari
 * @property int|null $jumlah_pengisian_larutan
 * @property int|null $persen_panen_jelek
 * @property string|null $alasan_panen_jelek
 * @property array<mixed> $standar_kualitas
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class ResepTanam extends Model
{
    protected $table = 'resep_tanam';

    protected function casts(): array
    {
        return [
            'versi' => 'integer',
            'status' => StatusResep::class,
            'contoh' => 'boolean',
            'asal_angka_contoh' => AsalAngkaContoh::class,
            'tanggal_validasi' => 'date:Y-m-d',
            'hasil_per_satuan' => 'float',
            'dasar_ukuran' => DasarUkuran::class,
            'umur_panen_hari' => 'integer',
            'jumlah_pengisian_larutan' => 'integer',
            'persen_panen_jelek' => 'integer',
            'standar_kualitas' => 'array',
        ];
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

    /** @return HasMany<ResepInput, $this> */
    public function input(): HasMany
    {
        return $this->hasMany(ResepInput::class, 'resep_id');
    }

    /** @return HasMany<ResepTugas, $this> */
    public function tugas(): HasMany
    {
        return $this->hasMany(ResepTugas::class, 'resep_id');
    }
}
