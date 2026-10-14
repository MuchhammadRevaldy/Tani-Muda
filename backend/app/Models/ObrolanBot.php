<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * F-05: Riwayat percakapan chatbot Tanya Tani Muda.
 */
class ObrolanBot extends Model
{
    use HasUlids;

    protected $table = 'obrolan_bot';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'pengguna_id',
        'percakapan_bot_id',
        'peran',
        'isi',
        'sumber',
        'dibuat_pada',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sumber' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Pengguna, $this>
     */
    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'id');
    }
}
