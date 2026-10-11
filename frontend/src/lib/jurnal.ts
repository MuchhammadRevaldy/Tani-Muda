/**
 * Jurnal siklus dikelompokkan per minggu (T4.16, papan 28): minggu ke-1 = hari ke-0 sampai 6,
 * minggu ke-2 = hari ke-7 sampai 13, dst. Minggu terbaru di atas; di dalamnya hari terbaru dulu.
 */
export interface EntriMinggu {
  hariKe: number;
  foto: string | null;
  catatan: string | null;
}

export interface MingguJurnal<T extends EntriMinggu> {
  minggu: number;
  hariAwal: number;
  hariAkhir: number;
  entri: T[];
  jumlahFoto: number;
  jumlahCatatan: number;
}

export const mingguKe = (hariKe: number): number => Math.floor(Math.max(0, hariKe) / 7) + 1;

export function kelompokkanMinggu<T extends EntriMinggu>(entri: T[]): MingguJurnal<T>[] {
  const peta = new Map<number, T[]>();
  for (const e of entri) {
    const m = mingguKe(e.hariKe);
    peta.set(m, [...(peta.get(m) ?? []), e]);
  }
  return [...peta.entries()]
    .sort(([a], [b]) => b - a)
    .map(([minggu, isi]) => ({
      minggu,
      hariAwal: (minggu - 1) * 7,
      hariAkhir: minggu * 7 - 1,
      entri: [...isi].sort((a, b) => b.hariKe - a.hariKe),
      jumlahFoto: isi.filter((e) => e.foto).length,
      jumlahCatatan: isi.filter((e) => e.catatan).length,
    }));
}
