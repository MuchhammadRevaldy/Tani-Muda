import React from 'react';
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

const LENCANA_LEVEL = [
  { nama: 'Benih', file: 'lencana/level-benih.svg', delay: 15 },
  { nama: 'Tunas', file: 'lencana/level-tunas.svg', delay: 35 },
  { nama: 'Daun', file: 'lencana/level-daun.svg', delay: 55 },
  { nama: 'Berbunga', file: 'lencana/level-berbunga.svg', delay: 75 },
  { nama: 'Panen Raya', file: 'lencana/level-panen-raya.svg', delay: 95 },
];

export const Adegan09Bertahan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: TOKEN_WARNA.latarKrem,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Teks Judul Kinetik Atas */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          display: 'flex',
          gap: 16,
        }}
      >
        {['Tumbuh', 'bersama', 'setiap', 'siklus'].map((w, i) => {
          const sp = spring({
            frame: frame - (10 + i * 8),
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          return (
            <span
              key={i}
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: i >= 2 ? TOKEN_WARNA.daunTerang : TOKEN_WARNA.daunTua,
                transform: `translateY(${(1 - sp) * 20}px)`,
                opacity: sp,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* Baris 5 Lencana Naik Berurutan */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 36,
          zIndex: 20,
        }}
      >
        {LENCANA_LEVEL.map((item, idx) => {
          const sp = spring({
            frame: frame - item.delay,
            fps,
            config: { damping: 10, stiffness: 110 },
          });

          // Percikan garis geometris sederhana saat mendarat
          const percik = interpolate(frame, [item.delay + 5, item.delay + 25], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Percikan Garis Geometris */}
              {percik > 0 && percik < 1 && (
                <svg
                  width="160"
                  height="160"
                  viewBox="0 0 160 160"
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: `translateX(-50%) scale(${percik})`,
                    opacity: 1 - percik,
                    pointerEvents: 'none',
                  }}
                >
                  <line x1="80" y1="20" x2="80" y2="5" stroke={TOKEN_WARNA.emas} strokeWidth="3" strokeLinecap="round" />
                  <line x1="140" y1="80" x2="155" y2="80" stroke={TOKEN_WARNA.emas} strokeWidth="3" strokeLinecap="round" />
                  <line x1="80" y1="140" x2="80" y2="155" stroke={TOKEN_WARNA.emas} strokeWidth="3" strokeLinecap="round" />
                  <line x1="20" y1="80" x2="5" y2="80" stroke={TOKEN_WARNA.emas} strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}

              {/* Lencana SVG Resmi */}
              <div
                style={{
                  transform: `scale(${sp}) translateY(${(1 - sp) * 80}px)`,
                  width: 140,
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  border: '2px solid #1b4332',
                  borderRadius: 24,
                  padding: 16,
                  boxShadow: '0 8px 24px rgba(27,67,50,0.06)',
                }}
              >
                <img
                  src={staticFile(item.file)}
                  alt={item.nama}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 20,
                  fontWeight: 800,
                  color: TOKEN_WARNA.daunTua,
                  opacity: sp,
                }}
              >
                {item.nama}
              </div>
            </div>
          );
        })}
      </div>

      {/* Keterangan Mode Luring / Offline di Bawah Tanpa Kotak */}
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          fontSize: 20,
          fontWeight: 600,
          color: TOKEN_WARNA.teksPudar,
        }}
      >
        Aplikasi tetap berjalan luring tanpa sinyal internet di tengah kebun
      </div>

      {/* Subtitel Terbakar */}
      <SubtitelVideo teks="Apresiasi nyata lewat poin level bertingkat dan keandalan sistem tanpa sinyal internet." />
    </div>
  );
};
