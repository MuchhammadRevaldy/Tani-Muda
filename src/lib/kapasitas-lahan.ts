/**
 * Kapasitas lahan (PRD P0-21; D-06, D-15, D-34). Satu lahan boleh punya beberapa siklus aktif.
 * - Lahan tanah (sawah, kebun, pekarangan): kapasitas = luas lahan − jumlah luas siklus aktif (m²).
 * - Lahan hidroponik: kapasitas = kapasitas lubang − jumlah lubang siklus aktif, bukan luas.
 * Yang memakai lahan: siklus aktif, dan siklus rencana yang sudah terhubung ke alokasi pesanan (supaya
 * lahan yang sama tidak dipakai untuk dua pesanan sebelum mulai menanam). Rencana tanpa pesanan
 * tidak dihitung. Sisa tidak pernah negatif.
 */
import type { Lahan, SiklusTanam } from '../tipe';
import { berhasil, gagal, type Hasil } from './hasil';

export type SatuanKapasitas = 'm2' | 'lubang';

export interface KapasitasLahan {
  satuan: SatuanKapasitas;
  total: number;
  dipakai: number;
  sisa: number;
}

const bulat2 = (n: number) => Math.round(n * 100) / 100;

type LahanKapasitas = Pick<Lahan, 'id' | 'jenisLahan' | 'luasM2' | 'kapasitasLubang'>;
type SiklusKapasitas = Pick<
  SiklusTanam,
  'lahanId' | 'status' | 'luasM2' | 'jumlahLubang' | 'alokasiPesananId'
>;

/** Siklus ini memakai lahan: aktif, atau rencana yang terhubung ke alokasi pesanan (D-34). */
export const memakaiLahan = (s: Pick<SiklusTanam, 'status' | 'alokasiPesananId'>): boolean =>
  s.status === 'aktif' || (s.status === 'rencana' && s.alokasiPesananId !== null);

export const satuanKapasitas = (lahan: Pick<Lahan, 'jenisLahan'>): SatuanKapasitas =>
  lahan.jenisLahan === 'hidroponik' ? 'lubang' : 'm2';

/** Luas atau lubang yang dipakai siklus di lahan ini. */
export function dipakaiSiklus(lahan: LahanKapasitas, siklus: SiklusKapasitas[]): number {
  const lubang = satuanKapasitas(lahan) === 'lubang';
  return bulat2(
    siklus
      .filter((s) => s.lahanId === lahan.id && memakaiLahan(s))
      .reduce((jml, s) => jml + Math.max(0, (lubang ? s.jumlahLubang : s.luasM2) ?? 0), 0),
  );
}

export function kapasitasLahan(lahan: LahanKapasitas, siklus: SiklusKapasitas[]): KapasitasLahan {
  const satuan = satuanKapasitas(lahan);
  const total = Math.max(0, (satuan === 'lubang' ? lahan.kapasitasLubang : lahan.luasM2) ?? 0);
  const dipakai = dipakaiSiklus(lahan, siklus);
  return { satuan, total, dipakai, sisa: bulat2(Math.max(0, total - dipakai)) };
}

/** Siklus baru hanya boleh dibuat bila muat di sisa kapasitas (D-15). */
export function muatSiklusBaru(
  lahan: LahanKapasitas,
  siklus: SiklusKapasitas[],
  ukuranBaru: number,
): Hasil<KapasitasLahan> {
  if (!(ukuranBaru > 0)) return gagal('UKURAN_KOSONG');
  const k = kapasitasLahan(lahan, siklus);
  if (ukuranBaru > k.sisa + 1e-9) return gagal('LAHAN_TIDAK_CUKUP');
  return berhasil({
    ...k,
    dipakai: bulat2(k.dipakai + ukuranBaru),
    sisa: bulat2(k.sisa - ukuranBaru),
  });
}
