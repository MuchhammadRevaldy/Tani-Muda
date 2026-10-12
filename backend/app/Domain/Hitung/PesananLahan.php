<?php

namespace App\Domain\Hitung;

/**
 * Lahan untuk pesanan dan jadwal kiriman (frontend/src/lib/pesanan-lahan.ts; P0-21, D-39, D-40).
 */
final class PesananLahan
{
    private const EPS = 1e-9;

    /** @return array{ok: true, nilai: float}|array{ok: false, galat: string} */
    public static function luasPerPanen(int|float $jumlahKg, int|float $hasilPerSatuan): array
    {
        if (! ($hasilPerSatuan > 0)) {
            return Hasil::gagal('HASIL_KOSONG');
        }
        if (! ($jumlahKg > 0)) {
            return Hasil::gagal('JUMLAH_KOSONG');
        }

        return Hasil::ok(Angka::bulat2($jumlahKg / $hasilPerSatuan));
    }

    /** @return array{ok: true, nilai: int}|array{ok: false, galat: string} */
    public static function jumlahPetakBersamaan(mixed $frekuensiHari, int|float $umurPanenHari): array
    {
        if (! is_int($frekuensiHari) || $frekuensiHari < 1 || ! ($umurPanenHari > 0)) {
            return Hasil::gagal('FREKUENSI_TIDAK_VALID');
        }

        return Hasil::ok((int) ceil($umurPanenHari / $frekuensiHari - self::EPS));
    }

    /**
     * @param  array{jenis: string, jumlahKg: int|float, hasilPerSatuan: int|float, frekuensiHari?: int|null, umurPanenHari?: int|float|null}  $m
     * @return array{ok: true, nilai: array{luasPerPanen: float, jumlahPetak: int, luasTotal: float}}|array{ok: false, galat: string}
     */
    public static function kebutuhanLahanPesanan(array $m): array
    {
        $luas = self::luasPerPanen($m['jumlahKg'], $m['hasilPerSatuan']);
        if (! $luas['ok']) {
            return $luas;
        }
        if ($m['jenis'] === 'sekali_panen') {
            return Hasil::ok(['luasPerPanen' => $luas['nilai'], 'jumlahPetak' => 1, 'luasTotal' => $luas['nilai']]);
        }
        $petak = self::jumlahPetakBersamaan($m['frekuensiHari'] ?? 0, $m['umurPanenHari'] ?? 0);
        if (! $petak['ok']) {
            return $petak;
        }

        return Hasil::ok([
            'luasPerPanen' => $luas['nilai'],
            'jumlahPetak' => $petak['nilai'],
            'luasTotal' => Angka::bulat2($m['jumlahKg'] / $m['hasilPerSatuan'] * $petak['nilai']),
        ]);
    }

    /**
     * @param  array{jenis: string, jumlahKg: int|float, hasilPerSatuan: int|float, kapasitas: int|float, frekuensiHari?: int|null, umurPanenHari?: int|float|null}  $m
     * @return array{ok: true, nilai: array{cukup: bool, dibutuhkan: float, kapasitas: int|float, jumlahMaksimalKg: float}}|array{ok: false, galat: string}
     */
    public static function cekAmbilSebagian(array $m): array
    {
        $butuh = self::kebutuhanLahanPesanan($m);
        if (! $butuh['ok']) {
            return $butuh;
        }
        $kapasitas = max(0, $m['kapasitas']);
        $maks = floor($kapasitas / $butuh['nilai']['jumlahPetak'] * $m['hasilPerSatuan'] * 10 + self::EPS) / 10;

        return Hasil::ok([
            'cukup' => $butuh['nilai']['luasTotal'] <= $kapasitas + self::EPS,
            'dibutuhkan' => $butuh['nilai']['luasTotal'],
            'kapasitas' => $kapasitas,
            'jumlahMaksimalKg' => $maks,
        ]);
    }

