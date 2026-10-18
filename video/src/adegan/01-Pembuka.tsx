import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WARNA } from '../konfigurasi';

export const AdeganPembuka: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi tunas bertumbuh
  const skalaTunas = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const rotasiDaun = interpolate(frame, [0, 90], [-15, 0], {
    extrapolateRight: 'clamp',
  });

  // Teks judul muncul bertahap
  const opasitasJudul = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const geserJudul = interpolate(frame, [30, 60], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tagline & Subjudul
  const opasitasTagline = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const kilauCahaya = (Math.sin(frame / 15) + 1) / 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: WARNA.latarGelap,
        backgroundImage: `radial-gradient(circle at 50% 40%, rgba(45, 106, 79, 0.45) 0%, rgba(8, 28, 21, 0.95) 75%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Efek Partikel Cahaya Latar */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82, 183, 136, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Maskot Tunas Bertumbuh (SVG Asli Tani Muda) */}
      <div
        style={{
          transform: `scale(${skalaTunas})`,
          marginBottom: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 100 100" fill="none">
          {/* Tanah & Benih */}
          <ellipse cx="50" cy="85" rx="35" ry="8" fill="#1b4332" opacity="0.6" />
          <path
            d="M 50 82 C 45 82 42 75 46 70 C 50 65 54 70 54 75 C 54 79 53 82 50 82 Z"
            fill="#d4a373"
          />

          {/* Batang Tunas */}
          <path
            d="M 50 75 Q 49 55 50 38"
            stroke="#52b788"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Daun Kiri Bertumbuh */}
          <path
            d="M 50 50 C 35 48 24 38 28 26 C 36 24 46 36 50 50 Z"
            fill="#40916c"
            style={{
              transformOrigin: '50px 50px',
              transform: `rotate(${rotasiDaun}deg)`,
            }}
          />

          {/* Daun Kanan Berkilau */}
          <path
            d="M 50 42 C 65 40 76 30 72 18 C 64 16 54 28 50 42 Z"
            fill="#52b788"
            style={{
              transformOrigin: '50px 42px',
              transform: `rotate(${-rotasiDaun}deg)`,
            }}
          />

          {/* Kilau Pucuk */}
          <circle cx="50" cy="36" r="4" fill="#e9c46a" opacity={kilauCahaya} />
        </svg>

        {/* Cincin Gelombang Tumbuh */}
        <div
          style={{
            position: 'absolute',
            bottom: 5,
            width: 120,
            height: 24,
            borderRadius: '50%',
            border: '2px solid rgba(82, 183, 136, 0.4)',
            transform: `scale(${interpolate(frame, [0, 45], [0.5, 1.8], { extrapolateRight: 'clamp' })})`,
            opacity: interpolate(frame, [0, 45], [0.8, 0], { extrapolateRight: 'clamp' }),
          }}
        />
      </div>

      {/* Judul Utama */}
      <div
        style={{
          opacity: opasitasJudul,
          transform: `translateY(${geserJudul}px)`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: '-1.5px',
            background: 'linear-gradient(135deg, #ffffff 40%, #74c69d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          TANI MUDA
        </div>

        {/* Tagline Ikonis */}
        <div
          style={{
            opacity: opasitasTagline,
            fontSize: 32,
            fontWeight: 600,
            color: WARNA.emas,
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>🌱</span>
          <span>Tanam dengan Pembeli yang Pasti</span>
          <span>🌱</span>
        </div>

        {/* Badge Deskripsi Inovasi */}
        <div
          style={{
            marginTop: 24,
            opacity: opasitasTagline,
            backgroundColor: 'rgba(45, 106, 79, 0.4)',
            border: '1px solid rgba(82, 183, 136, 0.35)',
            padding: '10px 24px',
            borderRadius: 30,
            fontSize: 20,
            fontWeight: 500,
            color: '#d8f3dc',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          }}
        >
          Platform Agrikultur Presisi & Kemitraan Panen Generasi Muda
        </div>
      </div>
    </div>
  );
};
