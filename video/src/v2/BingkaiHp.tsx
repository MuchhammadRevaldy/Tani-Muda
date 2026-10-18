import React from 'react';
import { OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import penanda from '../data/penanda-rekaman.json';
import { antara, ayun, maju, pegas, EASE } from './gerak';
import { FPS, W } from './tema';

export type NamaRekaman = keyof typeof penanda;

/** Detik penanda langkah di rekaman (lihat scripts/rekam-hp.mjs). */
export function detikPenanda(rekaman: NamaRekaman, langkah: string, geser = 0): number {
  const r = penanda[rekaman];
  const l = r.langkah.find((x) => x.nama === langkah);
  if (!l) throw new Error(`Penanda ${rekaman}/${langkah} tidak ada`);
  return Math.min(r.durasi - 0.2, Math.max(0, l.detik + geser));
}

export interface Fokus {
  /** frame relatif shot */
  f: number;
  /** titik fokus di layar HP, 0..1 */
  x: number;
  y: number;
  zoom: number;
}

const TINGGI_LAYAR = 774;
const LEBAR_LAYAR = (TINGGI_LAYAR * 390) / 844;
const TEPI = 16;

/**
 * HP sederhana berisi rekaman layar sungguhan (390×844 @2x). Rekaman dari `dari`
 * sampai `sampai` detik diputar sepanjang `durasi` frame (laju disesuaikan).
 * Ukuran ±75% tinggi layar, miring 3D, dan terus bergerak pelan.
 */
export const BingkaiHp: React.FC<{
  rekaman: NamaRekaman;
  dari: number;
  sampai: number;
  durasi: number;
  x: number;
  y?: number;
  skala?: number;
  miring?: number;
  fokus?: Fokus[];
  masuk?: number;
}> = ({ rekaman, dari, sampai, durasi, x, y = 100, skala = 1, miring = -12, fokus = [], masuk = 0 }) => {
  const frame = useCurrentFrame();
  const laju = Math.max(0.25, Math.min(2.5, (sampai - dari) / (durasi / FPS)));
  const sp = pegas(frame, masuk, 'lembut');

  // fokus: interpolasi antar titik dengan easing
  let fx = 0.5;
  let fy = 0.5;
  let z = 1;
  if (fokus.length) {
    const sebelum = [...fokus].reverse().find((t) => t.f <= frame) ?? fokus[0];
    const sesudah = fokus.find((t) => t.f > frame);
    if (!sesudah || sebelum === sesudah) {
      ({ x: fx, y: fy, zoom: z } = sebelum);
    } else {
      const t = maju(frame, sebelum.f, sesudah.f - sebelum.f, EASE.halus);
      fx = antara(t, sebelum.x, sesudah.x);
      fy = antara(t, sebelum.y, sesudah.y);
      z = antara(t, sebelum.zoom, sesudah.zoom);
    }
  }
  const geserX = (0.5 - fx) * LEBAR_LAYAR * (z - 1);
  const geserY = (0.5 - fy) * TINGGI_LAYAR * (z - 1);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + ayun(frame, 0, 10, 110) + (1 - sp) * 500,
        width: LEBAR_LAYAR + TEPI * 2,
        height: TINGGI_LAYAR + TEPI * 2,
        transform: `perspective(2200px) rotateY(${miring + ayun(frame, 20, 3, 150)}deg) rotateX(${4 + ayun(frame, 60, 1.5, 170)}deg) scale(${skala})`,
        transformOrigin: '50% 50%',
        opacity: Math.min(1, sp * 1.5),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 64,
          background: '#1E2230',
          boxShadow: `0 40px 60px rgba(46,53,71,0.28), inset 0 0 0 3px #3A4258, ${miring < 0 ? '' : '-'}14px 0 0 #2A3040`,
        }}
      />
      <div style={{ position: 'absolute', left: TEPI, top: TEPI, width: LEBAR_LAYAR, height: TINGGI_LAYAR, borderRadius: 50, overflow: 'hidden', background: W.embun }}>
        <div style={{ width: '100%', height: '100%', transform: `translate(${geserX}px, ${geserY}px) scale(${z})`, transformOrigin: '50% 50%' }}>
          {/* Sequence dimulai lebih awal sebanyak dari/laju: waktu sumber = dari + frame × laju.
              (trimBefore ikut dikalikan playbackRate, jadi tidak dipakai.) */}
          <Sequence from={-Math.round((dari * FPS) / laju)} layout="none">
            <OffthreadVideo
              src={staticFile(penanda[rekaman].berkas)}
              playbackRate={laju}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Sequence>
        </div>
      </div>
      <div style={{ position: 'absolute', left: '50%', top: TEPI + 10, width: 90, height: 24, marginLeft: -45, borderRadius: 14, background: '#1E2230' }} />
    </div>
  );
};

export const UKURAN_HP = { lebar: LEBAR_LAYAR + TEPI * 2, tinggi: TINGGI_LAYAR + TEPI * 2 };

/** Elemen yang keluar dari layar HP ke samping: melesat dari titik asal lalu membesar. */
export const KeluarDariLayar: React.FC<{
  mulai: number;
  dari: { x: number; y: number };
  ke: { x: number; y: number };
  children: React.ReactNode;
}> = ({ mulai, dari, ke, children }) => {
  const frame = useCurrentFrame();
  const sp = pegas(frame, mulai, 'pantul');
  const x = antara(sp, dari.x, ke.x);
  const y = antara(sp, dari.y, ke.y) - Math.sin(Math.min(1, sp) * Math.PI) * 60;
  return (
    <div style={{ position: 'absolute', left: x, top: y + ayun(frame, mulai, 8, 80) * sp, transform: `translate(-50%, -50%) scale(${0.15 + Math.min(1.05, sp) * 0.85})`, opacity: Math.min(1, sp * 3) }}>
      {children}
    </div>
  );
};
