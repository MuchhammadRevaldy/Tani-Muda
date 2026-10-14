<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model LencanaPengguna (PRD Tambahan F-03, D-64).
 *
 * @property string $id
 * @property string $pengguna_id
 * @property string $kode
 * @property CarbonImmutable $diraih_pada
 * @property CarbonImmutable|null $dilihat_pada
 */
class LencanaPengguna extends Model
{
    protected $table = 'lencana_pengguna';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'pengguna_id',
        'kode',
        'diraih_pada',
        'dilihat_pada',
    ];

    protected function casts(): array
    {
        return [
            'diraih_pada' => 'immutable_datetime',
            'dilihat_pada' => 'immutable_datetime',
        ];
    }

    /** @return BelongsTo<Pengguna, $this> */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }
}
