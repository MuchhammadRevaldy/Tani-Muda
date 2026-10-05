/**
 * Basis data klien tiruan: data contoh dengan tanggal yang sudah diselesaikan, ditambah keadaan
 * tiruan (sesi, langganan push, kunci idempoten, keadaan penyedia pembayaran).
 */
import { tanggalLokal, ZONA_BAWAAN } from '../../lib/zona-waktu';
import {
  keadaanPembayaranKosong,
  type KeadaanPembayaranTiruan,
} from '../../penyedia/pembayaran/pembayaran-tiruan';
import type { LanggananPush, Pembayaran } from '../tipe';
import type { DataContoh } from './data/jenis-data';
import { muatDataContoh } from './data/muat-data';
import { selesaikanTanggalRelatif } from './tanggal-relatif';

export interface BasisData extends DataContoh {
  sesi: { pengguna_id: string | null };
  langganan: (LanggananPush & { pengguna_id: string })[];
  /** Hasil permintaan berkunci idempoten: kunci → hasil. */
  idempoten: Record<string, unknown>;
  pembayaran_tiruan: KeadaanPembayaranTiruan;
  /** Penghitung ID baru. */
  urut: number;
}

/**
 * Keadaan penyedia pembayaran diturunkan dari baris pembayaran: uang muka, kiriman, dan biaya layanan
 * menahan dana; pencairan dan kompensasi mencairkan; pengembalian mengembalikan.
 */
export function turunkanKeadaanPembayaran(pembayaran: Pembayaran[]): KeadaanPembayaranTiruan {
  const keadaan = keadaanPembayaranKosong();
  let maks = 0;
  for (const b of pembayaran) {
    const d = (keadaan.dana[b.referensi] ??= {
      ditahan: 0,
      dicairkan: 0,
      dikembalikan: 0,
      keterangan: b.jenis,
    });
    if (b.jenis === 'uang_muka' || b.jenis === 'kiriman' || b.jenis === 'biaya_layanan')
      d.ditahan += b.nominal;
    if (b.jenis === 'pencairan' || b.jenis === 'kompensasi' || b.jenis === 'biaya_layanan')
      d.dicairkan += b.nominal;
    if (b.jenis === 'pengembalian') d.dikembalikan += b.nominal;
    const n = Number(b.referensi.replace(/\D/g, ''));
    if (n > maks) maks = n;
  }
  keadaan.nomorBerikutnya = maks + 1;
  return keadaan;
}

/** Basis data baru dari data contoh, dengan tanggal relatif terhadap "hari ini" zona bawaan. */
export function buatBasisData(sekarangMs: number, data: DataContoh = muatDataContoh()): BasisData {
  const nyata = selesaikanTanggalRelatif(data, tanggalLokal(sekarangMs, ZONA_BAWAAN), ZONA_BAWAAN);
  return {
    ...nyata,
    sesi: { pengguna_id: null },
    langganan: [],
    idempoten: {},
    pembayaran_tiruan: turunkanKeadaanPembayaran(nyata.pesanan.pembayaran),
    urut: 0,
  };
}
