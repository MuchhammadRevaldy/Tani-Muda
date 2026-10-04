/**
 * Nilai pesanan dan pembayaran (PRD P0-19, P0-23, P0-26; D-02):
 * - nilai pesanan = jumlah total × harga per kg; uang muka = persen uang muka × nilai;
 *   biaya layanan = persen layanan × nilai, dibayar pembeli (tidak memotong bagian petani);
 * - tiap kiriman: bagian sebesar persen uang muka diambil dari saldo uang muka, sisanya dibayar
 *   pembeli (20% dan 80% pada konfigurasi contoh). Persen datang dari konfigurasi.
 */
import type { JenisPesanan, KonfigurasiBisnis } from '../tipe';
import { bulatkanRupiah } from './format';
import { berhasil, gagal, type Hasil } from './hasil';

export type MasukanPesanan =
  | {
      jenis: Extract<JenisPesanan, 'rutin'>;
      jumlahPerKirimanKg: number;
      jumlahKiriman: number;
      hargaPerKg: number;
    }
  | { jenis: Extract<JenisPesanan, 'sekali_panen'>; jumlahTotalKg: number; hargaPerKg: number };

export interface NilaiPesanan {
  jumlahTotalKg: number;
  jumlahKiriman: number;
  nilaiPesanan: number;
  uangMuka: number;
  biayaLayanan: number;
  /** Dibayar pembeli saat memasang pesanan: uang muka + biaya layanan. */
  dibayarSekarang: number;
  /** Nilai satu kiriman penuh. */
  nilaiPerKiriman: number;
}

type PersenPesanan = Pick<KonfigurasiBisnis, 'persenUangMuka' | 'persenLayanan'>;

const persen = (nilai: number, p: number) => bulatkanRupiah((nilai * p) / 100);

/**
 * Jumlah kiriman pesanan rutin dari frekuensi dan durasi (hari): kiriman mingguan selama 84 hari
 * = 12 kiriman. Durasi melebihi batas (P0-19: maksimal tiga bulan) ditolak.
 */
export function jumlahKirimanRutin(
  frekuensiHari: number,
  durasiHari: number,
  maksDurasiHari: number,
): Hasil<number> {
  if (!Number.isInteger(frekuensiHari) || frekuensiHari < 1) return gagal('FREKUENSI_TIDAK_VALID');
  if (!(durasiHari > 0) || durasiHari > maksDurasiHari) return gagal('FREKUENSI_TIDAK_VALID');
  const n = Math.floor(durasiHari / frekuensiHari);
  return n >= 1 ? berhasil(n) : gagal('FREKUENSI_TIDAK_VALID');
}

export function hitungNilaiPesanan(
  m: MasukanPesanan,
  konfigurasi: PersenPesanan,
): Hasil<NilaiPesanan> {
  if (!(m.hargaPerKg > 0)) return gagal('HARGA_KOSONG');
  let jumlahTotalKg: number;
  let jumlahKiriman: number;
  if (m.jenis === 'rutin') {
    if (!(m.jumlahPerKirimanKg > 0)) return gagal('JUMLAH_KOSONG');
    if (!Number.isInteger(m.jumlahKiriman) || m.jumlahKiriman < 1)
      return gagal('FREKUENSI_TIDAK_VALID');
    jumlahKiriman = m.jumlahKiriman;
    jumlahTotalKg = m.jumlahPerKirimanKg * m.jumlahKiriman;
  } else {
    if (!(m.jumlahTotalKg > 0)) return gagal('JUMLAH_KOSONG');
    jumlahKiriman = 1;
    jumlahTotalKg = m.jumlahTotalKg;
  }
  const nilaiPesanan = bulatkanRupiah(jumlahTotalKg * m.hargaPerKg);
  const uangMuka = persen(nilaiPesanan, konfigurasi.persenUangMuka);
  const biayaLayanan = persen(nilaiPesanan, konfigurasi.persenLayanan);
  return berhasil({
    jumlahTotalKg,
    jumlahKiriman,
    nilaiPesanan,
    uangMuka,
    biayaLayanan,
    dibayarSekarang: uangMuka + biayaLayanan,
    nilaiPerKiriman: bulatkanRupiah(
      (m.jenis === 'rutin' ? m.jumlahPerKirimanKg : m.jumlahTotalKg) * m.hargaPerKg,
    ),
  });
}

export interface PembayaranKiriman {
  /** Nilai bagian yang diterima pembeli = dana cair untuk petani (P0-26). */
  nilaiDiterima: number;
  /** Diambil dari saldo uang muka. */
  dariUangMuka: number;
  /** Dibayar pembeli untuk kiriman ini. */
  dibayarPembeli: number;
  sisaSaldoUangMuka: number;
}

/**
 * Pembayaran satu kiriman (D-02). `nilaiDiterima` sudah dikurangi bagian yang ditolak.
 * Kiriman terakhir yang diterima penuh memakai seluruh sisa saldo, supaya selisih pembulatan tidak
 * tertinggal; bila ada penolakan, sisa saldo bagian yang ditolak dibiarkan untuk sengketa atau
 * pengembalian. Saldo tidak pernah negatif.
 */
export function hitungPembayaranKiriman(masukan: {
  nilaiKiriman: number;
  nilaiDiterima: number;
  saldoUangMuka: number;
  persenUangMuka: number;
  kirimanTerakhir: boolean;
}): Hasil<PembayaranKiriman> {
  const { nilaiKiriman, nilaiDiterima, saldoUangMuka } = masukan;
  if (nilaiKiriman < 0 || nilaiDiterima < 0 || saldoUangMuka < 0) return gagal('JUMLAH_NEGATIF');
  if (nilaiDiterima > nilaiKiriman) return gagal('MELEBIHI_KIRIMAN');
  const diterimaPenuh = nilaiDiterima === nilaiKiriman;
  const bagian =
    masukan.kirimanTerakhir && diterimaPenuh
      ? nilaiDiterima
      : persen(nilaiDiterima, masukan.persenUangMuka);
  const dariUangMuka = Math.min(saldoUangMuka, bagian);
  return berhasil({
    nilaiDiterima,
    dariUangMuka,
    dibayarPembeli: nilaiDiterima - dariUangMuka,
    sisaSaldoUangMuka: saldoUangMuka - dariUangMuka,
  });
}
