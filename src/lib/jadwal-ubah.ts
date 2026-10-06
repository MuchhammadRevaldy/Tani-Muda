/**
 * Mengubah dan membaca jadwal (PRD P0-12, P0-15, P0-16, P0-17):
 * tunda 1–3 hari (tugas itu dan tugas sejenis berikutnya ikut bergeser), ubah tanggal tanam
 * (hanya tugas yang belum selesai), status waktu (status "terlambat" tidak disimpan, dihitung dari
 * tanggal dan hari ini), pengelompokan per hari, saringan tipe, dan ringkasan tugas berulang.
 */
import type { TipeTugas, Tugas } from '../tipe';
import type { TanggalISO } from './format';
import { berhasil, gagal, type Hasil, type KodeGalat } from './hasil';
import { bandingTanggal, selisihHari, tambahHari } from './tanggal';

export const BATAS_TUNDA = { min: 1, maks: 3 } as const;

export interface HasilTunda {
  jadwal: Tugas[];
  /** ID tugas yang digeser. */
  digeser: string[];
  /** Ada tugas yang bergeser melewati perkiraan panen: minta konfirmasi petani. */
  perluKonfirmasi: boolean;
}

/**
 * Tunda tugas `hari` (1–3) hari. Tugas sejenis berikutnya (pola resep sama, belum selesai, tanggal
 * sama atau sesudahnya) ikut bergeser. Jadwal asal tidak diubah. Bila `hariIni` diberikan dan tugas
 * sudah terlambat, tanggal baru dihitung dari hari ini (papan 22: tunda 1 hari → besok), dan tugas
 * sejenis bergeser sejauh yang sama.
 */
export function tundaTugas(
  jadwal: Tugas[],
  tugasId: string,
  hari: number,
  perkiraanPanen: TanggalISO,
  hariIni?: TanggalISO,
): Hasil<HasilTunda> {
  const target = jadwal.find((t) => t.id === tugasId);
  if (!target) return gagal('TUGAS_TIDAK_ADA');
  if (target.status === 'selesai') return gagal('TUGAS_SUDAH_SELESAI');
  if (!target.bolehDigeser) return gagal('TIDAK_BOLEH_DIGESER');
  if (!Number.isInteger(hari) || hari < BATAS_TUNDA.min || hari > BATAS_TUNDA.maks)
    return gagal('TUNDA_DI_LUAR_BATAS');

  const terlambat = hariIni ? Math.max(0, selisihHari(target.tanggal, hariIni)) : 0;
  const geser = hari + terlambat;
  const digeser: string[] = [];
  let perluKonfirmasi = false;
  const baru = jadwal.map((t) => {
    const sejenis =
      t.resepTugasId === target.resepTugasId &&
      t.status === 'belum' &&
      bandingTanggal(t.tanggal, target.tanggal) >= 0;
    if (!sejenis) return t;
    const tanggal = tambahHari(t.tanggal, geser);
    digeser.push(t.id);
    if (selisihHari(perkiraanPanen, tanggal) > 0) perluKonfirmasi = true;
    return { ...t, tanggal };
  });
  return berhasil({ jadwal: baru, digeser, perluKonfirmasi });
}

/** Ubah tanggal tanam: tugas belum selesai bergeser sebesar selisihnya; tugas selesai tetap. */
export function ubahTanggalTanam(
  jadwal: Tugas[],
  tanggalTanamLama: TanggalISO,
  tanggalTanamBaru: TanggalISO,
): Tugas[] {
  const geser = selisihHari(tanggalTanamLama, tanggalTanamBaru);
  return jadwal.map((t) =>
    t.status === 'selesai' ? t : { ...t, tanggal: tambahHari(t.tanggal, geser) },
  );
}

export type StatusWaktu =
  | { jenis: 'selesai' }
  | { jenis: 'terlambat'; hari: number }
  | { jenis: 'hari-ini' }
  | { jenis: 'besok' }
  | { jenis: 'nanti'; hari: number };