    /**
     * @param  list<int|float>  $alokasiKg
     * @return array{ok: true, nilai: array{sisaSebelum: float, sisaSesudah: float}}|array{ok: false, galat: string}
     */
    public static function batasAlokasi(int|float $jumlahPesananKg, array $alokasiKg, mixed $jumlahBaruKg): array
    {
        if (! is_numeric($jumlahBaruKg) || ! ($jumlahBaruKg > 0)) {
            return Hasil::gagal('JUMLAH_KOSONG');
        }
        $sisa = Angka::bulat2($jumlahPesananKg - array_sum($alokasiKg));
        if ($jumlahBaruKg > $sisa + self::EPS) {
            return Hasil::gagal('MELEBIHI_PESANAN');
        }

        return Hasil::ok(['sisaSebelum' => $sisa, 'sisaSesudah' => Angka::bulat2($sisa - $jumlahBaruKg)]);
    }

    /**
     * Rutin: tiap `frekuensiHari` sejak tanggal mulai; sekali panen: tanggal 15 bulan perkiraan panen.
     *
     * @return list<array{ke: int, tanggal: string}>
     */
    public static function jadwalKirimPesanan(string $jenis, ?string $tanggalMulai, ?int $frekuensiHari, int $jumlahKiriman, ?string $perkiraanBulanPanen): array
    {
        if ($jenis === 'sekali_panen') {
            return $perkiraanBulanPanen ? [['ke' => 1, 'tanggal' => "{$perkiraanBulanPanen}-15"]] : [];
        }
        if (! $tanggalMulai || ! $frekuensiHari || $frekuensiHari < 1) {
            return [];
        }
        $jadwal = [];
        for ($i = 0; $i < max(0, $jumlahKiriman); $i++) {
            $jadwal[] = ['ke' => $i + 1, 'tanggal' => Angka::tambahHari($tanggalMulai, $i * $frekuensiHari)];
        }

        return $jadwal;
    }

    /**
     * Kiriman yang terkejar bila mulai tanam hari ini (D-39).
     *
     * @param  list<array{ke: int, tanggal: string}>  $jadwal
     * @return list<array{ke: int, tanggal: string}>
     */
    public static function kirimanTerkejar(array $jadwal, string $hariIni, int|float $umurPanenHari): array
    {
        $paling = Angka::tambahHari($hariIni, (int) max(0, ceil($umurPanenHari)));

        return array_values(array_filter($jadwal, fn ($j) => $j['tanggal'] >= $paling));
    }

    /**
     * Tanam bertahap (D-40): satu petak per kiriman yang ditanggung, ditanam umur panen sebelumnya.
     *
     * @param  list<array{ke: int, tanggal: string}>  $kiriman
     * @return array{ok: true, nilai: array{petak: list<array{ke: int, tanggalTanam: string, tanggalPanen: string, bedengan: int}>, luasPerPetak: float, bersamaan: int, luasDibutuhkan: float}}|array{ok: false, galat: string}
     */
    public static function rencanaPetak(array $kiriman, int $frekuensiHari, int $umurPanenHari, int|float $jumlahKg, int|float $hasilPerSatuan): array
    {
        $luas = self::luasPerPanen($jumlahKg, $hasilPerSatuan);
        if (! $luas['ok']) {
            return $luas;
        }
        $maks = self::jumlahPetakBersamaan($frekuensiHari, $umurPanenHari);
        if (! $maks['ok']) {
            return $maks;
        }
        $bersamaan = max(1, min(count($kiriman), $maks['nilai']));
        $petak = [];
        foreach ($kiriman as $i => $k) {
            $petak[] = [
                'ke' => $k['ke'],
                'tanggalTanam' => Angka::tambahHari($k['tanggal'], -$umurPanenHari),
                'tanggalPanen' => $k['tanggal'],
                'bedengan' => $i % $bersamaan + 1,
            ];
        }

        return Hasil::ok([
            'petak' => $petak,
            'luasPerPetak' => $luas['nilai'],
            'bersamaan' => $bersamaan,
            'luasDibutuhkan' => Angka::bulat2($jumlahKg / $hasilPerSatuan * $bersamaan),
        ]);
    }
}
