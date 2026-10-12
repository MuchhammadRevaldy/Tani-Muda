<?php

namespace App\Models;

use App\Enums\DasarUkuran;
use App\Enums\ModalAwal;
use Illuminate\Support\Carbon;

/**
 * Tabel `metode_tanam` (kontrak-api.md bagian 2).
 *
 * @property string $id
 * @property string $nama
 * @property DasarUkuran $dasar_ukuran
 * @property ModalAwal $modal_awal
 * @property bool $bisa_vertikultur
 * @property string $kebutuhan_lahan
 * @property string $frekuensi_perawatan
 * @property Carbon $dibuat_pada
 * @property Carbon|null $diperbarui_pada
 */
class MetodeTanam extends Model
{
    protected $table = 'metode_tanam';

    protected function casts(): array
    {
        return [
            'dasar_ukuran' => DasarUkuran::class,
            'modal_awal' => ModalAwal::class,
            'bisa_vertikultur' => 'boolean',
        ];
    }
}
