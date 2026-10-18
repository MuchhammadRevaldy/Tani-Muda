import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface Props {
  mulaiFrame: number;
  durasiFrame?: number;
  warna?: string;
  arah?: 'kiri-ke-kanan' | 'bawah-ke-atas';
}

export const SapuanTransisi: React.FC<Props> = ({
  mulaiFrame,
  durasiFrame = 18,
  warna = '#1b4332',
  arah = 'kiri-ke-kanan',
}) => {
  const frame = useCurrentFrame();
  const lokal = frame - mulaiFrame;

  if (lokal < 0 || lokal > durasiFrame) {
    return null;
  }

  const p = interpolate(lokal, [0, durasiFrame], [-100, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (arah === 'bawah-ke-atas') {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `translateY(${p}%)`,
          backgroundColor: warna,
          zIndex: 100,
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: `translateX(${p}%)`,
        backgroundColor: warna,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    />
  );
};