/** Status waktu tugas dibanding hari ini. */
export function statusTugas(
  tugas: Pick<Tugas, 'tanggal' | 'status'>,
  hariIni: TanggalISO,
): StatusWaktu {
  if (tugas.status === 'selesai') return { jenis: 'selesai' };
  const d = selisihHari(hariIni, tugas.tanggal);
  if (d < 0) return { jenis: 'terlambat', hari: -d };
  if (d === 0) return { jenis: 'hari-ini' };
  if (d === 1) return { jenis: 'besok' };
  return { jenis: 'nanti', hari: d };
}

export type KunciKelompok = 'terlambat' | 'hari-ini' | 'besok' | 'selesai' | TanggalISO;

export interface KelompokHari {
  kunci: KunciKelompok;
  tugas: Tugas[];
}

/**
 * Kelompokkan jadwal untuk tampilan: Terlambat, Hari ini, Besok, lalu per tanggal berikutnya,
 * lalu Sudah selesai. Di dalam kelompok diurutkan menurut tanggal lalu judul.
 */
export function kelompokkanPerHari(tugas: Tugas[], hariIni: TanggalISO): KelompokHari[] {
  const peta = new Map<KunciKelompok, Tugas[]>();
  for (const t of tugas) {
    const s = statusTugas(t, hariIni);
    const kunci: KunciKelompok = s.jenis === 'nanti' ? t.tanggal : s.jenis;
    peta.set(kunci, [...(peta.get(kunci) ?? []), t]);
  }
  const urut = (a: Tugas, b: Tugas) =>
    bandingTanggal(a.tanggal, b.tanggal) || a.judul.localeCompare(b.judul, 'id');
  const tetap: KunciKelompok[] = ['terlambat', 'hari-ini', 'besok'];
  const tanggal = [...peta.keys()]
    .filter((k) => !tetap.includes(k) && k !== 'selesai')
    .sort(bandingTanggal);
  return [...tetap, ...tanggal, 'selesai']
    .filter((k) => peta.has(k))
    .map((kunci) => ({ kunci, tugas: (peta.get(kunci) as Tugas[]).sort(urut) }));
}

export interface HasilSaring {
  tugas: Tugas[];
  /** `TIDAK_ADA_TIPE` bila resep siklus ini tidak punya tugas bertipe itu (mis. ukur di bedengan). */
  kosongKarena: Extract<KodeGalat, 'TIDAK_ADA_TIPE'> | null;
}

/** Saring jadwal menurut tipe tugas (P0-12). */
export function saringTipe(tugas: Tugas[], tipe: TipeTugas | 'semua'): HasilSaring {
  if (tipe === 'semua') return { tugas, kosongKarena: null };
  const hasil = tugas.filter((t) => t.tipe === tipe);
  return { tugas: hasil, kosongKarena: hasil.length === 0 ? 'TIDAK_ADA_TIPE' : null };
}

export interface BarisJadwal {
  /** Tugas yang mewakili baris: kemunculan berikutnya yang belum selesai (atau yang terakhir). */
  tugas: Tugas;
  /** Jumlah kemunculan pola ini; 1 untuk tugas sekali. */
  jumlahKemunculan: number;
  sisaKemunculan: number;
}

/**
 * Tugas berulang dan ukur tampil sebagai satu baris dengan frekuensi, bukan puluhan baris (P0-12).
 * Baris mewakili kemunculan belum selesai yang paling awal (termasuk yang terlambat); bila semua
 * selesai, kemunculan terakhir.
 */
export function ringkasBerulang(tugas: Tugas[]): BarisJadwal[] {
  const hasil: BarisJadwal[] = [];
  const pola = new Map<string, Tugas[]>();
  for (const t of tugas) {
    if (t.tipe === 'sekali')
      hasil.push({ tugas: t, jumlahKemunculan: 1, sisaKemunculan: t.status === 'belum' ? 1 : 0 });
    else pola.set(t.resepTugasId, [...(pola.get(t.resepTugasId) ?? []), t]);
  }
  for (const daftar of pola.values()) {
    const urut = [...daftar].sort((a, b) => bandingTanggal(a.tanggal, b.tanggal));
    const belum = urut.filter((t) => t.status === 'belum');
    hasil.push({
      tugas: belum[0] ?? (urut.at(-1) as Tugas),
      jumlahKemunculan: urut.length,
      sisaKemunculan: belum.length,
    });
  }
  return hasil.sort((a, b) => bandingTanggal(a.tugas.tanggal, b.tugas.tanggal));
}
