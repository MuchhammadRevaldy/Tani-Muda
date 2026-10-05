/**
 * Susunan Beranda petani (T4.09, PRD P0-06, P0-16): tugas yang tampil hari ini, tugas besok untuk
 * banner, pin penggaris umur tanam, hasil ukur terakhir, dan persen modal yang sudah keluar.
 * Fungsi murni: "hari ini" dikirim sebagai argumen.
 */
import type { HasilPengukuran, Tugas } from '../tipe';
import type { TanggalISO } from './format';
import { statusTugas } from './jadwal-ubah';
import type { JadwalPin, StatusPin } from './tata-letak-penggaris';
import { bandingTanggal } from './tanggal';

/** Tugas beserta siklusnya; beranda menggabungkan tugas dari semua siklus aktif. */
export type TugasSiklus = Tugas & { siklusId: string };

/**
 * Tugas yang tampil di "Tugas hari ini":
 * - tugas sekali yang jatuh tempo atau terlambat dan belum selesai;
 * - tugas berulang dan ukur: hanya kemunculan terakhir sampai hari ini per pola, karena siram
 *   kemarin yang terlewat tidak bisa dikerjakan lagi;
 * - tugas yang sudah dicentang hari ini tetap tampil (tercoret) sampai besok.
 * Urutan: terlambat, belum, lalu selesai; di dalamnya menurut tanggal lalu judul.
 */
export function tugasHariIni(tugas: TugasSiklus[], hariIni: TanggalISO): TugasSiklus[] {
  const sampaiHariIni = tugas.filter((t) => bandingTanggal(t.tanggal, hariIni) <= 0);
  const terakhir = new Map<string, TugasSiklus>();
  const hasil: TugasSiklus[] = [];
  for (const t of sampaiHariIni) {
    if (t.tipe === 'sekali') {
      if (t.status === 'belum' || t.tanggal === hariIni) hasil.push(t);
      continue;
    }
    const kunci = `${t.siklusId}|${t.resepTugasId}`;
    const lama = terakhir.get(kunci);
    if (!lama || bandingTanggal(t.tanggal, lama.tanggal) > 0) terakhir.set(kunci, t);
  }
  for (const t of terakhir.values()) {
    if (t.status === 'belum' || t.tanggal === hariIni) hasil.push(t);
  }
  const peringkat = (t: TugasSiklus) => {
    const s = statusTugas(t, hariIni);
    return s.jenis === 'terlambat' ? 0 : s.jenis === 'selesai' ? 2 : 1;
  };
  return hasil.sort(
    (a, b) =>
      peringkat(a) - peringkat(b) ||
      bandingTanggal(a.tanggal, b.tanggal) ||
      a.judul.localeCompare(b.judul, 'id'),
  );
}

/** Jumlah tugas terlambat di daftar beranda. */
export function jumlahTerlambat(tugas: Tugas[], hariIni: TanggalISO): number {
  return tugas.filter((t) => statusTugas(t, hariIni).jenis === 'terlambat').length;
}

/**
 * Tugas sekali yang jatuh besok dan belum selesai, untuk banner "Besok: …". Tugas berulang tidak
 * diumumkan karena muncul hampir setiap hari.
 */
export function tugasBesok(tugas: Tugas[], hariIni: TanggalISO): Tugas | null {
  return (
    tugas
      .filter((t) => t.tipe === 'sekali' && statusTugas(t, hariIni).jenis === 'besok')
      .sort((a, b) => a.judul.localeCompare(b.judul, 'id'))[0] ?? null
  );
}

/**
 * Pin penggaris umur tanam dari tugas sekali (pupuk, cek hama, panen), satu per pola. Status pin:
 * selesai, terlambat, besok, panen (hari panen yang belum selesai), atau belum.
 */
export function pinPenggaris(tugas: Tugas[], hariIni: TanggalISO, hariPanen: number): JadwalPin[] {
  const perPola = new Map<string, Tugas>();
  for (const t of tugas) {
    if (t.tipe !== 'sekali') continue;
    const lama = perPola.get(t.resepTugasId);
    if (!lama || t.hst < lama.hst) perPola.set(t.resepTugasId, t);
  }
  return [...perPola.values()]
    .sort((a, b) => a.hst - b.hst)
    .map((t) => {
      const s = statusTugas(t, hariIni);
      const status: StatusPin =
        s.jenis === 'selesai'
          ? 'selesai'
          : s.jenis === 'terlambat'
            ? 'terlambat'
            : s.jenis === 'besok'
              ? 'besok'
              : t.hst >= hariPanen
                ? 'panen'
                : 'belum';
      return { hari: t.hst, label: t.judul, status };
    });
}

/**
 * Hasil ukur terakhir per besaran, urut menurut kemunculan besaran pertama. Hasil dengan tanggal
 * sama: yang tercatat belakangan menang.
 */
export function hasilUkurTerakhir(hasil: HasilPengukuran[]): HasilPengukuran[] {
  const terakhir = new Map<string, HasilPengukuran>();
  for (const h of hasil) {
    const lama = terakhir.get(h.besaran);
    if (!lama || bandingTanggal(h.tanggal, lama.tanggal) >= 0) terakhir.set(h.besaran, h);
  }
  return [...terakhir.values()];
}

/** Persen modal yang sudah keluar dari rencana, dibulatkan; 0 bila rencana kosong. */
export function persenTerpakai(sudahKeluar: number, rencana: number): number {
  if (!(rencana > 0) || !(sudahKeluar > 0)) return 0;
  return Math.round((sudahKeluar / rencana) * 100);
}
