/**
 * Kapasitas lahan (PRD P0-21; D-06, D-15, D-34). Satu lahan boleh punya beberapa siklus aktif.
 * - Lahan tanah (sawah, kebun, pekarangan): kapasitas = luas lahan − jumlah luas siklus aktif (m²).
 * - Lahan hidroponik: kapasitas = kapasitas lubang − jumlah lubang siklus aktif, bukan luas.
 * Yang memakai lahan: siklus aktif, dan siklus rencana yang sudah terhubung ke alokasi pesanan (supaya
 * lahan yang sama tidak dipakai untuk dua pesanan sebelum mulai menanam). Rencana tanpa pesanan
 * tidak dihitung. Sisa tidak pernah negatif.
 *
 * Pesanan rutin ditanam bertahap (D-40): tiap kiriman satu siklus (petak) dengan tanggal tanam
 * sendiri. Petak satu alokasi tidak dijumlah semuanya, tetapi dihitung dari puncak petak yang tumbuh
 * bersamaan (rentang tanam sampai panen, panen tidak termasuk), sesuai "Luas yang dibutuhkan untuk
 * pesanan rutin" di PRD: luas per panen × jumlah petak bersamaan.
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
> &
  Partial<Pick<SiklusTanam, 'petakKe' | 'tanggalTanam'>> & {
    /** Perkiraan tanggal panen; wajib untuk petak pesanan rutin supaya puncaknya bisa dihitung. */
    tanggalPanen?: string | null;
  };

/** Ukuran di satu titik waktu: rentang [mulai, akhir) dalam tanggal ISO. */
export interface RentangPetak {
  mulai: string;
  akhir: string;
  ukuran: number;
}

/**
 * Puncak ukuran petak yang tumbuh bersamaan. Cukup diperiksa di setiap tanggal mulai, karena jumlah
 * yang tumbuh hanya bertambah ketika sebuah petak mulai ditanam.
 */
export function puncakBersamaan(petak: RentangPetak[]): number {
  let puncak = 0;
  for (const t of petak) {
    const jumlah = petak
      .filter((x) => x.mulai <= t.mulai && t.mulai < x.akhir)
      .reduce((a, x) => a + x.ukuran, 0);
    puncak = Math.max(puncak, jumlah);
  }
  return bulat2(puncak);
}

/** Petak pesanan rutin: terhubung ke alokasi, punya urutan petak, tanggal tanam, dan tanggal panen. */
const petakBertahap = (s: SiklusKapasitas) =>
  s.alokasiPesananId !== null && s.petakKe != null && !!s.tanggalTanam && !!s.tanggalPanen;

/** Siklus ini memakai lahan: aktif, atau rencana yang terhubung ke alokasi pesanan (D-34). */
export const memakaiLahan = (s: Pick<SiklusTanam, 'status' | 'alokasiPesananId'>): boolean =>
  s.status === 'aktif' || (s.status === 'rencana' && s.alokasiPesananId !== null);

export const satuanKapasitas = (lahan: Pick<Lahan, 'jenisLahan'>): SatuanKapasitas =>
  lahan.jenisLahan === 'hidroponik' ? 'lubang' : 'm2';

/** Luas atau lubang yang dipakai siklus di lahan ini. */
export function dipakaiSiklus(lahan: LahanKapasitas, siklus: SiklusKapasitas[]): number {
  const lubang = satuanKapasitas(lahan) === 'lubang';
  const ukuran = (s: SiklusKapasitas) => Math.max(0, (lubang ? s.jumlahLubang : s.luasM2) ?? 0);
  const pakai = siklus.filter((s) => s.lahanId === lahan.id && memakaiLahan(s));
  const biasa = pakai.filter((s) => !petakBertahap(s)).reduce((a, s) => a + ukuran(s), 0);
  const kelompok = new Map<string, RentangPetak[]>();
  for (const s of pakai.filter(petakBertahap)) {
    const daftar = kelompok.get(s.alokasiPesananId as string) ?? [];
    daftar.push({
      mulai: s.tanggalTanam as string,
      akhir: s.tanggalPanen as string,
      ukuran: ukuran(s),
    });
    kelompok.set(s.alokasiPesananId as string, daftar);
  }
  const bertahap = [...kelompok.values()].reduce((a, p) => a + puncakBersamaan(p), 0);
  return bulat2(biasa + bertahap);
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

/**
 * Beberapa siklus baru sekaligus (petak pesanan rutin) muat di lahan: kapasitas dihitung ulang dengan
 * siklus baru ikut di dalamnya, sehingga petak yang tumbuh bergantian tidak dijumlah dua kali.
 */
export function muatSiklusBanyak(
  lahan: LahanKapasitas,
  siklusLain: SiklusKapasitas[],
  baru: SiklusKapasitas[],
): Hasil<KapasitasLahan> {
  if (!baru.length) return gagal('UKURAN_KOSONG');
  const k = kapasitasLahan(lahan, [...siklusLain, ...baru]);
  if (k.dipakai > k.total + 1e-9) return gagal('LAHAN_TIDAK_CUKUP');
  return berhasil(k);
}
