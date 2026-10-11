/**
 * Ubah tanggal relatif data contoh menjadi tanggal nyata (lihat jenis-data.ts):
 * "H-13" → "YYYY-MM-DD", "H+0T07:00" → waktu UTC ISO, "B+2" → "YYYY-MM",
 * "J-1" → waktu UTC ISO satu jam sebelum data dibuat atau diatur ulang (D-47).
 */
import type { TanggalISO } from '../../lib/format';
import { tambahHari } from '../../lib/tanggal';
import { utcDariLokal } from '../../lib/zona-waktu';

const POLA_HARI = /^H([+-]\d+)$/;
const POLA_WAKTU = /^H([+-]\d+)T(\d{2}):(\d{2})$/;
const POLA_BULAN = /^B([+-]\d+)$/;
const POLA_JAM = /^J([+-]\d+)$/;
const JAM_MS = 3_600_000;

/**
 * `sekarangMs`: saat data dibuat atau diatur ulang, acuan untuk "J±n". Bila tidak diberikan,
 * acuannya hari ini pukul 08.00 waktu pengguna (sama dengan jam tes).
 */
export function selesaikanNilai(
  nilai: string,
  hariIni: TanggalISO,
  zona: string,
  sekarangMs?: number,
): string {
  const j = POLA_JAM.exec(nilai);
  if (j) {
    const acuan = sekarangMs ?? Date.parse(utcDariLokal(hariIni, 8, 0, zona));
    return new Date(acuan + Number(j[1]) * JAM_MS).toISOString();
  }
  const w = POLA_WAKTU.exec(nilai);
  if (w) return utcDariLokal(tambahHari(hariIni, Number(w[1])), Number(w[2]), Number(w[3]), zona);
  const d = POLA_HARI.exec(nilai);
  if (d) return tambahHari(hariIni, Number(d[1]));
  const b = POLA_BULAN.exec(nilai);
  if (b) {
    const [th, bl] = hariIni.split('-').map(Number) as [number, number];
    const total = th * 12 + (bl - 1) + Number(b[1]);
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
  }
  return nilai;
}

/** Salinan data dengan semua tanggal relatif diselesaikan. */
export function selesaikanTanggalRelatif<T>(
  data: T,
  hariIni: TanggalISO,
  zona: string,
  sekarangMs?: number,
): T {
  const jalan = (x: unknown): unknown => {
    if (typeof x === 'string') return selesaikanNilai(x, hariIni, zona, sekarangMs);
    if (Array.isArray(x)) return x.map(jalan);
    if (x !== null && typeof x === 'object')
      return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, jalan(v)]));
    return x;
  };
  return jalan(data) as T;
}
