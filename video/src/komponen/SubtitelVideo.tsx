import React from 'react';

interface Props {
  teks: string;
}

export const SubtitelVideo: React.FC<Props> = ({ teks }) => {
  if (!teks) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 54,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        maxWidth: 1400,
        width: '90%',
        zIndex: 90,
        pointerEvents: 'none',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 32,
        fontWeight: 700,
        color: '#ffffff',
        lineHeight: 1.3,
        letterSpacing: '0.5px',
        textShadow:
          '-2px -2px 0 #1b4332, 2px -2px 0 #1b4332, -2px 2px 0 #1b4332, 2px 2px 0 #1b4332, 0 3px 8px rgba(0,0,0,0.6)',
      }}
    >
      {teks}
    </div>
  );
};
