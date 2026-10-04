/** Progres belajar (PRD P0-05, US-01, US-02): "3 dari 6 modul selesai" dan modul lanjutan. */
import type { Modul } from '../tipe';

export interface ProgresBelajar {
  jumlahSelesai: number;
  jumlahTotal: number;
  /** Persen bulat 0–100. */
  persen: number;
  /** Modul belum selesai pertama menurut urutan; null bila semua selesai. */
  modulLanjutan: Modul | null;
  semuaSelesai: boolean;
}

export function ringkasProgres(modul: Modul[], selesaiIds: Iterable<string>): ProgresBelajar {
  const selesai = new Set(selesaiIds);
  const urut = [...modul].sort((a, b) => a.urutan - b.urutan);
  const jumlahSelesai = urut.filter((m) => selesai.has(m.id)).length;
  const jumlahTotal = urut.length;
  return {
    jumlahSelesai,
    jumlahTotal,
    persen: jumlahTotal === 0 ? 0 : Math.round((jumlahSelesai / jumlahTotal) * 100),
    modulLanjutan: urut.find((m) => !selesai.has(m.id)) ?? null,
    semuaSelesai: jumlahTotal > 0 && jumlahSelesai === jumlahTotal,
  };
}
