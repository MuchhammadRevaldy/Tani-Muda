import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonKeranjang, IkonKoin } from '../ikon';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan07Jual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Koin terbang melengkung ke tengah (frame 20 - 75)
  const xKoin = interpolate(frame, [20, 75], [420, 960], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const yKoin = interpolate(frame, [20, 48, 75], [520, 360, 520], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Gembok terkunci saat koin tiba di tengah (frame 75 - 130)
  const gembokTerkunci = frame >= 75 && frame < 150;

  // Koin cair ke petani (frame 150 - 200)
  const xKoinCair = interpolate(frame, [150, 195], [960, 1500], {
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
      {/* Teks Kinetik Atas */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <IkonKeranjang size={40} strokeWidth={4} />
          <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN_WARNA.daunTerang, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Pilar 04 · Jual
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Uang', 'muka', 'aman', 'pembeli', 'pasti'].map((w, i) => (
            <span
              key={i}
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: i >= 3 ? TOKEN_WARNA.daunTerang : TOKEN_WARNA.daunTua,
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Garis Pembagi Layar Halus di Tengah */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          bottom: 160,
          left: 960,
          width: 2,
          backgroundColor: '#e5ded2',
        }}
      />

      {/* SISI KIRI: Pembeli (Kafe / Resto) */}
      <div
        style={{
          position: 'absolute',
          left: 180,
          top: 360,
          width: 500,
          backgroundColor: '#ffffff',
          border: '2px solid #1b4332',
          borderRadius: 24,
          padding: '36px',
          boxShadow: '0 12px 28px rgba(27,67,50,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKEN_WARNA.emas, letterSpacing: '1.5px' }}>
          MITRA PEMBELI
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
          Katering Bu Ratna
        </div>
        <div style={{ fontSize: 18, color: TOKEN_WARNA.teksPudar, lineHeight: 1.4 }}>
          Pesan 50 kg sawi hijau dan setorkan uang muka komitmen 50% di awal tanam.
        </div>
      </div>

      {/* TENGAH: Dana Ditahan (Escrow Bersama) */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 520,
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ffffff',
          border: '3px solid #1b4332',
          borderRadius: 24,
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 12px 30px rgba(27,67,50,0.1)',
          zIndex: 20,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ marginBottom: 6 }}>
          <rect x="8" y="18" width="28" height="20" rx="4" fill="none" stroke={TOKEN_WARNA.daunTua} strokeWidth="3" />
          <path
            d={gembokTerkunci ? 'M 14 18 V 12 C 14 7.6 17.6 4 22 4 C 26.4 4 30 7.6 30 12 V 18' : 'M 14 18 V 12 C 14 7.6 17.6 4 22 4 C 26.4 4 30 7.6 30 12 V 8'}
            fill="none"
            stroke={TOKEN_WARNA.daunTerang}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div style={{ fontSize: 12, fontWeight: 800, color: TOKEN_WARNA.emas, letterSpacing: '1px' }}>
          REKENING BERSAMA
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
          {frame < 150 ? 'Dana Ditahan Aman' : 'Dana Dicairkan ✓'}
        </div>
      </div>

      {/* SISI KANAN: Petani Muda */}
      <div
        style={{
          position: 'absolute',
          right: 180,
          top: 360,
          width: 500,
          backgroundColor: '#ffffff',
          border: '2px solid #1b4332',
          borderRadius: 24,
          padding: '36px',
          boxShadow: '0 12px 28px rgba(27,67,50,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKEN_WARNA.daunTerang, letterSpacing: '1.5px' }}>
          PETANI PRODUSEN
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
          Arif Setiawan · Kebun Klaten
        </div>
        <div style={{ fontSize: 18, color: TOKEN_WARNA.teksPudar, lineHeight: 1.4 }}>
          Menerima pesanan pasti, merawat hingga panen segar, dan menerima pelunasan utuh.
        </div>
      </div>

      {/* Koin Bergerak Terbang */}
      <div
        style={{
          position: 'absolute',
          left: frame < 150 ? xKoin : xKoinCair,
          top: frame < 150 ? yKoin : 520,
          transform: 'translate(-50%, -50%)',
          zIndex: 40,
        }}
      >
        <IkonKoin size={64} strokeWidth={4} />
      </div>

      {/* Subtitel Terbakar */}
      <SubtitelVideo teks="Pembeli membayar uang muka di awal, dan dana cair ke petani saat panen terkonfirmasi." />
    </div>
  );
};
