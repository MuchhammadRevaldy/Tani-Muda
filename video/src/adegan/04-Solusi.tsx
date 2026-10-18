import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonBukuTerbuka, IkonKalkulator, IkonGembor, IkonKeranjang } from '../ikon';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan04Solusi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Lingkaran siklus tergambar (frame 0 - 45)
  const rotasiTitik = (frame * 1.5) % 360;

  // 4 Pilar
  const pilarList = [
    { nama: 'Belajar', sub: 'Resep Teruji', Komp: IkonBukuTerbuka, x: 960, y: 250, delay: 20 },
    { nama: 'Hitung', sub: 'Modal & BEP', Komp: IkonKalkulator, x: 1380, y: 530, delay: 40 },
    { nama: 'Rawat', sub: 'SOP Harian', Komp: IkonGembor, x: 960, y: 810, delay: 60 },
    { nama: 'Jual', sub: 'Kontrak Pasti', Komp: IkonKeranjang, x: 540, y: 530, delay: 80 },
  ];

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
          top: 70,
          display: 'flex',
          gap: 16,
          zIndex: 20,
        }}
      >
        {['Empat', 'langkah', 'pasti', 'untuk', 'petani'].map((w, i) => {
          const sp = spring({
            frame: frame - (10 + i * 6),
            fps,
            config: { damping: 14, stiffness: 110 },
          });
          return (
            <span
              key={i}
              style={{
                fontSize: 48,
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

      {/* Lintasan Lingkaran Orbit SVG di Tengah */}
      <svg
        width="620"
        height="620"
        viewBox="0 0 620 620"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      >
        <circle
          cx="310"
          cy="310"
          r="260"
          fill="none"
          stroke="#e5ded2"
          strokeWidth="4"
          strokeDasharray="12 10"
        />

        {/* Titik Cahaya Beredar di Lintasan Orbit */}
        <g style={{ transform: `rotate(${rotasiTitik}deg)`, transformOrigin: '310px 310px' }}>
          <circle cx="310" cy="50" r="10" fill={TOKEN_WARNA.daunTerang} />
        </g>
      </svg>

      {/* Titik Inti di Tengah */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '3px solid #1b4332',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(27, 67, 50, 0.08)',
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: TOKEN_WARNA.daunTua }}>
          TANI MUDA
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: TOKEN_WARNA.emas }}>
          Siklus Pasti
        </div>
      </div>

      {/* 4 Pilar Mengelilingi Lingkaran */}
      {pilarList.map((p, idx) => {
        const sp = spring({
          frame: frame - p.delay,
          fps,
          config: { damping: 12, stiffness: 90 },
        });

        const Komp = p.Komp;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: p.y,
              left: p.x,
              transform: `translate(-50%, -50%) scale(${sp})`,
              opacity: sp,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '2px solid #1b4332',
              borderRadius: 20,
              padding: '16px 24px',
              minWidth: 160,
              boxShadow: '0 8px 20px rgba(27, 67, 50, 0.06)',
              zIndex: 15,
            }}
          >
            <div style={{ marginBottom: 6 }}>
              <Komp size={56} strokeWidth={4} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
              {p.nama}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TOKEN_WARNA.teksPudar }}>
              {p.sub}
            </div>
          </div>
        );
      })}

      {/* Subtitel Terbakar */}
      <SubtitelVideo teks="Siklus empat pilar terpadu: Belajar, Hitung, Rawat, dan Jual panen pasti." />
    </div>
  );
};
