import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
  baris: string[];
  delayMulai?: number;
  jedaAntarBaris?: number;
  ukuran?: number;
  warnaUtama?: string;
  warnaSorot?: string;
  indeksSorot?: number[];
  style?: React.CSSProperties;
}

export const TipografiKinetik: React.FC<Props> = ({
  baris,
  delayMulai = 5,
  jedaAntarBaris = 8,
  ukuran = 64,
  warnaUtama = '#1b4332',
  warnaSorot = '#2d6a4f',
  indeksSorot = [],
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontFamily: "'Outfit', sans-serif",
        textAlign: 'center',
        ...style,
      }}
    >
      {baris.map((teks, idx) => {
        const delay = delayMulai + idx * jedaAntarBaris;
        const sp = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 100 },
        });

        const isSorot = indeksSorot.includes(idx);

        return (
          <div
            key={idx}
            style={{
              fontSize: ukuran,
              fontWeight: 800,
              lineHeight: 1.15,
              color: isSorot ? warnaSorot : warnaUtama,
              transform: `translateY(${(1 - sp) * 40}px)`,
              opacity: sp,
              letterSpacing: '-1px',
            }}
          >
            {teks}
          </div>
        );
      })}
    </div>
  );
};
