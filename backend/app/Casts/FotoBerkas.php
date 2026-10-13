<?php

namespace App\Casts;

use App\Http\Galat\GalatApi;
use App\Models\Berkas;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;

/**
 * Kolom foto yang menunjuk berkas privat (arsitektur-backend.md bagian 13, [AG-22]).
 *
 * - Disimpan: URL unduh bertanda tangan dari `POST /berkas` (atau `berkas:{id}`) menjadi rujukan
 *   tetap `berkas:{id}`, supaya foto tidak rusak setelah tanda tangan kedaluwarsa. Hanya pemilik
 *   berkas yang boleh memakainya.
 * - Dibaca: `berkas:{id}` menjadi URL unduh bertanda tangan baru yang berlaku 10 menit.
 * - Nilai lain (mis. foto data contoh `/contoh/foto/...`) dibiarkan apa adanya.
 *
 * @implements CastsAttributes<string|null, string|null>
 */
class FotoBerkas implements CastsAttributes
{
    public const MENIT_BERLAKU = 10;

    public static function url(string $berkasId): string
    {
        return URL::temporarySignedRoute('berkas.unduh', now()->addMinutes(self::MENIT_BERLAKU), ['id' => $berkasId], absolute: false);
    }

    /** Id berkas dari URL unduh atau rujukan `berkas:{id}`; null untuk nilai lain. */
    public static function idDari(string $nilai): ?string
    {
        if (str_starts_with($nilai, 'berkas:')) {
            return substr($nilai, strlen('berkas:'));
        }

        return preg_match('#^/api/v1/berkas/([0-9A-Za-z-]+)/unduh(\?|$)#', $nilai, $m) === 1 ? $m[1] : null;
    }

    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        return str_starts_with($value, 'berkas:') ? self::url(substr($value, strlen('berkas:'))) : $value;
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }
        $id = self::idDari($value);
        if ($id === null) {
            return $value;
        }
        $berkas = Berkas::find($id);
        $pengguna = auth()->id();
        if ($berkas === null || ($pengguna !== null && $berkas->pemilik_id !== $pengguna)) {
            throw GalatApi::validasi([$key => 'VALIDASI']);
        }

        return 'berkas:'.$berkas->id;
    }
}
