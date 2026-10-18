import React from 'react';
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan10Penutup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spLogo = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const spTeks = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

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
      {/* Logo Merakit Diri */}
      <div
        style={{
          transform: `scale(${spLogo})`,
          width: 160,
          height: 160,
          borderRadius: 36,
          backgroundColor: '#ffffff',
          border: '3px solid #1b4332',
          padding: 24,
          boxShadow: '0 16px 36px rgba(27,67,50,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <img
          src={staticFile('logo/logo-tanda.svg')}
          alt="Tani Muda"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Tipografi Judul Besar */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: TOKEN_WARNA.daunTua,
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        TANI MUDA
      </div>

      {/* Slogan */}
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: TOKEN_WARNA.daunTerang,
          marginBottom: 40,
        }}
      >
        Tanam dengan pembeli yang pasti
      </div>

      {/* Identitas Peserta & Wilayah (Tanpa Kotak Kaca) */}
      <div
        style={{
          transform: `translateY(${(1 - spTeks) * 30}px)`,
          opacity: spTeks,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          borderTop: '2px solid #e5ded2',
          paddingTop: 24,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800, color: TOKEN_WARNA.daunTua }}>
          Karya Inovasi: Sandy
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: TOKEN_WARNA.tanah }}>
          Kabupaten Klaten, Jawa Tengah
        </div>
        <div style={{ fontSize: 16, color: TOKEN_WARNA.teksPudar, marginTop: 4 }}>
          Kemitraan Panen Terikat Menuju Indonesia Emas 2045
        </div>
      </div>

    </div>
  );
};
