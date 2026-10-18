/**
 * Linimasa teaser [AG-44]: durasi tiap adegan mengikuti panjang narasinya.
 *
 * durasi adegan = maks(minimumDetik, awalNarasi + panjang narasi + ekor)
 *
 * Rumus yang sama dipakai scripts/cek-durasi.mjs; ubah keduanya bersamaan.
 */
import dataNarasi from './data/narasi.json';

export interface KalimatNarasi {
  teks: string;
  mulai: number;
  selesai: number;
}

export interface AdeganLinimasa {
  id: string;
  judul: string;
  sumber: string;
  mulaiFrame: number;
  durasiFrame: number;
  /** Frame (relatif awal adegan) saat narasi mulai berbunyi. */
  awalNarasiFrame: number;
  narasiDetik: number;
  kalimat: KalimatNarasi[];
}

export interface Linimasa {
  adegan: AdeganLinimasa[];
  totalFrame: number;
}

export const FPS = dataNarasi.fps;

/**
 * @param durasiTerukur durasi berkas narasi yang diukur langsung (detik) per id;
 *   bila ada, menggantikan angka di narasi.json supaya rekaman baru tidak terpotong.
 */
export function hitungLinimasa(durasiTerukur: Record<string, number> = {}): Linimasa {
  let mulai = 0;
  const adegan = dataNarasi.adegan.map((a) => {
    const narasiDetik = Math.max(a.durasiDetik, durasiTerukur[a.id] ?? 0);
    const detik = Math.max(a.minimumDetik, dataNarasi.awalNarasiDetik + narasiDetik + dataNarasi.ekorDetik);
    const durasiFrame = Math.ceil(detik * FPS);
    const item: AdeganLinimasa = {
      id: a.id,
      judul: a.judul,
      sumber: a.sumber,
      mulaiFrame: mulai,
      durasiFrame,
      awalNarasiFrame: Math.round(dataNarasi.awalNarasiDetik * FPS),
      narasiDetik,
      kalimat: a.kalimat,
    };
    mulai += durasiFrame;
    return item;
  });
  return { adegan, totalFrame: mulai };
}
