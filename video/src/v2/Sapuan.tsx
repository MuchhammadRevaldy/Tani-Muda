import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { EASE } from './gerak';
import { W } from './tema';

/**
 * Transisi antaradegan: tiga lapis bukit menyapu dari bawah ke atas lalu keluar
 * ke atas. Komponen ini diletakkan di Sequence sepanjang `durasi` frame dengan
 * titik potong di tengah.
 */
export const SapuanBukit: React.FC<{ durasi: number; varian?: number }> = ({ durasi, varian = 0 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, durasi], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.tajam });
  const warna = varian % 2 ? [W.limauTerang, W.limau, W.daun] : [W.bukitJauh, W.bukitTengah, W.limauTekan];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {warna.map((w, i) => {
          const tunda = i * 0.07;
          const tt = Math.max(0, Math.min(1, (t - tunda) / (1 - 0.14)));
          // naik dari bawah (y 1300) sampai menutup (y -200), lalu bagian bawahnya naik keluar
          const atas = interpolate(tt, [0, 0.5, 1], [1300, -260, -1500]);
          const bawah = interpolate(tt, [0, 0.5, 1], [2600, 1400, -260]);
          const g = 90 + i * 30;
          return (
            <path
              key={i}
              d={`M-100 ${atas + g} C 300 ${atas - g}, 700 ${atas + g * 1.2}, 1000 ${atas} S 1700 ${atas - g}, 2020 ${atas + g * 0.6} L2020 ${bawah} L-100 ${bawah} Z`}
              fill={w}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
