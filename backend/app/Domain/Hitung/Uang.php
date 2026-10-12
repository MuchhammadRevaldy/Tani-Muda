<?php

namespace App\Domain\Hitung;

/**
 * Nilai pesanan dan pembayaran (frontend/src/lib/pesanan-nilai.ts dan bulatkanKeRatusan di
 * harga-item.ts; P0-19, P0-23, P0-26, D-02). Persen datang dari konfigurasi.
 */
final class Uang
{
    public static function bulatkanRupiah(float|int $n): int
    {
        return Angka::rupiah($n);
    }

    public static function bulatkanKeRatusan(float|int $n): int
    {
        if (! ($n > 0)) {
            return 0;
        }
        if ($n < 100) {
            return (int) max(10, Angka::bulat($n / 10) * 10);
        }

        return (int) (Angka::bulat($n / 100) * 100);
    }

    /**
     * Rata-rata harga per satuan dari laporan di kecamatan yang sama dalam `rentangHari` terakhir,
     * dibulatkan ke ratusan (harga-item.ts `rataRataSekitar`, D-38). Null bila laporan kurang.
     *
     * @param  list<array{merek_id: string, harga_kemasan: int|float, kecamatan: string, tanggal: string}>  $laporan
     * @param  array<string, int|float>  $isiKemasan  merek_id → isi kemasan
     */
    public static function rataRataSekitar(array $laporan, array $isiKemasan, string $kecamatan, string $hariIni, int $rentangHari, int $minimalLaporan): ?int
    {
        $harga = [];
        foreach ($laporan as $l) {
            $umur = Angka::selisihHari($l['tanggal'], $hariIni);
            $isi = $isiKemasan[$l['merek_id']] ?? 0;
            if ($l['kecamatan'] === $kecamatan && $umur >= 0 && $umur <= $rentangHari && $isi > 0) {
                $harga[] = $l['harga_kemasan'] / $isi;
            }
        }
        if ($harga === [] || count($harga) < $minimalLaporan) {
            return null;
        }

        return self::bulatkanKeRatusan(array_sum($harga) / count($harga));
    }

    private static function persen(float|int $nilai, float|int $p): int
    {
        return Angka::rupiah($nilai * $p / 100);
    }

    /** @return array{ok: true, nilai: int}|array{ok: false, galat: string} */
    public static function jumlahKirimanRutin(mixed $frekuensiHari, mixed $durasiHari, int $maksDurasiHari): array
    {
        if (! is_int($frekuensiHari) || $frekuensiHari < 1) {
            return Hasil::gagal('FREKUENSI_TIDAK_VALID');
        }
        if (! (is_int($durasiHari) || is_float($durasiHari)) || ! ($durasiHari > 0) || $durasiHari > $maksDurasiHari) {
            return Hasil::gagal('FREKUENSI_TIDAK_VALID');
        }
        $n = (int) floor($durasiHari / $frekuensiHari);

        return $n >= 1 ? Hasil::ok($n) : Hasil::gagal('FREKUENSI_TIDAK_VALID');
    }

    /**
     * @param  array<string, mixed>  $m  `{ jenis: 'rutin', jumlahPerKirimanKg, jumlahKiriman, hargaPerKg }` atau `{ jenis: 'sekali_panen', jumlahTotalKg, hargaPerKg }`
     * @param  array{persenUangMuka: int|float, persenLayanan: int|float}  $konfigurasi
     * @return array{ok: true, nilai: array<string, int|float>}|array{ok: false, galat: string}
     */
    public static function hitungNilaiPesanan(array $m, array $konfigurasi): array
    {
        $harga = $m['hargaPerKg'] ?? null;
        if (! is_numeric($harga) || ! ($harga > 0)) {
            return Hasil::gagal('HARGA_KOSONG');
        }
        if ($m['jenis'] === 'rutin') {
            $perKiriman = $m['jumlahPerKirimanKg'] ?? null;
            if (! is_numeric($perKiriman) || ! ($perKiriman > 0)) {
                return Hasil::gagal('JUMLAH_KOSONG');
            }
            if (! is_int($m['jumlahKiriman'] ?? null) || $m['jumlahKiriman'] < 1) {
                return Hasil::gagal('FREKUENSI_TIDAK_VALID');
            }
            $jumlahKiriman = $m['jumlahKiriman'];
            $jumlahTotalKg = $perKiriman * $jumlahKiriman;
            $satuKiriman = $perKiriman;
        } else {
            $total = $m['jumlahTotalKg'] ?? null;
            if (! is_numeric($total) || ! ($total > 0)) {
                return Hasil::gagal('JUMLAH_KOSONG');
            }
            $jumlahKiriman = 1;
            $jumlahTotalKg = $total;
            $satuKiriman = $total;
        }
        $nilaiPesanan = Angka::rupiah($jumlahTotalKg * $harga);
        $uangMuka = self::persen($nilaiPesanan, $konfigurasi['persenUangMuka']);
        $biayaLayanan = self::persen($nilaiPesanan, $konfigurasi['persenLayanan']);

        return Hasil::ok([
            'jumlahTotalKg' => $jumlahTotalKg,
            'jumlahKiriman' => $jumlahKiriman,
            'nilaiPesanan' => $nilaiPesanan,
            'uangMuka' => $uangMuka,
            'biayaLayanan' => $biayaLayanan,
            'dibayarSekarang' => $uangMuka + $biayaLayanan,
            'nilaiPerKiriman' => Angka::rupiah($satuKiriman * $harga),
        ]);
    }

    /**
     * Pembayaran satu kiriman (D-02). Kiriman terakhir yang diterima penuh memakai seluruh sisa saldo.
     *
     * @param  array{nilaiKiriman: int|float, nilaiDiterima: int|float, saldoUangMuka: int|float, persenUangMuka: int|float, kirimanTerakhir: bool}  $m
     * @return array{ok: true, nilai: array{nilaiDiterima: int|float, dariUangMuka: int|float, dibayarPembeli: int|float, sisaSaldoUangMuka: int|float}}|array{ok: false, galat: string}
     */
    public static function hitungPembayaranKiriman(array $m): array
    {
        ['nilaiKiriman' => $nilaiKiriman, 'nilaiDiterima' => $nilaiDiterima, 'saldoUangMuka' => $saldo] = $m;
        if ($nilaiKiriman < 0 || $nilaiDiterima < 0 || $saldo < 0) {
            return Hasil::gagal('JUMLAH_NEGATIF');
        }
        if ($nilaiDiterima > $nilaiKiriman) {
            return Hasil::gagal('MELEBIHI_KIRIMAN');
        }
        $penuh = $nilaiDiterima == $nilaiKiriman;
        $bagian = $m['kirimanTerakhir'] && $penuh ? $nilaiDiterima : self::persen($nilaiDiterima, $m['persenUangMuka']);
        $dariUangMuka = min($saldo, $bagian);

        return Hasil::ok([
            'nilaiDiterima' => $nilaiDiterima,
            'dariUangMuka' => $dariUangMuka,
            'dibayarPembeli' => $nilaiDiterima - $dariUangMuka,
            'sisaSaldoUangMuka' => $saldo - $dariUangMuka,
        ]);
    }
}
