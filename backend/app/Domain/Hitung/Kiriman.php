<?php

namespace App\Domain\Hitung;

use App\Enums\AlasanPenolakan;

/**
 * Konfirmasi kiriman, batas periksa, gagal panen, dan pembatalan (frontend/src/lib/kiriman.ts;
 * P0-25, P0-26, P0-27, D-01, D-02, D-03, D-14).
 */
final class Kiriman
{
    private const EPS = 1e-9;

    /** @return array{ok: true, nilai: string}|array{ok: false, galat: string} */
    public static function validasiAlasan(mixed $alasan, mixed $keterangan = null): array
    {
        if (! is_string($alasan) || AlasanPenolakan::tryFrom($alasan) === null) {
            return Hasil::gagal('ALASAN_TIDAK_DIKENAL');
        }
        if ($alasan === 'lainnya' && trim((string) $keterangan) === '') {
            return Hasil::gagal('KETERANGAN_WAJIB');
        }

        return Hasil::ok($alasan);
    }

    /**
     * @param  array{jumlahDikirimKg: int|float, hargaPerKg: int|float, saldoUangMuka: int|float, kirimanTerakhir: bool}  $kiriman
     * @param  array<string, mixed>  $keputusan  `{ jenis: 'terima_semua' }` atau `{ jenis: 'tolak_sebagian', jumlahDitolakKg, alasan, keterangan? }`
     * @return array{ok: true, nilai: array<string, mixed>}|array{ok: false, galat: string}
     */
    public static function konfirmasiKiriman(array $kiriman, array $keputusan, int|float $persenUangMuka): array
    {
        if (! ($kiriman['jumlahDikirimKg'] > 0)) {
            return Hasil::gagal('JUMLAH_KOSONG');
        }
        if (! ($kiriman['hargaPerKg'] > 0)) {
            return Hasil::gagal('HARGA_KOSONG');
        }
        $ditolak = 0;
        if ($keputusan['jenis'] === 'tolak_sebagian') {
            $alasan = self::validasiAlasan($keputusan['alasan'] ?? null, $keputusan['keterangan'] ?? null);
            if (! $alasan['ok']) {
                return $alasan;
            }
            $jumlah = $keputusan['jumlahDitolakKg'] ?? null;
            if (! is_numeric($jumlah) || ! ($jumlah > 0)) {
                return Hasil::gagal('TOLAK_KOSONG');
            }
            if ($jumlah > $kiriman['jumlahDikirimKg'] + self::EPS) {
                return Hasil::gagal('MELEBIHI_KIRIMAN');
            }
            $ditolak = $jumlah;
        }
        $diterima = Angka::bulat($kiriman['jumlahDikirimKg'] - $ditolak, 3);
        $bayar = Uang::hitungPembayaranKiriman([
            'nilaiKiriman' => Angka::rupiah($kiriman['jumlahDikirimKg'] * $kiriman['hargaPerKg']),
            'nilaiDiterima' => Angka::rupiah($diterima * $kiriman['hargaPerKg']),
            'saldoUangMuka' => $kiriman['saldoUangMuka'],
            'persenUangMuka' => $persenUangMuka,
            'kirimanTerakhir' => $kiriman['kirimanTerakhir'],
        ]);
        if (! $bayar['ok']) {
            return $bayar;
        }
        $b = $bayar['nilai'];

        return Hasil::ok([
            'status' => $ditolak > 0 ? 'ditolak_sebagian' : 'diterima',
            'jumlahDiterimaKg' => $diterima,
            'jumlahDitolakKg' => $ditolak,
            'danaCairPetani' => $b['nilaiDiterima'],
            'dibayarPembeli' => $b['dibayarPembeli'],
            'dariUangMuka' => $b['dariUangMuka'],
            'sisaSaldoUangMuka' => $b['sisaSaldoUangMuka'],
            'perluSengketa' => $ditolak > 0,
        ]);
    }

    /**
     * Batas periksa (D-01): rutin 6 jam, sekali panen 24 jam (dari konfigurasi); tepat di batas
     * sudah dianggap diterima. Waktu dalam milidetik epoch.
     *
     * @param  array{rutin: int|float, sekali_panen: int|float}  $jamPeriksa
     * @return array{dianggapDiterima: bool, batasMs: int|float, sisaMs: int|float}
     */
    public static function statusOtomatis(string $jenisPesanan, int|float $dikirimPadaMs, int|float $sekarangMs, array $jamPeriksa): array
    {
        $batasMs = $dikirimPadaMs + $jamPeriksa[$jenisPesanan] * 3_600_000;

        return ['dianggapDiterima' => $sekarangMs >= $batasMs, 'batasMs' => $batasMs, 'sisaMs' => max(0, $batasMs - $sekarangMs)];
    }

    /**
     * Gagal panen (D-03): tanpa denda; kabar tepat waktu bila paling lambat `batasHari` sebelum
     * jadwal kirim; tanpa pengganti, sisa uang muka bagian itu dikembalikan.
     *
     * @return array{tepatWaktu: bool, tawarkanUlang: true, dikembalikan: int|float, catatanProfil: bool}
     */
    public static function aturanGagalPanen(string $jadwalKirim, ?string $tanggalKabar, int $batasHari, bool $adaPengganti, int|float $sisaUangMukaBagian): array
    {
        $tepat = $tanggalKabar !== null && Angka::selisihHari($tanggalKabar, $jadwalKirim) >= $batasHari;

        return [
            'tepatWaktu' => $tepat,
            'tawarkanUlang' => true,
            'dikembalikan' => $adaPengganti ? 0 : max(0, $sisaUangMukaBagian),
            'catatanProfil' => ! $tepat,
        ];
    }

    /**
     * Pembatalan oleh pembeli (P0-27): setelah petani mulai menanam, uang muka menjadi kompensasi.
     *
     * @return array{kompensasiPetani: int|float, dikembalikanKePembeli: int|float}
     */
    public static function pembatalanPembeli(bool $petaniSudahMenanam, int|float $saldoUangMuka): array
    {
        $saldo = max(0, $saldoUangMuka);

        return $petaniSudahMenanam
            ? ['kompensasiPetani' => $saldo, 'dikembalikanKePembeli' => 0]
            : ['kompensasiPetani' => 0, 'dikembalikanKePembeli' => $saldo];
    }
}
