/**
 * Linimasa teaser [AG-45]: satu kalimat narasi = satu shot.
 *
 * Narasi (public/audio/narasi/rekaman.wav) mulai di detik 0 video. Shot ke-n mulai
 * sedikit sebelum kalimatnya diucapkan dan berakhir saat kalimat berikutnya mulai.
 * Total = panjang rekaman + EKOR_DETIK (paling banyak 3 detik).
 * Rumus yang sama dipakai scripts/cek-durasi.mjs.
 */
import data from '../data/waktu-kalimat.json';
import { FPS } from './tema';

export const MAJU_DETIK = 0.15;
export const EKOR_DETIK = 2.5;

export interface KataShot {
  teks: string;
  /** frame relatif awal shot */
  f: number;
}

export interface Shot {
  id: string;
  adegan: string;
  teks: string;
  mulaiFrame: number;
  durasiFrame: number;
  /** frame relatif awal shot saat kalimat mulai dan selesai diucapkan */
  ucapMulai: number;
  ucapSelesai: number;
  kata: KataShot[];
  /** shot pertama di adegannya (transisi sapuan) */
  awalAdegan: boolean;
}

export const TOTAL_DETIK = data.durasiRekamanDetik + EKOR_DETIK;
export const TOTAL_FRAME = Math.round(TOTAL_DETIK * FPS);

export const SHOT: Shot[] = data.kalimat.map((k, i, semua) => {
  const mulai = i === 0 ? 0 : Math.round((k.mulai - MAJU_DETIK) * FPS);
  const berikut = semua[i + 1];
  const selesai = berikut ? Math.round((berikut.mulai - MAJU_DETIK) * FPS) : TOTAL_FRAME;
  return {
    id: k.id,
    adegan: k.adegan,
    teks: k.teks,
    mulaiFrame: mulai,
    durasiFrame: selesai - mulai,
    ucapMulai: Math.round(k.mulai * FPS) - mulai,
    ucapSelesai: Math.round(k.selesai * FPS) - mulai,
    kata: k.kata.map((w) => ({ teks: w.teks, f: Math.round(w.mulai * FPS) - mulai })),
    awalAdegan: i === 0 || semua[i - 1].adegan !== k.adegan,
  };
});

export const KALIMAT = data.kalimat;

export function shotDenganId(id: string): Shot {
  const s = SHOT.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} tidak ada`);
  return s;
}

/** Frame (relatif shot) saat kata yang cocok dengan pola pertama kali diucapkan. */
export function frameKata(shot: Shot, pola: RegExp, cadangan = 0): number {
  const k = shot.kata.find((w) => pola.test(w.teks));
  return k ? k.f : cadangan;
}
