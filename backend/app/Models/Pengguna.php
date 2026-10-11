<?php

namespace App\Models;

use App\Enums\Peran;
use App\Enums\StatusAkun;
use App\Models\Concerns\IdString;
use App\Support\Waktu;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Tabel `pengguna` (kontrak-api.md 2.1). Masuk dengan nomor HP dan OTP; tanpa kata sandi dan nama
 * pengguna (D-04). Sesi cookie Sanctum untuk web, token untuk aplikasi React Native kelak (D-21).
 *
 * @property Peran|null $peran
 * @property StatusAkun $status_akun
 */
class Pengguna extends Authenticatable
{
    use HasApiTokens, IdString, Notifiable;

    public const CREATED_AT = 'dibuat_pada';

    public const UPDATED_AT = 'diperbarui_pada';

    protected $table = 'pengguna';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = ['id', 'dibuat_pada', 'diperbarui_pada'];

    protected $hidden = ['diperbarui_pada'];

    /** Tanpa kata sandi (D-04): sesi "ingat saya" tidak dipakai. */
    protected $rememberTokenName = '';

    protected function casts(): array
    {
        return [
            'peran' => Peran::class,
            'status_akun' => StatusAkun::class,
            'terdaftar_kelompok_tani' => 'boolean',
            'setuju_privasi_pada' => 'datetime',
        ];
    }

    protected function serializeDate(DateTimeInterface $date): string
    {
        return Waktu::iso($date);
    }

    public function getAuthPassword(): string
    {
        return '';
    }

    /** @return BelongsTo<Wilayah, $this> */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'wilayah_id');
    }

    /** @return HasOne<ProfilPembeli, $this> */
    public function profilPembeli(): HasOne
    {
        return $this->hasOne(ProfilPembeli::class, 'pengguna_id');
    }

    /** @return HasMany<Lahan, $this> */
    public function lahan(): HasMany
    {
        return $this->hasMany(Lahan::class, 'petani_id');
    }

    /** @return HasMany<SiklusTanam, $this> */
    public function siklus(): HasMany
    {
        return $this->hasMany(SiklusTanam::class, 'petani_id');
    }

    /** Pesanan yang dipasang pembeli ini. @return HasMany<Pesanan, $this> */
    public function pesanan(): HasMany
    {
        return $this->hasMany(Pesanan::class, 'pembeli_id');
    }

    /** Alokasi pesanan yang diambil petani ini. @return HasMany<AlokasiPesanan, $this> */
    public function alokasi(): HasMany
    {
        return $this->hasMany(AlokasiPesanan::class, 'petani_id');
    }

    /** Catatan admin tentang petani ini (D-03). @return HasMany<CatatanPetani, $this> */
    public function catatan(): HasMany
    {
        return $this->hasMany(CatatanPetani::class, 'petani_id');
    }

    /** @return HasMany<ProgresModul, $this> */
    public function progresModul(): HasMany
    {
        return $this->hasMany(ProgresModul::class, 'pengguna_id');
    }

    /** @return HasMany<PermintaanResep, $this> */
    public function permintaanResep(): HasMany
    {
        return $this->hasMany(PermintaanResep::class, 'pengguna_id');
    }
}
