/**
 * Isi pengingat harian (PRD P0-13, P0-38, P1-05). Logika "tugas apa yang dikirim" dipisah dari
 * salurannya (P2-02): fungsi ini dipakai untuk web push, banner bila izin ditolak, dan kelak
 * diport ke scheduler backend. Teks tampilannya dibuat di src/teks/notifikasi.ts.
 */
import type { PengaturanPengingat, Tugas } from '../tipe';
import type { TanggalISO } from './format';
import { statusTugas } from './jadwal-ubah';
import { bandingTanggal } from './tanggal';

export interface ButirPengingat {
  tugasId: string;
  judul: string;
  terlambat: boolean;
}

export interface IsiPengingat {
  /** Semua tipe dimatikan: tidak ada pengingat pagi sama sekali. */
  tanpaPengingatPagi: boolean;
  /** Ada yang perlu dikirim pagi ini. */
  kirim: boolean;
  /** Tugas terlambat lebih dulu, lalu tugas hari ini; berulang hanya sekali per pola. */
  butir: ButirPengingat[];
}

function tugasPerluDiingat(
  tugas: Tugas[],
  pengaturan: PengaturanPengingat,
  hariIni: TanggalISO,
): ButirPengingat[] {
  const terlihat = new Set<string>();
  return tugas
    .filter((t) => pengaturan.tipeAktif[t.tipe])
    .map((t) => ({ t, s: statusTugas(t, hariIni) }))
    .filter(({ s }) => s.jenis === 'terlambat' || s.jenis === 'hari-ini')
    .sort(
      (a, b) =>
        Number(b.s.jenis === 'terlambat') - Number(a.s.jenis === 'terlambat') ||
        bandingTanggal(a.t.tanggal, b.t.tanggal),
    )
    .filter(({ t }) => {
      // tugas berulang yang tertunggak beberapa kali cukup disebut sekali
      if (terlihat.has(t.resepTugasId)) return false;
      terlihat.add(t.resepTugasId);
      return true;
    })
    .map(({ t, s }) => ({ tugasId: t.id, judul: t.judul, terlambat: s.jenis === 'terlambat' }));
}

/**
 * Isi pengingat pagi. Mematikan sebuah tipe menghilangkannya dari pengingat, tetapi tidak dari
 * jadwal dan beranda (P0-38). Tidak ada tugas → tidak mengirim.
 */
export function tugasUntukNotifikasi(
  tugas: Tugas[],
  pengaturan: PengaturanPengingat,
  hariIni: TanggalISO,
): IsiPengingat {
  const tanpaPengingatPagi = !Object.values(pengaturan.tipeAktif).some(Boolean);
  const butir = tanpaPengingatPagi ? [] : tugasPerluDiingat(tugas, pengaturan, hariIni);
  return { tanpaPengingatPagi, kirim: butir.length > 0, butir };
}

/** Pengingat sore (P1-05) hanya bila aktif dan masih ada tugas hari ini yang belum selesai. */
export function perluPengingatSore(
  tugas: Tugas[],
  pengaturan: PengaturanPengingat,
  hariIni: TanggalISO,
): boolean {
  if (!pengaturan.soreAktif) return false;
  return tugasPerluDiingat(tugas, pengaturan, hariIni).length > 0;
}
