<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * F-05: Sumber dokumen basis pengetahuan (resep, modul, paper).
 */
class PengetahuanSumber extends Model
{
    use HasUlids;

    protected $table = 'pengetahuan_sumber';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'judul',
        'jenis',
        'lisensi',
        'url',
        'dibuat_pada',
    ];

    /**
     * @return HasMany<PengetahuanPotongan, $this>
     */
    public function potongan(): HasMany
    {
        return $this->hasMany(PengetahuanPotongan::class, 'sumber_id', 'id');
    }
}
