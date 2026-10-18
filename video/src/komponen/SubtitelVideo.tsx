import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { KalimatNarasi } from '../linimasa';

const MAKS_HURUF = 64;

/** Pecah kalimat panjang di koma atau titik dua, waktunya dibagi menurut panjang huruf. */
export function pecahSubtitel(kalimat: KalimatNarasi[]): KalimatNarasi[] {
  const hasil: KalimatNarasi[] = [];
  for (const k of kalimat) {
    if (k.teks.length <= MAKS_HURUF) {
      hasil.push(k);
      continue;
    }
    const bagian: string[] = [];
    let kini = '';
    for (const potong of k.teks.split(/(?<=[,:])\s+/)) {
      if (kini && (kini + ' ' + potong).length > MAKS_HURUF) {
        bagian.push(kini);
        kini = potong;
      } else {
        kini = kini ? `${kini} ${potong}` : potong;
      }
    }
    if (kini) bagian.push(kini);
    const totalHuruf = bagian.reduce((n, b) => n + b.length, 0);
    let t = k.mulai;
    for (const b of bagian) {
      const panjang = ((k.selesai - k.mulai) * b.length) / totalHuruf;
      hasil.push({ teks: b, mulai: t, selesai: t + panjang });
      t += panjang;
    }
  }
  return hasil;
}

/** Subtitel narasi dibakar ke video: teks putih bertepi gelap, tanpa kotak. */
export const SubtitelNarasi: React.FC<{ kalimat: KalimatNarasi[] }> = ({ kalimat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const daftar = pecahSubtitel(kalimat);
  // Tahan subtitel sampai kalimat berikutnya mulai (atau 0,4 dtk setelah selesai).
  const aktif = daftar.find((k, i) => {
    const batas = Math.min(daftar[i + 1]?.mulai ?? Infinity, k.selesai + 0.4);
    return t >= k.mulai - 0.05 && t < batas;
  });
  if (!aktif) return null;

  const masuk = interpolate(t, [aktif.mulai - 0.05, aktif.mulai + 0.12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: '50%',
        transform: `translateX(-50%) translateY(${(1 - masuk) * 8}px)`,
        opacity: masuk,
        textAlign: 'center',
        width: 1500,
        zIndex: 90,
        pointerEvents: 'none',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 42,
        fontWeight: 700,
        color: '#ffffff',
        lineHeight: 1.25,
        textShadow:
          '-2px -2px 0 #10281e, 2px -2px 0 #10281e, -2px 2px 0 #10281e, 2px 2px 0 #10281e, 0 3px 10px rgba(0,0,0,0.55)',
      }}
    >
      {aktif.teks}
    </div>
  );
};
