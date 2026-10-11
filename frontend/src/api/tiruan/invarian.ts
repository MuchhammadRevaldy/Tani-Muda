/**
 * Invarian kolom turunan yang disimpan (D-52, tanggapan D-52): nilainya harus selalu sama dengan
 * hasil hitung ulang dari pembayaran dan alokasi. Backend menegakkan aturan yang sama
 * (backend/app/Domain/Invarian/InvarianPesanan.php).
 *
 * - `pesanan.saldo_uang_muka` = uang muka yang ditahan − semua pencairan, pengembalian, dan
 *   kompensasi yang referensinya referensi uang muka itu (D-02).
 * - `pesanan.terambil_kg` = jumlah `jumlah_kg` alokasi aktif (dasar `sisa_kg`; bagian yang gagal
 *   atau dibatalkan ditawarkan ulang, D-03).
 * - `pengiriman.nilai_diterima` = jumlah pencairan untuk kiriman itu; null selama kiriman belum
 *   dikonfirmasi (terjadwal, dikirim) atau dilaporkan gagal.
 */
import type { DataPesanan } from './data/jenis-data';
import { alokasiAktif } from './fitur/bantu';

const KELUAR_UANG_MUKA = new Set(['pencairan', 'pengembalian', 'kompensasi']);
const UANG_MUKA_SAH = new Set(['ditahan', 'cair', 'dikembalikan']);
const BELUM_DIKONFIRMASI = new Set(['terjadwal', 'dikirim', 'gagal']);

const bulat2 = (n: number) => Math.round(n * 100) / 100;

/** Daftar pelanggaran; kosong bila semua kolom turunan sama dengan hasil hitung ulang. */
export function periksaInvarianPesanan(d: DataPesanan): string[] {
  const salah: string[] = [];
  for (const p of d.pesanan) {
    const uangMuka = d.pembayaran.filter(
      (b) => b.pesanan_id === p.id && b.jenis === 'uang_muka' && UANG_MUKA_SAH.has(b.status),
    );
    const referensi = new Set(uangMuka.map((b) => b.referensi));
    const keluar = d.pembayaran
      .filter(
        (b) => b.pesanan_id === p.id && KELUAR_UANG_MUKA.has(b.jenis) && referensi.has(b.referensi),
      )
      .reduce((s, b) => s + b.nominal, 0);
    const saldo = uangMuka.reduce((s, b) => s + b.nominal, 0) - keluar;
    if (p.saldo_uang_muka !== saldo)
      salah.push(`${p.id}: saldo_uang_muka ${p.saldo_uang_muka}, seharusnya ${saldo}`);

    const terambil = bulat2(
      d.alokasi
        .filter((a) => a.pesanan_id === p.id && alokasiAktif(a))
        .reduce((s, a) => s + a.jumlah_kg, 0),
    );
    if (bulat2(p.terambil_kg) !== terambil)
      salah.push(`${p.id}: terambil_kg ${p.terambil_kg}, seharusnya ${terambil}`);
  }
  for (const x of d.pengiriman) {
    const cair = d.pembayaran
      .filter((b) => b.pengiriman_id === x.id && b.jenis === 'pencairan')
      .reduce((s, b) => s + b.nominal, 0);
    const seharusnya = BELUM_DIKONFIRMASI.has(x.status) ? null : cair;
    if (x.nilai_diterima !== seharusnya)
      salah.push(`${x.id}: nilai_diterima ${x.nilai_diterima}, seharusnya ${seharusnya}`);
  }
  return salah;
}
