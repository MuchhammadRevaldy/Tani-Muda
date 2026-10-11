/**
 * Jadwal otomatis dari resep (PRD P0-12; rumus "Tanggal tugas sekali" dan "Tanggal tugas berulang
 * dan pengukuran"):
 * - sekali: tanggal tanam + HST;
 * - berulang dan ukur: tanggal tanam + HST mulai + k × interval, untuk setiap k sampai HST selesai.
 * Tanggal berupa "YYYY-MM-DD" tanpa jam supaya bebas zona waktu.
 */
import type { ResepTugas, Tugas } from '../tipe';
import type { TanggalISO } from './format';
import { berhasil, gagal, type Hasil } from './hasil';
import { bandingTanggal, tambahHari } from './tanggal';

/** Periksa satu pola tugas resep. */
export function validasiResepTugas(t: ResepTugas): Hasil<true> {
  if (!Number.isInteger(t.hstMulai) || t.hstMulai < 0) return gagal('HST_TIDAK_VALID');
  if (t.tipe === 'sekali') return berhasil(true);
  if (t.hstSelesai === undefined || !Number.isInteger(t.hstSelesai) || t.hstSelesai < t.hstMulai) {
    return gagal('HST_TIDAK_VALID');
  }
  if (t.interval === undefined || !Number.isInteger(t.interval) || t.interval < 1)
    return gagal('INTERVAL_TIDAK_VALID');
  if (t.tipe === 'ukur' && !t.ukur?.length) return gagal('HST_TIDAK_VALID');
  return berhasil(true);
}

/** Daftar HST kemunculan sebuah pola tugas. */
export function hstKemunculan(t: ResepTugas): number[] {
  if (t.tipe === 'sekali') return [t.hstMulai];
  const hasil: number[] = [];
  for (let h = t.hstMulai; h <= (t.hstSelesai as number); h += t.interval as number) hasil.push(h);
  return hasil;
}

/** ID tugas yang stabil: pola resep + HST, mis. "pupuk-1@7". */
export const idTugas = (resepTugasId: string, hst: number) => `${resepTugasId}@${hst}`;

/**
 * Buat jadwal nyata dari pola tugas resep dan tanggal tanam (boleh tanggal lampau untuk siklus
 * pilot). Hasil diurutkan menurut tanggal, lalu urutan pola di resep.
 */
export function buatJadwal(resepTugas: ResepTugas[], tanggalTanam: TanggalISO): Hasil<Tugas[]> {
  const hasil: { tugas: Tugas; urutan: number }[] = [];
  for (const [urutan, t] of resepTugas.entries()) {
    const valid = validasiResepTugas(t);
    if (!valid.ok) return valid;
    for (const hst of hstKemunculan(t)) {
      hasil.push({
        urutan,
        tugas: {
          id: idTugas(t.id, hst),
          resepTugasId: t.id,
          tipe: t.tipe,
          judul: t.judul,
          tanggal: tambahHari(tanggalTanam, hst),
          hst,
          status: 'belum',
          bolehDigeser: t.bolehDigeser,
          ...(t.interval !== undefined && t.tipe !== 'sekali' ? { interval: t.interval } : {}),
          ...(t.ukur ? { ukur: t.ukur } : {}),
        },
      });
    }
  }
  hasil.sort((a, b) => bandingTanggal(a.tugas.tanggal, b.tugas.tanggal) || a.urutan - b.urutan);
  return berhasil(hasil.map((h) => h.tugas));
}
