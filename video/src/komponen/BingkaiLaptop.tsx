import React from 'react';
import { Video, staticFile } from 'remotion';

interface Props {
  videoSrc?: string;
  children?: React.ReactNode;
  lebar?: number;
  tinggi?: number;
  className?: string;
}

export const BingkaiLaptop: React.FC<Props> = ({
  videoSrc,
  children,
  lebar = 1200,
  tinggi = 720,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.65))',
      }}
    >
      {/* Layar Atas & Bezel */}
      <div
        style={{
          width: lebar,
          height: tinggi,
          backgroundColor: '#0c0f12',
          borderRadius: '18px 18px 0 0',
          padding: '16px 16px 0 16px',
          boxSizing: 'border-box',
          border: '2px solid rgba(255, 255, 255, 0.12)',
          borderBottom: 'none',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Titik Kamera Web */}
        <div
          style={{
            position: 'absolute',
            top: 7,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#1e242b',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />

        {/* Layar Tampilan */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: '8px 8px 0 0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {videoSrc ? (
            <Video
              src={staticFile(videoSrc)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            children
          )}

          {/* Kilau Kaca Reflektif */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 60%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Badan Bawah Laptop (Bodi Aluminium) */}
      <div
        style={{
          width: lebar + 80,
          height: 22,
          backgroundColor: '#272d34',
          borderRadius: '0 0 14px 14px',
          position: 'relative',
          borderTop: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Lekukan Buka Tutup Layar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 90,
            height: 6,
            backgroundColor: '#1b2026',
            borderRadius: '0 0 6px 6px',
          }}
        />
      </div>
    </div>
  );
};
