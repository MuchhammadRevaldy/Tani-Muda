import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WARNA } from '../konfigurasi';

export const AdeganPenutup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const skalaLogo = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const opasitasTeks = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const kilau = (Math.sin(frame / 12) + 1) / 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: WARNA.latarGelap,
        backgroundImage:
          'radial-gradient(circle at 50% 45%, rgba(45, 106, 79, 0.45) 0%, rgba(8, 28, 21, 0.98) 75%)',
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
      {/* Efek Cahaya Latar Lingkaran */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(82, 183, 136, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo & Ikon Besar */}
      <div
        style={{
          transform: `scale(${skalaLogo})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 67, 50, 0.9)',
            border: '3px solid rgba(82, 183, 136, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 60px rgba(82, 183, 136, 0.4)',
            fontSize: 70,
            marginBottom: 16,
          }}
        >
          🌱
        </div>

        <div
          style={{
            fontSize: 72,
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

        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: WARNA.emas,
            letterSpacing: '0.5px',
            marginTop: 6,
          }}
        >
          Tanam dengan Pembeli yang Pasti
        </div>
      </div>

      {/* Kartu Profil Peserta & Inovasi */}
      <div
        style={{
          opacity: opasitasTeks,
          backgroundColor: 'rgba(18, 48, 36, 0.85)',
          border: '1.5px solid rgba(82, 183, 136, 0.35)',
          borderRadius: 24,
          padding: '24px 44px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          marginTop: 10,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#74c69d', letterSpacing: '1.5px' }}>
          KARYA INOVASI
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>
          Sandy
        </div>
        <div style={{ fontSize: 18, color: '#d8f3dc', fontWeight: 500 }}>
          📍 Kabupaten Klaten, Jawa Tengah
        </div>
        <div
          style={{
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: 6,
            textAlign: 'center',
          }}
        >
          Kemitraan Panen Terikat · Agrikultur Presisi · Menuju Indonesia Emas 2045
        </div>
      </div>
    </div>
  );
};
