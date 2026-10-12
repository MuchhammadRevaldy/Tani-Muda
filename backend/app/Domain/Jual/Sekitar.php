<?php

namespace App\Domain\Jual;

use App\Domain\Hitung\Angka;
use App\Domain\Hitung\Jarak;
use App\Enums\StatusAlokasi;
use App\Enums\StatusPesanan;
use App\Models\Pengguna;
use App\Models\Pesanan;
use App\Models\Wilayah;

/**
 * Pesanan terbuka, sisa, dan jarak (klien tiruan `sisaPesananKg`, `pesananTerbuka`,
 * `jarakPesananKm`; kontrak 3.7, D-06). Sisa dihitung per pesanan sampai model D-55 dikerjakan.
 */
final class Sekitar
{
    /** Status alokasi yang mengurangi sisa pesanan. */
    public const ALOKASI_AKTIF = [
        StatusAlokasi::MenungguKesepakatan->value,
        StatusAlokasi::Disepakati->value,
        StatusAlokasi::Berjalan->value,
        StatusAlokasi::Selesai->value,
    ];

    /** Sisa yang masih bisa diambil: per kiriman (rutin) atau total (sekali panen). */
    public static function sisaKg(Pesanan $p): float
    {
        $terambil = (float) $p->alokasi()->whereIn('status', self::ALOKASI_AKTIF)->sum('jumlah_kg');

        return Angka::bulat2(($p->jumlah_per_kiriman_kg ?? $p->jumlah_total_kg) - $terambil);
    }

    public static function terbuka(Pesanan $p): bool
    {
        return in_array($p->status, [StatusPesanan::MencariPetani, StatusPesanan::Berjalan], true) && self::sisaKg($p) > 0;
    }

    /** Jarak (km, satu desimal) titik tengah desa petani ke desa titik antar; null bila tak bertitik. */
    public static function jarakKm(Pengguna $petani, Pesanan $p): ?float
    {
        $a = Jarak::titik(Wilayah::find($petani->wilayah_id));
        $b = Jarak::titik(Wilayah::find($p->wilayah_id));

        return $a && $b ? Angka::bulat(Jarak::jarakKm($a, $b), 1) : null;
    }
}
