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

/** Tinggi total HP ±75% layar; rekaman 390×844 tampil utuh di bawah bilah status. */
const TINGGI_HP = 806;
const TEPI = 13;
const STATUS = 30;
const TINGGI_VIDEO = TINGGI_HP - TEPI * 2 - STATUS;
const LEBAR_VIDEO = (TINGGI_VIDEO * 390) / 844;
const LEBAR_HP = LEBAR_VIDEO + TEPI * 2;
const TEBAL = 16;

/**
 * HP berisi rekaman layar sungguhan (390×844). Rekaman dari `dari` sampai `sampai`
 * detik diputar sepanjang `durasi` frame (laju disesuaikan) dan SELALU tampil utuh,
 * persis seukuran layar (tidak dipotong). HP menghadap serong dengan ketebalan bodi;
 * isi layar ikut miring bersama bingkainya. `fokus` tidak memperbesar isi layar,
 * melainkan mendekatkan HP sedikit ke kamera.
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

  // fokus → HP sedikit mendekat (bukan memotong isi layar)
  let z = 1;
  if (fokus.length) {
    const sebelum = [...fokus].reverse().find((t) => t.f <= frame) ?? fokus[0];
    const sesudah = fokus.find((t) => t.f > frame);
    z = !sesudah || sebelum === sesudah ? sebelum.zoom : antara(maju(frame, sebelum.f, sesudah.f - sebelum.f, EASE.halus), sebelum.zoom, sesudah.zoom);
  }
  const dekat = 1 + (z - 1) * 0.25;
  const sudut = miring + ayun(frame, 20, 3, 150);
  const radius = 58;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + ayun(frame, 0, 10, 110) + (1 - sp) * 500,
        width: LEBAR_HP,
        height: TINGGI_HP,
        transform: `perspective(2000px) rotateY(${sudut}deg) rotateX(${4 + ayun(frame, 60, 1.5, 170)}deg) scale(${skala * dekat})`,
        transformOrigin: '50% 50%',
        transformStyle: 'preserve-3d',
        opacity: Math.min(1, sp * 1.5),
      }}
    >
      {/* bodi belakang: memberi ketebalan saat HP serong */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: '#11141D', transform: `translateZ(-${TEBAL}px)`, boxShadow: '0 40px 60px rgba(46,53,71,0.3)' }} />
      {[0.25, 0.5, 0.75].map((t) => (
        <div key={t} style={{ position: 'absolute', inset: 0, borderRadius: radius, background: '#2A3040', transform: `translateZ(-${TEBAL * t}px)` }} />
      ))}
      {/* bodi depan */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: '#1E2230', boxShadow: 'inset 0 0 0 3px #3A4258' }} />
      {/* layar: bilah status + rekaman utuh */}
      <div style={{ position: 'absolute', left: TEPI, top: TEPI, width: LEBAR_VIDEO, height: TINGGI_VIDEO + STATUS, borderRadius: radius - TEPI, overflow: 'hidden', background: W.putih }}>
        <div style={{ height: STATUS, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: W.teks }}>
          <span>09.41</span>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[6, 9, 12].map((h) => (
              <span key={h} style={{ width: 3, height: h, borderRadius: 1, background: W.teks }} />
            ))}
            <span style={{ width: 20, height: 10, borderRadius: 3, border: `2px solid ${W.teks}`, marginLeft: 4 }} />
          </span>
        </div>
        <div style={{ position: 'relative', width: LEBAR_VIDEO, height: TINGGI_VIDEO }}>
          {/* Sequence dimulai lebih awal sebanyak dari/laju: waktu sumber = dari + frame × laju.
              (trimBefore ikut dikalikan playbackRate, jadi tidak dipakai.) */}
          <Sequence from={-Math.round((dari * FPS) / laju)} layout="none">
            <OffthreadVideo
              src={staticFile(penanda[rekaman].berkas)}
              playbackRate={laju}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </Sequence>
        </div>
      </div>
      {/* notch di bilah status */}
      <div style={{ position: 'absolute', left: '50%', top: TEPI + 6, width: 84, height: 20, marginLeft: -42, borderRadius: 12, background: '#1E2230' }} />
      {/* kilap kaca tipis */}
      <div style={{ position: 'absolute', left: TEPI, top: TEPI, width: LEBAR_VIDEO, height: TINGGI_VIDEO + STATUS, borderRadius: radius - TEPI, background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 32%)', pointerEvents: 'none' }} />
    </div>
  );
};

export const UKURAN_HP = { lebar: LEBAR_HP, tinggi: TINGGI_HP };

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
