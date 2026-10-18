import React from 'react';

/**
 * Logo Tani Muda APA ADANYA dari frontend/public/logo/logo-tanda.svg [AG-45].
 * Bagian-bagiannya dipisah supaya bisa dirakit (posisi akhir = berkas asli).
 * scripts/cek-ikon-aplikasi.mjs memastikan setiap `d` sama dengan berkas aslinya.
 */
export const BAGIAN_LOGO = {
  tanah: 'M15 77 Q50 67 85 77',
  batang: 'M45.5 70 L45.5 50 C45.5 46.5 47.5 44.5 50 44.5 C52.5 44.5 54.5 46.5 54.5 50 L54.5 70 Z',
  daunKiri: 'M49 47.5 C43 47.5 21 45.5 14.5 30 C11.5 22.5 14.5 16.5 22.5 16.5 C37 16.5 51 30 49 47.5 Z',
  daunKanan: 'M51 47.5 C57 47.5 79 45.5 85.5 30 C88.5 22.5 85.5 16.5 77.5 16.5 C63 16.5 49 30 51 47.5 Z',
  kilapKiri: 'M20 23 C24 21 31 22 36 26',
  kilapKanan: 'M80 23 C76 21 69 22 64 26',
} as const;

export type BagianLogo = keyof typeof BAGIAN_LOGO;

interface Geser {
  x: number;
  y: number;
  putar: number;
  skala: number;
  o: number;
}

/**
 * `geser[bagian]` = simpangan dari posisi asli (0 semua = logo utuh persis).
 */
export const LogoAsli: React.FC<{ ukuran: number; geser?: Partial<Record<BagianLogo, Partial<Geser>>>; idPrefix?: string }> = ({
  ukuran,
  geser = {},
  idPrefix = 'logo',
}) => {
  const tf = (b: BagianLogo) => {
    const g = { x: 0, y: 0, putar: 0, skala: 1, o: 1, ...geser[b] };
    return { transform: `translate(${g.x} ${g.y}) rotate(${g.putar} 50 50) translate(50 50) scale(${g.skala}) translate(-50 -50)`, opacity: g.o };
  };
  const daun = `${idPrefix}-daun`;
  const tanah = `${idPrefix}-tanah`;
  return (
    <svg viewBox="0 0 100 100" width={ukuran} height={ukuran} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={daun} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9D85A" />
          <stop offset=".6" stopColor="#8CC63A" />
          <stop offset="1" stopColor="#76B42B" />
        </linearGradient>
        <linearGradient id={tanah} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#46507A" />
          <stop offset="1" stopColor="#2E3547" />
        </linearGradient>
      </defs>
      <g {...tf('tanah')}>
        <path d={BAGIAN_LOGO.tanah} stroke={`url(#${tanah})`} strokeWidth="9" strokeLinecap="round" fill="none" />
      </g>
      <g {...tf('batang')}>
        <path d={BAGIAN_LOGO.batang} fill={`url(#${daun})`} />
      </g>
      <g {...tf('daunKiri')}>
        <path d={BAGIAN_LOGO.daunKiri} fill={`url(#${daun})`} />
      </g>
      <g {...tf('daunKanan')}>
        <path d={BAGIAN_LOGO.daunKanan} fill={`url(#${daun})`} />
      </g>
      <g {...tf('kilapKiri')}>
        <path d={BAGIAN_LOGO.kilapKiri} stroke="#fff" strokeOpacity=".45" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>
      <g {...tf('kilapKanan')}>
        <path d={BAGIAN_LOGO.kilapKanan} stroke="#fff" strokeOpacity=".3" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};
