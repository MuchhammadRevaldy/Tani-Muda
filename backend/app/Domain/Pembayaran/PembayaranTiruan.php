<?php

namespace App\Domain\Pembayaran;

use App\Http\Galat\GalatApi;
use Illuminate\Support\Facades\DB;

/**
 * Pembayaran TIRUAN (D-10, frontend/src/penyedia/pembayaran/pembayaran-tiruan.ts): menahan,
 * mencairkan, dan mengembalikan dana seketika, dengan referensi `TIRUAN-000001`.
 *
 * Saldo per referensi diturunkan dari tabel `pembayaran`, sama dengan `turunkanKeadaanPembayaran`
 * klien tiruan (uang muka, kiriman, dan biaya layanan menahan; pencairan, kompensasi, dan biaya
 * layanan mencairkan; pengembalian mengembalikan), ditambah dana yang ditahan atau dikurangi di
 * permintaan ini sebelum barisnya dicatat.
 */
final class PembayaranTiruan implements PenyediaPembayaran
{
    /** @var array<string, array{ditahan: int, dicairkan: int, dikembalikan: int}> perubahan di permintaan ini */
    private array $baru = [];

    /** @var array<string, string> kunci → referensi */
    private array $kunci = [];

    public function modeUjiCoba(): bool
    {
        return true;
    }

    public function tahan(int $nominal, string $keterangan, string $kunci): string
    {
        if ($nominal < 0) {
            throw new GalatApi('JUMLAH_NEGATIF');
        }
        if (isset($this->kunci[$kunci])) {
            return $this->kunci[$kunci];
        }
        $referensi = sprintf('TIRUAN-%06d', $this->nomorBerikutnya());
        $this->baru[$referensi] = ['ditahan' => $nominal, 'dicairkan' => 0, 'dikembalikan' => 0];

        return $this->kunci[$kunci] = $referensi;
    }

    public function cairkan(string $referensi, int $nominal): void
    {
        $this->kurangi($referensi, $nominal, 'dicairkan');
    }

    public function kembalikan(string $referensi, int $nominal): void
    {
        $this->kurangi($referensi, $nominal, 'dikembalikan');
    }

    /**
     * Baris pembayaran yang baru dicatat sudah mewakili perubahan di permintaan ini; dipanggil
     * LayananJual setelah mencatat, supaya tidak dihitung dua kali.
     */
    public function sudahDicatat(string $referensi): void
    {
        unset($this->baru[$referensi]);
    }

    private function kurangi(string $referensi, int $nominal, string $jenis): void
    {
        $dana = $this->dana($referensi);
        if ($dana === null) {
            throw new GalatApi('GALAT_SERVER');
        }
        if ($nominal < 0) {
            throw new GalatApi('JUMLAH_NEGATIF');
        }
        if ($nominal > $dana['ditahan'] - $dana['dicairkan'] - $dana['dikembalikan']) {
            throw new GalatApi('MELEBIHI_SALDO');
        }
        $this->baru[$referensi] ??= ['ditahan' => 0, 'dicairkan' => 0, 'dikembalikan' => 0];
        $this->baru[$referensi][$jenis] += $nominal;
    }

    /** @return array{ditahan: int, dicairkan: int, dikembalikan: int}|null */
    private function dana(string $referensi): ?array
    {
        $baris = DB::table('pembayaran')->where('referensi', $referensi)->lockForUpdate()->get(['jenis', 'nominal']);
        $tambahan = $this->baru[$referensi] ?? null;
        if ($baris->isEmpty() && $tambahan === null) {
            return null;
        }
        $d = ['ditahan' => 0, 'dicairkan' => 0, 'dikembalikan' => 0];
        foreach ($baris as $b) {
            if (in_array($b->jenis, ['uang_muka', 'kiriman', 'biaya_layanan'], true)) {
                $d['ditahan'] += (int) $b->nominal;
            }
            if (in_array($b->jenis, ['pencairan', 'kompensasi', 'biaya_layanan'], true)) {
                $d['dicairkan'] += (int) $b->nominal;
            }
            if ($b->jenis === 'pengembalian') {
                $d['dikembalikan'] += (int) $b->nominal;
            }
        }
        foreach ((array) $tambahan as $k => $v) {
            $d[$k] += $v;
        }

        return $d;
    }

    private function nomorBerikutnya(): int
    {
        $maks = 0;
        foreach (DB::table('pembayaran')->where('referensi', 'like', 'TIRUAN-%')->pluck('referensi') as $r) {
            $maks = max($maks, (int) preg_replace('/\D/', '', (string) $r));
        }
        foreach (array_keys($this->baru) as $r) {
            $maks = max($maks, (int) preg_replace('/\D/', '', $r));
        }

        return $maks + 1;
    }
}
