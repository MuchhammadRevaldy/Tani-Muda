import React from 'react';
import { Bayang, Jalur } from '../Bentuk';
import { W } from '../tema';

/** Gundukan tanah dengan rumput; kotak 600×220. */
export const GundukTanah: React.FC<{ lebar?: number; p?: number }> = ({ lebar = 600, p = 1 }) => (
  <svg viewBox="0 0 600 220" width={lebar} height={(lebar * 220) / 600} style={{ overflow: 'visible' }}>
    <Bayang cx={300} cy={206} rx={290} ry={18} />
    <Jalur p={p} d="M10 200 C60 70 200 30 300 30 C400 30 540 70 590 200 Z" isi={W.tanahBedeng} />
    <Jalur p={p} d="M300 30 C400 30 540 70 590 200 L420 200 C440 130 390 60 300 30 Z" isi="rgba(0,0,0,0.14)" />
    <Jalur p={p} d="M60 150 C120 120 170 116 220 120" garis={W.tanahBedengTerang} tebal={8} />
    <Jalur p={p} d="M340 90 C380 92 420 104 450 124" garis={W.tanahBedengTerang} tebal={8} />
    {[70, 160, 250, 360, 470, 540].map((x, i) => (
      <Jalur key={i} p={p} d={`M${x} ${190 - (i % 3) * 30} q4 -26 14 -36 M${x + 8} ${190 - (i % 3) * 30} q0 -20 -10 -30`} garis={W.limauTekan} tebal={6} />
    ))}
  </svg>
);

/** Tumpukan koin tampak samping; `n` keping, `muncul` 0..1 jumlah yang sudah jatuh. */
export const TumpukKoin: React.FC<{ n?: number; lebar?: number; muncul?: number }> = ({ n = 6, lebar = 260, muncul = 1 }) => {
  const tampak = Math.round(n * muncul);
  return (
    <svg viewBox="0 0 260 300" width={lebar} height={(lebar * 300) / 260} style={{ overflow: 'visible' }}>
      <Bayang cx={130} cy={290} rx={120} ry={16} />
      {Array.from({ length: tampak }, (_, i) => {
        const y = 262 - i * 34;
        const dx = Math.sin(i * 1.9) * 8;
        return (
          <g key={i} transform={`translate(${dx} 0)`}>
            <path d={`M20 ${y} L20 ${y + 22} A110 22 0 0 0 240 ${y + 22} L240 ${y} Z`} fill={W.emasGelap} />
            <ellipse cx="130" cy={y} rx="110" ry="22" fill={W.emas} />
            <ellipse cx="130" cy={y} rx="78" ry="14" fill="none" stroke={W.emasGelap} strokeWidth="4" />
            <path d={`M70 ${y - 8} C90 ${y - 16} 120 ${y - 18} 150 ${y - 16}`} stroke={W.matahariLembut} strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/** Tanaman yang tumbuh dari benih sampai berbuah; `tahap` 0..1. Kotak 400×600, tanah di y=560. */
export const TanamanTumbuh: React.FC<{ tahap: number; lebar?: number }> = ({ tahap, lebar = 400 }) => {
  const t = Math.max(0, Math.min(1, tahap));
  const tinggiBatang = 20 + t * 380;
  const daun = Math.floor(t * 8);
  const buah = Math.max(0, (t - 0.75) / 0.25);
  return (
    <svg viewBox="0 0 400 600" width={lebar} height={(lebar * 600) / 400} style={{ overflow: 'visible' }}>
      <Bayang cx={200} cy={572} rx={150} ry={18} />
      <path d="M40 560 C100 520 300 520 360 560 L360 580 L40 580 Z" fill={W.tanahBedeng} />
      {t < 0.08 && <ellipse cx="200" cy="552" rx="18" ry="12" fill={W.kayu} />}
      <path d={`M200 560 C ${196} ${560 - tinggiBatang * 0.5} ${206} ${560 - tinggiBatang * 0.8} 200 ${560 - tinggiBatang}`} stroke={W.limauTekan} strokeWidth={10 + t * 6} fill="none" strokeLinecap="round" />
      {Array.from({ length: daun }, (_, i) => {
        const y = 540 - (i + 1) * (tinggiBatang / 9);
        const kiri = i % 2 === 0;
        const s = 0.6 + Math.min(1, (t * 8 - i) * 0.6) * 0.8;
        return (
          <g key={i} transform={`translate(200 ${y}) scale(${kiri ? -s : s} ${s})`}>
            <path d="M0 0 C30 -40 90 -46 120 -20 C90 0 40 16 0 0 Z" fill={i % 3 === 0 ? W.limauTekan : W.limau} />
            <path d="M4 -2 C40 -20 80 -26 116 -20" stroke={W.daunLembut} strokeWidth="3" fill="none" />
          </g>
        );
      })}
      {buah > 0 &&
        [
          [150, 560 - tinggiBatang * 0.55],
          [254, 560 - tinggiBatang * 0.7],
          [176, 560 - tinggiBatang * 0.85],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${Math.min(1, buah * 1.4 - i * 0.15)})`}>
            <circle r="26" fill={W.tomat} />
            <path d="M-10 -22 L0 -30 L10 -22 L0 -18 Z" fill={W.limauTekan} />
            <path d="M-12 -8 C-10 -14 -6 -18 0 -20" stroke="#F7A1A3" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        ))}
    </svg>
  );
};

/** Tanda tanya besar yang digambar; kotak 200×300. */
export const TandaTanya: React.FC<{ p?: number; tinggi?: number; warna?: string }> = ({ p = 1, tinggi = 300, warna = W.oranye }) => (
  <svg viewBox="0 0 200 300" width={(tinggi * 2) / 3} height={tinggi} style={{ overflow: 'visible' }}>
    <Jalur p={p} d="M40 90 C40 40 76 16 108 16 C148 16 170 44 170 78 C170 124 112 132 112 182 L112 200" garis={warna} tebal={34} />
    <Jalur p={Math.max(0, p * 2 - 1)} d="M112 252 A20 20 0 1 0 112.1 252 Z" isi={warna} />
  </svg>
);
