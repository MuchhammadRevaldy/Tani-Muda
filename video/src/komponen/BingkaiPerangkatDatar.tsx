import React from 'react';
import { Video, staticFile } from 'remotion';

interface Props {
  videoSrc?: string;
  children?: React.ReactNode;
  lebar?: number;
  tinggi?: number;
  skala?: number;
  perbesaranLayar?: number;
  geserX?: number;
  geserY?: number;
  tipe?: 'ponsel' | 'layar-lebar';
  kursorPosisi?: { x: number; y: number; klik?: boolean };
}

export const BingkaiPerangkatDatar: React.FC<Props> = ({
  videoSrc,
  children,
  lebar = 380,
  tinggi = 780,
  skala = 1,
  perbesaranLayar = 1,
  geserX = 0,
  geserY = 0,
  tipe = 'ponsel',
  kursorPosisi,
}) => {
  const radius = tipe === 'ponsel' ? 32 : 16;
  const paddingTepi = tipe === 'ponsel' ? 10 : 8;

  return (
    <div
      style={{
        transform: `scale(${skala})`,
        transformOrigin: 'center center',
        display: 'inline-block',
        position: 'relative',
        filter: 'drop-shadow(0 16px 36px rgba(27, 67, 50, 0.12))',
      }}
    >
      {/* Rangka Bodi Datar */}
      <div
        style={{
          width: lebar + paddingTepi * 2,
          height: tinggi + paddingTepi * 2,
          backgroundColor: '#ffffff',
          border: '3px solid #1b4332',
          borderRadius: radius,
          padding: paddingTepi,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Notch / Speaker Minimal */}
        {tipe === 'ponsel' && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 80,
              height: 18,
              backgroundColor: '#1b4332',
              borderRadius: 10,
              zIndex: 30,
            }}
          />
        )}

        {/* Layar Tampilan */}
        <div
          style={{
            width: lebar,
            height: tinggi,
            borderRadius: radius - 8,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Konten dengan Efek Kamera Zoom & Pan */}
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${perbesaranLayar}) translate(${geserX}px, ${geserY}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
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
          </div>

          {/* Kursor Penunjuk dengan Lingkaran Klik */}
          {kursorPosisi && (
            <div
              style={{
                position: 'absolute',
                left: kursorPosisi.x,
                top: kursorPosisi.y,
                pointerEvents: 'none',
                zIndex: 40,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: kursorPosisi.klik ? '#c59b27' : '#52b788',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              />
              {kursorPosisi.klik && (
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '2px solid #52b788',
                    opacity: 0.8,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
