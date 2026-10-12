<?php

namespace App\Domain\Hitung;

/**
 * Kapasitas lahan (frontend/src/lib/kapasitas-lahan.ts; P0-21, D-15, D-34, D-40). Lahan tanah
 * dalam m², hidroponik dalam lubang. Yang memakai lahan: siklus aktif, dan rencana yang terhubung
 * ke alokasi pesanan. Petak pesanan rutin dihitung dari puncak petak yang tumbuh bersamaan.
 *
 * Lahan: `{ id, jenisLahan, luasM2, kapasitasLubang }`. Siklus: `{ lahanId, status, luasM2,
 * jumlahLubang, alokasiPesananId, petakKe?, tanggalTanam?, tanggalPanen? }`.
 *
 * @phpstan-type Kapasitas array{satuan: string, total: int|float, dipakai: float, sisa: float}
 */
final class KapasitasLahan
{
    /**
     * @param  list<array{mulai: string, akhir: string, ukuran: int|float}>  $petak
     */
    public static function puncakBersamaan(array $petak): float
    {
        $puncak = 0;
        foreach ($petak as $t) {
            $jumlah = 0;
            foreach ($petak as $x) {
                if ($x['mulai'] <= $t['mulai'] && $t['mulai'] < $x['akhir']) {
                    $jumlah += $x['ukuran'];
                }
            }
            $puncak = max($puncak, $jumlah);
        }

        return Angka::bulat2($puncak);
    }

    /** @param  array<string, mixed>  $s */
    public static function memakaiLahan(array $s): bool
    {
        return $s['status'] === 'aktif' || ($s['status'] === 'rencana' && ($s['alokasiPesananId'] ?? null) !== null);
    }

    /** @param  array<string, mixed>  $lahan */
    public static function satuan(array $lahan): string
    {
        return $lahan['jenisLahan'] === 'hidroponik' ? 'lubang' : 'm2';
    }

    /** @param  array<string, mixed>  $s */
    private static function petakBertahap(array $s): bool
    {
        return ($s['alokasiPesananId'] ?? null) !== null && ($s['petakKe'] ?? null) !== null
            && ! empty($s['tanggalTanam']) && ! empty($s['tanggalPanen']);
    }

    /**
     * @param  array<string, mixed>  $lahan
     * @param  list<array<string, mixed>>  $siklus
     */
    public static function dipakaiSiklus(array $lahan, array $siklus): float
    {
        $lubang = self::satuan($lahan) === 'lubang';
        $ukuran = fn (array $s) => max(0, ($lubang ? ($s['jumlahLubang'] ?? null) : ($s['luasM2'] ?? null)) ?? 0);
        $biasa = 0;
        $kelompok = [];
        foreach ($siklus as $s) {
            if (($s['lahanId'] ?? null) !== $lahan['id'] || ! self::memakaiLahan($s)) {
                continue;
            }
            if (self::petakBertahap($s)) {
                $kelompok[$s['alokasiPesananId']][] = ['mulai' => $s['tanggalTanam'], 'akhir' => $s['tanggalPanen'], 'ukuran' => $ukuran($s)];
            } else {
                $biasa += $ukuran($s);
            }
        }
        $bertahap = 0;
        foreach ($kelompok as $petak) {
            $bertahap += self::puncakBersamaan($petak);
        }

        return Angka::bulat2($biasa + $bertahap);
    }

    /**
     * @param  array<string, mixed>  $lahan
     * @param  list<array<string, mixed>>  $siklus
     * @return Kapasitas
     */
    public static function kapasitasLahan(array $lahan, array $siklus): array
    {
        $satuan = self::satuan($lahan);
        $total = max(0, ($satuan === 'lubang' ? ($lahan['kapasitasLubang'] ?? null) : ($lahan['luasM2'] ?? null)) ?? 0);
        $dipakai = self::dipakaiSiklus($lahan, $siklus);

        return ['satuan' => $satuan, 'total' => $total, 'dipakai' => $dipakai, 'sisa' => Angka::bulat2(max(0, $total - $dipakai))];
    }

    /**
     * @param  array<string, mixed>  $lahan
     * @param  list<array<string, mixed>>  $siklus
     * @return array{ok: true, nilai: Kapasitas}|array{ok: false, galat: string}
     */
    public static function muatSiklusBaru(array $lahan, array $siklus, int|float $ukuranBaru): array
    {
        if (! ($ukuranBaru > 0)) {
            return Hasil::gagal('UKURAN_KOSONG');
        }
        $k = self::kapasitasLahan($lahan, $siklus);
        if ($ukuranBaru > $k['sisa'] + 1e-9) {
            return Hasil::gagal('LAHAN_TIDAK_CUKUP');
        }

        return Hasil::ok(['dipakai' => Angka::bulat2($k['dipakai'] + $ukuranBaru), 'sisa' => Angka::bulat2($k['sisa'] - $ukuranBaru)] + $k);
    }

    /**
     * @param  array<string, mixed>  $lahan
     * @param  list<array<string, mixed>>  $siklusLain
     * @param  list<array<string, mixed>>  $baru
     * @return array{ok: true, nilai: Kapasitas}|array{ok: false, galat: string}
     */
    public static function muatSiklusBanyak(array $lahan, array $siklusLain, array $baru): array
    {
        if ($baru === []) {
            return Hasil::gagal('UKURAN_KOSONG');
        }
        $k = self::kapasitasLahan($lahan, [...$siklusLain, ...$baru]);

        return $k['dipakai'] > $k['total'] + 1e-9 ? Hasil::gagal('LAHAN_TIDAK_CUKUP') : Hasil::ok($k);
    }
}
