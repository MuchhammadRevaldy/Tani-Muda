/**
 * Angka kartu pemilih siklus di Beranda (AG-17): progres umur per siklus atau per petak (D-40), hari
 * ke-n, dan jumlah tugas terlambat. Fungsi murni.
 */
import type { TanggalISO } from './format';
import { statusTugas } from './jadwal-ubah';
import { selisihHari } from './tanggal';

export interface SiklusKartu {
  id: string;
  status: 'rencana' | 'aktif' | 'selesai';
  tanggalTanam: TanggalISO | null;
}

export interface TugasKartu {
  siklusId: string;
  tipe: string;
  hst: number;
  tanggal: TanggalISO;
  status: 'belum' | 'selesai';
}

export interface RingkasanKartu {
  /** Progres 0–1, satu per anggota (petak), urut seperti anggota. */
  segmen: number[];
  /** Hari ke-n dan umur panen siklus wakil; null bila belum ditanam. */
  hariKe: number | null;
  umurPanen: number;
  /** Tugas belum selesai yang tanggalnya sudah lewat, di semua anggota. */
  terlambat: number;
}

/**
 * Umur panen siklus: hari tugas sekali paling akhir (tugas panen), atau umur komoditas bila siklus
 * belum punya tugas.
 */
export function umurPanenSiklus(siklusId: string, tugas: TugasKartu[], umurKomoditas: number) {
  const hst = tugas.filter((x) => x.siklusId === siklusId && x.tipe === 'sekali').map((x) => x.hst);
  return hst.length ? Math.max(...hst) : umurKomoditas;
}

export function hariKeSiklus(s: SiklusKartu, hariIni: TanggalISO): number | null {
  if (!s.tanggalTanam || s.tanggalTanam > hariIni) return null;
  return selisihHari(s.tanggalTanam, hariIni);
}

export function progresSiklus(
  s: SiklusKartu,
  tugas: TugasKartu[],
  umurKomoditas: number,
  hariIni: TanggalISO,
): number {
  if (s.status === 'selesai') return 1;
  const hari = hariKeSiklus(s, hariIni);
  if (hari === null) return 0;
  const umur = umurPanenSiklus(s.id, tugas, umurKomoditas);
  return umur > 0 ? Math.min(1, hari / umur) : 0;
}

export function ringkasKartuSiklus(
  anggota: SiklusKartu[],
  wakil: SiklusKartu,
  tugas: TugasKartu[],
  umurKomoditas: number,
  hariIni: TanggalISO,
): RingkasanKartu {
  const id = new Set(anggota.map((a) => a.id));
  return {
    segmen: anggota.map((a) => progresSiklus(a, tugas, umurKomoditas, hariIni)),
    hariKe: hariKeSiklus(wakil, hariIni),
    umurPanen: umurPanenSiklus(wakil.id, tugas, umurKomoditas),
    terlambat: tugas.filter(
      (x) => id.has(x.siklusId) && statusTugas(x, hariIni).jenis === 'terlambat',
    ).length,
  };
}
