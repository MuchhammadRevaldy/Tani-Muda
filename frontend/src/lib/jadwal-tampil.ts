/**
 * Tugas yang tampil di halaman Jadwal (T4.10, papan 20, 21, P0-12). Tugas sekali tampil semua.
 * Tugas berulang dan ukur tidak tampil puluhan baris:
 * - kemunculan hari ini dan besok tampil;
 * - kemunculan terlambat yang belum selesai tampil satu (yang terakhir), hanya bila tidak ada
 *   kemunculan hari ini;
 * - bila tidak ada kemunculan hari ini atau besok, kemunculan berikutnya tampil satu;
 * - kemunculan lain yang sudah selesai tidak tampil (diwakili frekuensinya).
 */
import type { Tugas } from '../tipe';
import type { TanggalISO } from './format';
import { bandingTanggal, tambahHari } from './tanggal';

export function tugasJadwal(tugas: Tugas[], hariIni: TanggalISO): Tugas[] {
  const besok = tambahHari(hariIni, 1);
  const hasil: Tugas[] = [];
  const pola = new Map<string, Tugas[]>();
  for (const t of tugas) {
    if (t.tipe === 'sekali') hasil.push(t);
    else pola.set(t.resepTugasId, [...(pola.get(t.resepTugasId) ?? []), t]);
  }
  for (const daftar of pola.values()) {
    const urut = [...daftar].sort((a, b) => bandingTanggal(a.tanggal, b.tanggal));
    const dekat = urut.filter((t) => t.tanggal === hariIni || t.tanggal === besok);
    const adaHariIni = dekat.some((t) => t.tanggal === hariIni);
    const terlambat = urut.filter(
      (t) => t.status === 'belum' && bandingTanggal(t.tanggal, hariIni) < 0,
    );
    if (!adaHariIni && terlambat.length) hasil.push(terlambat[terlambat.length - 1] as Tugas);
    hasil.push(...dekat);
    if (!dekat.length) {
      const berikut = urut.find((t) => bandingTanggal(t.tanggal, besok) > 0);
      if (berikut) hasil.push(berikut);
    }
  }
  return hasil;
}
