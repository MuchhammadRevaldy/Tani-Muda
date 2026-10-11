<?php

namespace App\Models;

use App\Models\Concerns\IdString;
use App\Support\Waktu;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model as Eloquent;

/**
 * Dasar model Tani Muda: ID string (ID data contoh dipakai apa adanya, ID baru berupa ULID), kolom
 * waktu `dibuat_pada`/`diperbarui_pada`, dan waktu berformat kontrak (ISO 8601 UTC `…000Z`).
 *
 * ID dan kolom waktu tidak bisa diisi massal dari permintaan klien; seeder memakai forceFill.
 */
abstract class Model extends Eloquent
{
    use IdString;

    public const CREATED_AT = 'dibuat_pada';

    public const UPDATED_AT = 'diperbarui_pada';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = ['id', 'dibuat_pada', 'diperbarui_pada'];

    protected function serializeDate(DateTimeInterface $date): string
    {
        return Waktu::iso($date);
    }
}
