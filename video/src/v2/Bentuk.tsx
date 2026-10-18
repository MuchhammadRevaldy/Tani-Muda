import React from 'react';
import { evolvePath } from '@remotion/paths';

/**
 * Bentuk berisi warna yang bisa digambar bertahap: garis tepi digambar dengan
 * evolvePath, lalu isiannya muncul. `p` = 1 berarti sudah utuh.
 */
export const Jalur: React.FC<{
  d: string;
  isi?: string;
  garis?: string;
  tebal?: number;
  p?: number;
  opacity?: number;
}> = ({ d, isi = 'none', garis, tebal = 3, p = 1, opacity = 1 }) => {
  const tepi = Math.min(1, p * 1.6);
  const isian = Math.max(0, Math.min(1, (p - 0.4) / 0.6));
  let dash: { strokeDasharray?: string; strokeDashoffset?: number } = {};
  if (tepi < 1) {
    try {
      dash = evolvePath(tepi, d);
    } catch {
      dash = {};
    }
  }
  const warnaGaris = garis ?? (isi !== 'none' ? isi : '#2E3547');
  return (
    <g opacity={opacity}>
      {isi !== 'none' && <path d={d} fill={isi} opacity={isian} />}
      {(garis || p < 1) && (
        <path
          d={d}
          fill="none"
          stroke={warnaGaris}
          strokeWidth={tebal}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={garis ? 1 : 1 - isian}
          {...dash}
        />
      )}
    </g>
  );
};

/** Bayangan elips lembut di bawah objek. */
export const Bayang: React.FC<{ cx: number; cy: number; rx: number; ry?: number; o?: number }> = ({ cx, cy, rx, ry, o = 0.16 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx * 0.18} fill="#2E3547" opacity={o} />
);
