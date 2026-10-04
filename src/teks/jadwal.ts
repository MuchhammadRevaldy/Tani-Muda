/** Teks jadwal dan pengingat untuk petani ("kamu", bahasa petani: "hari ke-n", bukan HST). */
import type { StatusWaktu } from '../lib/jadwal-ubah';
import type { IsiPengingat } from '../lib/pengingat';

/** "setiap hari", "setiap 3 hari". */
export function teksFrekuensi(interval: number): string {
  return interval === 1 ? 'setiap hari' : `setiap ${interval} hari`;
}

/** Chip waktu tugas: "Terlambat 2 hari", "Hari ini", "Besok", "5 hari lagi", "Selesai". */
export function teksStatusWaktu(s: StatusWaktu): string {
  switch (s.jenis) {
    case 'selesai':
      return 'Selesai';
    case 'terlambat':
      return `Terlambat ${s.hari} hari`;
    case 'hari-ini':
      return 'Hari ini';
    case 'besok':
      return 'Besok';
    case 'nanti':
      return `${s.hari} hari lagi`;
  }
}

/**
 * Isi notifikasi pagi: judul "3 tugas hari ini", isi "Siangi rumput (terlambat), Siram pagi dan
 * sore". Null bila tidak ada yang dikirim.
 */
export function teksNotifikasiPagi(isi: IsiPengingat): { judul: string; isi: string } | null {
  if (!isi.kirim) return null;
  return {
    judul: `${isi.butir.length} tugas hari ini`,
    isi: isi.butir.map((b) => (b.terlambat ? `${b.judul} (terlambat)` : b.judul)).join(', '),
  };
}
