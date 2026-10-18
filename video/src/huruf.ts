import { continueRender, delayRender, staticFile } from 'remotion';

/**
 * Muat huruf Outfit lokal untuk semua komposisi (teaser, papan gaya, pratinjau ikon),
 * dan tahan render sampai hurufnya siap supaya tidak jatuh ke huruf cadangan [AG-44].
 */
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  const tunggu = delayRender('Memuat huruf Outfit');
  const daftar = [
    new FontFace('Outfit', `url('${staticFile('fonts/outfit-latin.woff2')}') format('woff2')`, { weight: '100 900' }),
    new FontFace('Outfit', `url('${staticFile('fonts/outfit-latin-ext.woff2')}') format('woff2')`, {
      weight: '100 900',
      unicodeRange: 'U+0100-024F, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF',
    }),
  ];
  Promise.all(daftar.map((f) => f.load()))
    .then((hasil) => hasil.forEach((f) => document.fonts.add(f)))
    .catch((e) => console.error('Huruf Outfit gagal dimuat', e))
    .finally(() => continueRender(tunggu));
}
