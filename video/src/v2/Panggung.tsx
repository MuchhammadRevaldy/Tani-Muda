import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { acak, ayun, kamera as hitungKamera, pegas, type Kamera } from './gerak';
import { IkonTani, type NamaIkonTani } from './IkonTani';
import { Latar, type JenisLatar } from './Latar';
import type { Shot } from './linimasa';
import { HURUF, W } from './tema';

// ---------------------------------------------------------------- aksen melayang

/** Tempat ikon aksen di pinggir layar (tengah dibiarkan untuk objek utama). */
const SLOT = [
  { x: 110, y: 170 },
  { x: 300, y: 420 },
  { x: 130, y: 690 },
  { x: 1800, y: 190 },
  { x: 1640, y: 450 },
  { x: 1790, y: 720 },
  { x: 560, y: 120 },
  { x: 1370, y: 110 },
  { x: 470, y: 880 },
  { x: 1480, y: 900 },
];

export const AksenMelayang: React.FC<{ ikon: NamaIkonTani[]; k: Kamera; muncul?: number }> = ({ ikon, k, muncul = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {ikon.map((nama, i) => {
        const slot = SLOT[i % SLOT.length];
        const dalam = 0.5 + acak(i + 17) * 0.9; // 0,5–1,4: makin besar makin dekat
        const ukuran = 64 + dalam * 64;
        const sp = pegas(frame, muncul + i * 3, 'pantul');
        const x = slot.x - k.x * dalam * 0.9;
        const y = slot.y - k.y * dalam * 0.9 + ayun(frame, i * 23, 12 + dalam * 8, 70 + i * 9);
        const putar = ayun(frame, i * 31, 10, 120 + i * 11);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - ukuran / 2,
              top: y - ukuran / 2,
              transform: `scale(${sp}) rotate(${putar}deg)`,
              opacity: 0.55 + dalam * 0.3,
              filter: dalam < 0.75 ? 'blur(1.5px)' : undefined,
            }}
          >
            <IkonTani nama={nama} ukuran={ukuran} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- judul per kata

export interface KataJudul {
  teks: string;
  f: number;
  warna?: string;
}

/**
 * Susun kata judul dengan waktu dari ucapan: kata judul yang sama dengan kata yang
 * diucapkan muncul saat kata itu diucapkan; selebihnya berurutan.
 */
export function kataJudul(shot: Shot, frasa: string, sorot: string[] = [], jeda = 5): KataJudul[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let terakhir = Math.max(0, shot.ucapMulai - 4);
  return frasa.split(' ').map((teks) => {
    const cocok = shot.kata.find((w) => norm(w.teks) === norm(teks) && w.f >= terakhir - 2);
    const f = cocok ? cocok.f : terakhir + jeda;
    terakhir = f;
    return { teks, f, warna: sorot.includes(teks) ? W.oranye : undefined };
  });
}

export const JudulKata: React.FC<{
  kata: KataJudul[];
  top?: number;
  ukuran?: number;
  warna?: string;
  rata?: 'center' | 'left';
  left?: number;
  lebar?: number;
}> = ({ kata, top = 90, ukuran = 84, warna = W.teks, rata = 'center', left, lebar = 1700 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: left ?? (1920 - lebar) / 2,
        width: lebar,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: rata === 'center' ? 'center' : 'flex-start',
        columnGap: ukuran * 0.28,
        rowGap: 4,
        fontFamily: HURUF,
        fontWeight: 800,
        fontSize: ukuran,
        lineHeight: 1.08,
        letterSpacing: '-0.01em',
      }}
    >
      {kata.map((w, i) => {
        const sp = pegas(frame, w.f - 3, i % 2 ? 'pantul' : 'cepat');
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: w.warna ?? warna,
              opacity: Math.min(1, sp * 1.4),
              transform: `translateY(${(1 - sp) * 40}px) rotate(${(1 - sp) * (i % 2 ? 6 : -6)}deg)`,
              textShadow: '0 3px 0 rgba(255,255,255,0.65)',
            }}
          >
            {w.teks}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- panggung

export interface AturKamera {
  dari?: Partial<Kamera>;
  ke?: Partial<Kamera>;
}

export const Panggung: React.FC<{
  shot: Shot;
  latar: JenisLatar;
  kamera?: AturKamera;
  aksen?: NamaIkonTani[];
  hujan?: number;
  senja?: number;
  horizon?: number;
  children?: (k: Kamera) => React.ReactNode;
  atas?: React.ReactNode;
}> = ({ shot, latar, kamera = {}, aksen = ['daun', 'koin', 'tetes', 'benih', 'sawi', 'matahari'], hujan, senja, horizon, children, atas }) => {
  const frame = useCurrentFrame();
  const k = hitungKamera(frame, shot.durasiFrame, kamera.dari ?? { zoom: 1.04 }, kamera.ke ?? { zoom: 1.1, x: 30 });
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: W.langit, fontFamily: HURUF }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + (k.zoom - 1) * 0.35})`, transformOrigin: '50% 60%' }}>
        <Latar jenis={latar} kamera={k} hujan={hujan} senja={senja} horizon={horizon} />
      </div>
      <AksenMelayang ikon={aksen} k={k} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${-k.x * 0.7}px, ${-k.y * 0.7}px) scale(${k.zoom}) rotate(${k.putar}deg)`,
          transformOrigin: '50% 55%',
        }}
      >
        {children?.(k)}
      </div>
      {atas}
    </AbsoluteFill>
  );
};
