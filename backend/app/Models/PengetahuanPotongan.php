<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * F-05: Potongan teks dokumen untuk pencarian semantik atau kata kunci.
 */
class PengetahuanPotongan extends Model
{
    use HasUlids;

    protected $table = 'pengetahuan_potongan';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'sumber_id',
        'urutan',
        'isi',
        'embedding',
        'dibuat_pada',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'embedding' => 'array',
        ];
    }

    /**
     * @return BelongsTo<PengetahuanSumber, $this>
     */
    public function sumber(): BelongsTo
    {
        return $this->belongsTo(PengetahuanSumber::class, 'sumber_id', 'id');
    }
}
