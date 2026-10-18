import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BingkaiPerangkatDatar } from '../komponen/BingkaiPerangkatDatar';
import { IkonKoin, IkonKalkulator } from '../ikon';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan05Hitung: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Masuk dari bawah (frame 0 - 35)
  const spMasuk = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  // Kamera zoom perlahan ke angka modal (frame 40 - 150)
  const zoom = interpolate(frame, [40, 150], [1, 1.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panY = interpolate(frame, [40, 150], [0, -60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Angka modal terangkat keluar menjadi koin emas (frame 120 - 200)
  const koinAngkat = spring({
    frame: frame - 120,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  // Garis titik impas BEP memotong grafik (frame 150 - 220)
  const garisBEP = interpolate(frame, [150, 190], [0, 420], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: TOKEN_WARNA.latarKrem,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Teks Kinetik Bagian Atas */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <IkonKalkulator size={36} strokeWidth={4} />
          <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN_WARNA.daunTerang, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Pilar 02 · Hitung
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Kalkulasi', 'modal', 'dan', 'titik', 'impas'].map((w, i) => (
            <span
              key={i}
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: i >= 3 ? TOKEN_WARNA.daunTerang : TOKEN_WARNA.daunTua,
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Bingkai HP Datar Memutar Rekaman 04-hitung.webm */}
      <div
        style={{
          position: 'absolute',
          left: 360,
          top: 200,
          transform: `translateY(${(1 - spMasuk) * 450}px)`,
          zIndex: 20,
        }}
      >
        <BingkaiPerangkatDatar
          videoSrc="rekaman/04-hitung.webm"
          lebar={380}
          tinggi={740}
          skala={0.92}
          perbesaranLayar={zoom}
          geserY={panY}
          kursorPosisi={{ x: 190, y: 440, klik: frame > 70 && frame < 90 }}
        />
      </div>

      {/* Sisi Kanan: Koin Terangkat & Garis Titik Impas (BEP) */}
      <div
        style={{
          position: 'absolute',
          right: 220,
          top: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          zIndex: 25,
        }}
      >
        {/* Koin Emas Terangkat */}
        <div
          style={{
            transform: `translateY(${(1 - koinAngkat) * 80}px) scale(${koinAngkat})`,
            opacity: koinAngkat,
            backgroundColor: '#ffffff',
            border: '2px solid #1b4332',
            borderRadius: 20,
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            boxShadow: '0 12px 28px rgba(27,67,50,0.08)',
          }}
        >
          <IkonKoin size={64} strokeWidth={4} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TOKEN_WARNA.emas }}>
              RINCIAN MODAL
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
              Rp 185.000
            </div>
          </div>
        </div>

        {/* Garis Titik Impas (BEP) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #1b4332',
            borderRadius: 20,
            padding: '24px 32px',
            boxShadow: '0 12px 28px rgba(27,67,50,0.08)',
            position: 'relative',
            width: 440,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: TOKEN_WARNA.daunTerang }}>
            GARIS TITIK IMPAS (BEP)
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: TOKEN_WARNA.daunTua, marginBottom: 12 }}>
            14 kg Panen Terkunci
          </div>

          {/* Garis pemotong */}
          <div
            style={{
              height: 4,
              backgroundColor: TOKEN_WARNA.tomat,
              width: garisBEP,
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Subtitel Terbakar */}
      <SubtitelVideo teks="Menghitung kebutuhan modal bibit, nutrisi, dan titik impas secara transparan." />
    </div>
  );
};
