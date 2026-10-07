/**
 * Pengelompokan siklus untuk tampilan (D-40): petak-petak satu pesanan rutin tampil sebagai satu
 * kelompok di Beranda, pil siklus, dan menu Kebun, supaya daftar tidak dibanjiri petak.
 */
import type { TanggalISO } from './format';

export interface SiklusUntukKelompok {
  id: string;
  status: 'rencana' | 'aktif' | 'selesai';
  tanggalTanam: TanggalISO | null;
  /** Alokasi pesanan yang dipenuhi; null untuk siklus biasa. */
  alokasiId: string | null;
  /** Jumlah petak alokasi itu; kelompok hanya dibuat bila lebih dari satu. */
  jumlahPetak: number;
}

export interface UnitSiklus<T> {
  /** Id siklus untuk siklus biasa, `pesanan:<alokasi>` untuk kelompok petak. */
  id: string;
  kelompok: boolean;
  anggota: T[];
}

export const idKelompok = (alokasiId: string) => `pesanan:${alokasiId}`;

/** Urutan unit mengikuti kemunculan pertama di daftar; anggota kelompok urut tanggal tanam. */
export function kelompokkanSiklus<T extends SiklusUntukKelompok>(daftar: T[]): UnitSiklus<T>[] {
  const unit: UnitSiklus<T>[] = [];
  const perId = new Map<string, UnitSiklus<T>>();
  for (const s of daftar) {
    const kelompok = s.alokasiId !== null && s.jumlahPetak > 1;
    const id = kelompok ? idKelompok(s.alokasiId as string) : s.id;
    const ada = perId.get(id);
    if (ada) ada.anggota.push(s);
    else {
      const baru = { id, kelompok, anggota: [s] };
      perId.set(id, baru);
      unit.push(baru);
    }
  }
  for (const u of unit)
    u.anggota.sort((a, b) => (a.tanggalTanam ?? '').localeCompare(b.tanggalTanam ?? ''));
  return unit;
}

const tumbuh = (s: SiklusUntukKelompok, hariIni: TanggalISO) =>
  s.status === 'aktif' && !!s.tanggalTanam && s.tanggalTanam <= hariIni;

/**
 * Petak yang mewakili kelompok: yang sudah ditanam dan paling dulu dipanen; bila belum ada yang
 * ditanam, petak berikutnya yang akan ditanam; selain itu anggota pertama.
 */
export function petakTerkini<T extends SiklusUntukKelompok>(
  anggota: T[],
  hariIni: TanggalISO,
): T | null {
  return (
    anggota.find((s) => tumbuh(s, hariIni)) ??
    anggota.find((s) => s.status !== 'selesai') ??
    anggota[0] ??
    null
  );
}

export interface RingkasanKelompok {
  total: number;
  tumbuh: number;
  selesai: number;
  /** Tanggal tanam petak berikutnya yang belum ditanam. */
  tanamBerikutnya: TanggalISO | null;
}

export function ringkasKelompok(
  anggota: SiklusUntukKelompok[],
  hariIni: TanggalISO,
): RingkasanKelompok {
  const nanti = anggota
    .filter((s) => s.status !== 'selesai' && s.tanggalTanam && s.tanggalTanam > hariIni)
    .map((s) => s.tanggalTanam as string)
    .sort();
  return {
    total: anggota.length,
    tumbuh: anggota.filter((s) => tumbuh(s, hariIni)).length,
    selesai: anggota.filter((s) => s.status === 'selesai').length,
    tanamBerikutnya: nanti[0] ?? null,
  };
}
