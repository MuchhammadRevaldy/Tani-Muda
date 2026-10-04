/**
 * Kapasitas lahan (PRD P0-21; D-06, D-15). Satu lahan boleh punya beberapa siklus aktif.
 * - Lahan tanah (sawah, kebun, pekarangan): kapasitas = luas lahan − jumlah luas siklus aktif (m²).
 * - Lahan hidroponik: kapasitas = kapasitas lubang − jumlah lubang siklus aktif, bukan luas.
 * Hanya siklus berstatus aktif yang dihitung. Sisa tidak pernah negatif.
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
type SiklusKapasitas = Pick<SiklusTanam, 'lahanId' | 'status' | 'luasM2' | 'jumlahLubang'>;

export const satuanKapasitas = (lahan: Pick<Lahan, 'jenisLahan'>): SatuanKapasitas =>
  lahan.jenisLahan === 'hidroponik' ? 'lubang' : 'm2';

/** Luas atau lubang yang dipakai siklus aktif di lahan ini. */
export function dipakaiSiklusAktif(lahan: LahanKapasitas, siklus: SiklusKapasitas[]): number {
  const lubang = satuanKapasitas(lahan) === 'lubang';
  return bulat2(
    siklus
      .filter((s) => s.lahanId === lahan.id && s.status === 'aktif')
      .reduce((jml, s) => jml + Math.max(0, (lubang ? s.jumlahLubang : s.luasM2) ?? 0), 0),
  );
}

export function kapasitasLahan(lahan: LahanKapasitas, siklus: SiklusKapasitas[]): KapasitasLahan {
  const satuan = satuanKapasitas(lahan);
  const total = Math.max(0, (satuan === 'lubang' ? lahan.kapasitasLubang : lahan.luasM2) ?? 0);
  const dipakai = dipakaiSiklusAktif(lahan, siklus);
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
