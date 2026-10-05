/** Tipe domain lahan, siklus tanam, tugas, dan pengukuran (Model Data PRD + D-06, D-15). */
import type { JenisLahan, TipeTugas, BesaranUkur } from './resep';

export interface Lahan {
  id: string;
  petaniId: string;
  nama: string;
  jenisLahan: JenisLahan;
  /** Luas dalam m² (lahan tanah). */
  luasM2: number;
  satuanAsli: string;
  nilaiAsli: number;
  wilayahId: string;
  /** Kapasitas instalasi hidroponik (jumlah lubang). Hanya untuk lahan hidroponik. */
  kapasitasLubang: number | null;
}

export type StatusSiklus = 'rencana' | 'aktif' | 'selesai';

export interface SiklusTanam {
  id: string;
  petaniId: string;
  lahanId: string;
  resepId: string;
  resepVersi: number;
  status: StatusSiklus;
  /** Luas yang dipakai (lahan tanah). */
  luasM2: number | null;
  /** Jumlah lubang yang dipakai (hidroponik). */
  jumlahLubang: number | null;
  tanggalTanam: string | null;
  dapatSubsidi: boolean;
  hargaJual: number;
  perkiraanPanenKg: number;
  /** Alokasi pesanan yang dipenuhi siklus ini, bila ada. */
  alokasiPesananId: string | null;
}

export type StatusTugas = 'belum' | 'selesai';

export interface Tugas {
  id: string;
  resepTugasId: string;
  tipe: TipeTugas;
  judul: string;
  /** Tanggal jadwal "YYYY-MM-DD". */
  tanggal: string;
  hst: number;
  status: StatusTugas;
  bolehDigeser: boolean;
  /** Jarak hari kemunculan, untuk tugas berulang dan ukur. */
  interval?: number;
  ukur?: BesaranUkur[];
}

export type StatusPengukuran = 'normal' | 'terlalu-rendah' | 'terlalu-tinggi' | 'kosong';
export type SumberPengukuran = 'manual' | 'sensor';

export interface HasilPengukuran {
  tugasId: string;
  besaran: string;
  nilai: number;
  status: StatusPengukuran;
  sumber: SumberPengukuran;
  /** Tanggal ukur "YYYY-MM-DD". */
  tanggal: string;
}

export interface PengaturanPengingat {
  /** Jam pengingat pagi, mis. 6 untuk 06.00. */
  jamPagi: number;
  menitPagi: number;
  soreAktif: boolean;
  tipeAktif: Record<TipeTugas, boolean>;
}
