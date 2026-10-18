import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BingkaiPerangkatDatar } from '../komponen/BingkaiPerangkatDatar';
import { IkonCentang, IkonGembor } from '../ikon';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan06Rawat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spMasuk = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  // Jarum pH bergerak dari 0 ke 6.2 (sudut rotasi -60 ke 25 derajat)
  const rotasiJarum = interpolate(frame, [45, 120], [-60, 20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Centang tugas tergambar (frame 60 - 95)
  const centangProgres = interpolate(frame, [60, 95], [0, 1], {
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
          <IkonGembor size={36} strokeWidth={4.5} />
          <span style={{ fontSize: 16, fontWeight: 800, color: TOKEN_WARNA.daunTerang, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Pilar 03 · Rawat
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Jadwal', 'harian', 'dan', 'nutrisi', 'terukur'].map((w, i) => (
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

      {/* Bingkai HP Datar Memutar 05-rawat.webm */}
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
          videoSrc="rekaman/05-rawat.webm"
          lebar={380}
          tinggi={740}
          skala={0.92}
          perbesaranLayar={1.1}
          geserY={-20}
          kursorPosisi={{ x: 200, y: 380, klik: frame > 60 && frame < 85 }}
        />
      </div>

      {/* Sisi Kanan: Panel Gauge pH Meter & Centang Tugas */}
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
        {/* Indikator Jarum Sensor pH Air */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #1b4332',
            borderRadius: 20,
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            boxShadow: '0 12px 28px rgba(27,67,50,0.08)',
            width: 440,
          }}
        >
          {/* Jarum Busur Gauge */}
          <div style={{ position: 'relative', width: 90, height: 60 }}>
            <svg width="90" height="60" viewBox="0 0 90 60">
              <path
                d="M 10 50 A 35 35 0 0 1 80 50"
                fill="none"
                stroke="#e5ded2"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 35 35 0 0 1 55 18"
                fill="none"
                stroke={TOKEN_WARNA.daunTerang}
                strokeWidth="6"
                strokeLinecap="round"
              />
              <g style={{ transform: `rotate(${rotasiJarum}deg)`, transformOrigin: '45px 50px' }}>
                <line x1="45" y1="50" x2="45" y2="18" stroke={TOKEN_WARNA.daunTua} strokeWidth="4" strokeLinecap="round" />
                <circle cx="45" cy="50" r="4" fill={TOKEN_WARNA.daunTua} />
              </g>
            </svg>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TOKEN_WARNA.teksPudar }}>
              CEK pH AIR · KERTAS pH
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
              pH 6,2 · sesuai
            </div>
            <div style={{ fontSize: 13, color: TOKEN_WARNA.daunTerang, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IkonCentang size={18} warnaUtama={TOKEN_WARNA.daunTerang} />
              Masih dalam kisaran aman
            </div>
          </div>
        </div>

        {/* Centang Tugas Tergambar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #1b4332',
            borderRadius: 20,
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            boxShadow: '0 12px 28px rgba(27,67,50,0.08)',
            width: 440,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#e5ded2" strokeWidth="3" />
            <path
              d="M 14 24 L 21 31 L 34 17"
              fill="none"
              stroke={TOKEN_WARNA.daunTerang}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={30}
              strokeDashoffset={30 * (1 - centangProgres)}
            />
          </svg>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TOKEN_WARNA.teksPudar }}>
              SOP HARI KE-13
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: TOKEN_WARNA.daunTua }}>
              Cek kepekatan nutrisi PPM
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
