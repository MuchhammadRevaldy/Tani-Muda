<?php

namespace App\Enums;

/** Nilai sama dengan kontrak-api.md bagian 2 (dicek tests/Unit/SkemaKontrakTest.php). */
enum KategoriInput: string
{
    use NilaiEnum;

    case Benih = 'benih';
    case OrganikPadat = 'organik_padat';
    case OrganikCair = 'organik_cair';
    case AnorganikTunggal = 'anorganik_tunggal';
    case AnorganikMajemuk = 'anorganik_majemuk';
    case NutrisiHidroponik = 'nutrisi_hidroponik';
    case PembenahTanah = 'pembenah_tanah';
    case BahanLain = 'bahan_lain';
}
