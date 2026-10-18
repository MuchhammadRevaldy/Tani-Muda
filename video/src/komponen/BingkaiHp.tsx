import React from 'react';
import { Video, staticFile } from 'remotion';

interface Props {
  videoSrc?: string;
  children?: React.ReactNode;
  lebar?: number;
  tinggi?: number;
  skala?: number;
}

export const BingkaiHp: React.FC<Props> = ({
  videoSrc,
  children,
  lebar = 390,
  tinggi = 844,
  skala = 1,
}) => {
  return (
    <div
      style={{
        transform: `scale(${skala})`,
        transformOrigin: 'center center',
        filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.7))',
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Casing Telepon Luar */}
      <div
        style={{
          width: lebar + 24,
          height: tinggi + 24,
          backgroundColor: '#1c1f24',
          borderRadius: 48,
          padding: 12,
          boxSizing: 'border-box',
          border: '3px solid rgba(255, 255, 255, 0.18)',
          boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.3)',
          position: 'relative',
        }}
      >
        {/* Tombol Samping Kiri & Kanan */}
        <div
          style={{
            position: 'absolute',
            top: 110,
            left: -5,
            width: 4,
            height: 48,
            backgroundColor: '#30363d',
            borderRadius: '2px 0 0 2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 170,
            left: -5,
            width: 4,
            height: 48,
            backgroundColor: '#30363d',
            borderRadius: '2px 0 0 2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 140,
            right: -5,
            width: 4,
            height: 64,
            backgroundColor: '#30363d',
            borderRadius: '0 2px 2px 0',
          }}
        />

        {/* Layar Tampilan HP */}
        <div
          style={{
            width: lebar,
            height: tinggi,
            backgroundColor: '#000000',
            borderRadius: 36,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Dynamic Island / Notch */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 110,
              height: 28,
              backgroundColor: '#000000',
              borderRadius: 20,
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 10,
              boxSizing: 'border-box',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Kamera Depan */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#121820',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            />
          </div>

          {/* Konten Video atau Anak Komponen */}
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

          {/* Kilau Kaca Reflektif Diagonal */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 45%)',
              pointerEvents: 'none',
              zIndex: 25,
            }}
          />

          {/* Home Bar Indicator di Bawah */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 130,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 4,
              zIndex: 30,
            }}
          />
        </div>
      </div>
    </div>
  );
};
