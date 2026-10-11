<?php

namespace App\Domain\Invarian;

use Illuminate\Support\Facades\DB;

/**
 * Invarian kolom turunan yang disimpan (tanggapan D-52): nilainya harus selalu sama dengan hasil
 * hitung ulang dari pembayaran dan alokasi. Aturan yang sama ada di klien tiruan
 * (frontend/src/api/tiruan/invarian.ts) dan diperiksa setelah setiap tes kontrak.
 *
 * - `pesanan.saldo_uang_muka` = uang muka yang ditahan − semua pencairan, pengembalian, dan
 *   kompensasi yang referensinya referensi uang muka itu (D-02).
 * - `pesanan.terambil_kg` = jumlah `jumlah_kg` alokasi aktif (bagian yang gagal atau dibatalkan
 *   ditawarkan ulang, D-03).
 * - `pengiriman.nilai_diterima` = jumlah pencairan untuk kiriman itu; null selama kiriman belum
 *   dikonfirmasi (terjadwal, dikirim) atau dilaporkan gagal.
 *
 * Layanan uang (gelombang 5.5) memanggil `periksa()` di tes setelah setiap operasi.
 */
final class InvarianPesanan
{
    private const UANG_MUKA_SAH = ['ditahan', 'cair', 'dikembalikan'];

    private const KELUAR_UANG_MUKA = ['pencairan', 'pengembalian', 'kompensasi'];

    private const ALOKASI_AKTIF = ['menunggu_kesepakatan', 'disepakati', 'berjalan', 'selesai'];

    private const BELUM_DIKONFIRMASI = ['terjadwal', 'dikirim', 'gagal'];

    /**
     * @param  list<string>|null  $pesananIds  batasi ke pesanan tertentu; null = semua
     * @return list<string> pelanggaran; kosong bila semua kolom turunan benar
     */
    public static function periksa(?array $pesananIds = null): array
    {
        $saring = fn ($q, string $kolom = 'pesanan_id') => $pesananIds === null ? $q : $q->whereIn($kolom, $pesananIds);
        $pesanan = $saring(DB::table('pesanan'), 'id')->get(['id', 'saldo_uang_muka', 'terambil_kg']);
        $bayar = $saring(DB::table('pembayaran'))->get(['pesanan_id', 'pengiriman_id', 'jenis', 'status', 'nominal', 'referensi']);
        $alokasi = $saring(DB::table('alokasi_pesanan'))->whereIn('status', self::ALOKASI_AKTIF)->get(['pesanan_id', 'jumlah_kg']);
        $kiriman = $saring(DB::table('pengiriman'))->get(['id', 'status', 'nilai_diterima']);

        $salah = [];
        foreach ($pesanan as $p) {
            $uangMuka = $bayar->where('pesanan_id', $p->id)->where('jenis', 'uang_muka')->whereIn('status', self::UANG_MUKA_SAH);
            $referensi = $uangMuka->pluck('referensi')->all();
            $keluar = $bayar->where('pesanan_id', $p->id)->whereIn('jenis', self::KELUAR_UANG_MUKA)
                ->whereIn('referensi', $referensi)->sum('nominal');
            $saldo = (int) $uangMuka->sum('nominal') - (int) $keluar;
            if ((int) $p->saldo_uang_muka !== $saldo) {
                $salah[] = "{$p->id}: saldo_uang_muka {$p->saldo_uang_muka}, seharusnya {$saldo}";
            }

            $terambil = round((float) $alokasi->where('pesanan_id', $p->id)->sum('jumlah_kg'), 2);
            if (round((float) $p->terambil_kg, 2) !== $terambil) {
                $salah[] = "{$p->id}: terambil_kg {$p->terambil_kg}, seharusnya {$terambil}";
            }
        }
        foreach ($kiriman as $x) {
            $cair = (int) $bayar->where('pengiriman_id', $x->id)->where('jenis', 'pencairan')->sum('nominal');
            $seharusnya = in_array($x->status, self::BELUM_DIKONFIRMASI, true) ? null : $cair;
            $nilai = $x->nilai_diterima === null ? null : (int) $x->nilai_diterima;
            if ($nilai !== $seharusnya) {
                $salah[] = "{$x->id}: nilai_diterima ".($nilai ?? 'null').', seharusnya '.($seharusnya ?? 'null');
            }
        }

        return $salah;
    }
}
