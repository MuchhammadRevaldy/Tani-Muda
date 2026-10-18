import React from 'react';
import { evolvePath } from '@remotion/paths';

interface OpsiGaris {
  d: string;
  warna: string;
  tebal: number;
  progres?: number;
  isi?: string;
  opacity?: number;
  id?: string;
}

export function buatPath({
  d,
  warna,
  tebal,
  progres = 1,
  isi = 'none',
  opacity = 1,
  id,
}: OpsiGaris): React.ReactElement {
  let dashArray: string | undefined;
  let dashOffset: number | undefined;

  if (progres < 1 && d) {
    try {
      const evolusi = evolvePath(Math.max(0, Math.min(1, progres)), d);
      dashArray = evolusi.strokeDasharray;
      dashOffset = evolusi.strokeDashoffset;
    } catch {
      // Fallback bila path kompleks
    }
  }

  return (
    <path
      key={id || d}
      d={d}
      stroke={warna}
      strokeWidth={tebal}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={isi}
      strokeDasharray={dashArray}
      strokeDashoffset={dashOffset}
      opacity={opacity}
    />
  );
}
