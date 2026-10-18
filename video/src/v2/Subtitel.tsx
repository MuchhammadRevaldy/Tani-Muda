import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { KALIMAT } from './linimasa';
import { FPS, HURUF } from './tema';

const MAKS_HURUF = 62;

interface Potong {
  teks: string;
  mulai: number;
  selesai: number;
}

/** Kalimat panjang dipecah di koma/titik dua; waktunya dari waktu kata yang diucapkan. */
function potongan(): Potong[] {
  const hasil: Potong[] = [];
  for (const k of KALIMAT) {
    if (k.teks.length <= MAKS_HURUF) {
      hasil.push({ teks: k.teks, mulai: k.mulai, selesai: k.selesai });
      continue;
    }
    const kata = k.teks.split(' ');
    let awal = 0;
    let kini: string[] = [];
    kata.forEach((w, i) => {
      kini.push(w);
      const panjang = kini.join(' ').length;
      const akhirFrasa = /[,:]$/.test(w) && panjang > 22;
      if (akhirFrasa || i === kata.length - 1 || panjang > MAKS_HURUF - 8) {
        const mulai = k.kata[awal]?.mulai ?? k.mulai;
        const selesai = k.kata[i + 1]?.mulai ?? k.selesai;
        hasil.push({ teks: kini.join(' '), mulai, selesai });
        awal = i + 1;
        kini = [];
      }
    });
  }
  return hasil;
}

const DAFTAR = potongan();

/** Subtitel narasi di sepertiga bawah: putih bertepi gelap, tanpa kotak. */
export const SubtitelNarasi: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const aktif = DAFTAR.find((k, i) => t >= k.mulai - 0.05 && t < Math.min(DAFTAR[i + 1]?.mulai ?? Infinity, k.selesai + 0.5));
  if (!aktif) return null;
  const masuk = interpolate(t, [aktif.mulai - 0.05, aktif.mulai + 0.12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 62,
        left: 160,
        width: 1600,
        textAlign: 'center',
        fontFamily: HURUF,
        fontSize: 44,
        fontWeight: 700,
        lineHeight: 1.25,
        color: '#ffffff',
        opacity: masuk,
        transform: `translateY(${(1 - masuk) * 8}px)`,
        textShadow:
          '-2.5px -2.5px 0 #1D2433, 2.5px -2.5px 0 #1D2433, -2.5px 2.5px 0 #1D2433, 2.5px 2.5px 0 #1D2433, 0 0 3px #1D2433, 0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 100,
      }}
    >
      {aktif.teks}
    </div>
  );
};
