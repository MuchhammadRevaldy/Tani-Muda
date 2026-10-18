import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WARNA } from '../konfigurasi';

export const AdeganSolusi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi rotasi halus cincin penghubung
  const rotasiAlur = (frame * 0.8) % 360;

  const pilarList = [
    {
      nomor: '01',
      nama: 'BELAJAR',
      ikon: '📚',
      sub: 'Resep Tani Teruji',
      keterangan: 'Panduan SOP budidaya, modul interaktif, dan takaran standar dari mentor ahli.',
      warna: '#52b788',
      pos: { top: '12%', left: '50%', tx: '-50%', ty: '0%' },
      delay: 15,
    },
    {
      nomor: '02',
      nama: 'HITUNG',
      ikon: '🧮',
      sub: 'Simulasi Modal & BEP',
      keterangan: 'Kalkulasi bibit, nutrisi, titik impas (BEP), serta potensi laba sebelum menanam.',
      warna: '#e9c46a',
      pos: { top: '50%', right: '10%', tx: '0%', ty: '-50%' },
      delay: 35,
    },
    {
      nomor: '03',
      nama: 'RAWAT',
      ikon: '🌱',
      sub: 'Jadwal Presisi & Sensor',
      keterangan: 'Penggaris umur tanaman, tugas otomatis, sensor pH & PPM, serta deteksi gejala AI.',
      warna: '#74c69d',
      pos: { bottom: '12%', left: '50%', tx: '-50%', ty: '0%' },
      delay: 55,
    },
    {
      nomor: '04',
      nama: 'JUAL',
      ikon: '🤝',
      sub: 'Kontrak Panen & DP',
      keterangan: 'Kemitraan terikat sejak awal, uang muka terjamin, dan distribusi hasil panen.',
      warna: '#f4a261',
      pos: { top: '50%', left: '10%', tx: '0%', ty: '-50%' },
      delay: 75,
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: WARNA.latarGelap,
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(45, 106, 79, 0.35) 0%, rgba(8, 28, 21, 0.98) 75%)`,
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
      {/* Judul Atas */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '2px',
            color: WARNA.emas,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Solusi Terintegrasi Tani Muda
        </div>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Siklus 4 Pilar: Tanam dengan Kepastian
        </div>
      </div>

      {/* Cincin Alur Melingkar SVG di Tengah */}
      <div
        style={{
          position: 'relative',
          width: 620,
          height: 620,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="620"
          height="620"
          viewBox="0 0 620 620"
          style={{
            position: 'absolute',
            transform: `rotate(${rotasiAlur}deg)`,
            pointerEvents: 'none',
          }}
        >
          <circle
            cx="310"
            cy="310"
            r="260"
            fill="none"
            stroke="rgba(82, 183, 136, 0.2)"
            strokeWidth="3"
            strokeDasharray="16 12"
          />
          {/* Partikel Bercahaya pada Orbit */}
          <circle cx="310" cy="50" r="8" fill="#52b788" filter="drop-shadow(0 0 8px #52b788)" />
          <circle cx="570" cy="310" r="8" fill="#e9c46a" filter="drop-shadow(0 0 8px #e9c46a)" />
          <circle cx="310" cy="570" r="8" fill="#74c69d" filter="drop-shadow(0 0 8px #74c69d)" />
          <circle cx="50" cy="310" r="8" fill="#f4a261" filter="drop-shadow(0 0 8px #f4a261)" />
        </svg>

        {/* Inti Logo Tani Muda di Tengah Cincin */}
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: '50%',
            backgroundColor: 'rgba(27, 67, 50, 0.85)',
            border: '2px solid rgba(82, 183, 136, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 50px rgba(82, 183, 136, 0.35)',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 44 }}>🌱</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
            TANI MUDA
          </div>
          <div style={{ fontSize: 13, color: WARNA.emas, fontWeight: 600 }}>Siklus Pasti</div>
        </div>
      </div>

      {/* 4 Kartu Pilar Mengelilingi Cincin */}
      {pilarList.map((p, idx) => {
        const kartuSpring = spring({
          frame: frame - p.delay,
          fps,
          config: { damping: 14, stiffness: 90 },
        });
        const opasitas = interpolate(frame, [p.delay, p.delay + 15], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: p.pos.top,
              bottom: p.pos.bottom,
              left: p.pos.left,
              right: p.pos.right,
              transform: `translate(${p.pos.tx || '0%'}, ${p.pos.ty || '0%'}) scale(${kartuSpring})`,
              opacity: opasitas,
              width: 320,
              backgroundColor: 'rgba(18, 48, 36, 0.92)',
              border: `2px solid ${p.warna}44`,
              borderRadius: 24,
              padding: '20px 24px',
              boxSizing: 'border-box',
              boxShadow: `0 15px 35px rgba(0, 0, 0, 0.45)`,
              backdropFilter: 'blur(10px)',
              zIndex: 15,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${p.warna}25`,
                  border: `1px solid ${p.warna}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                {p.ikon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.warna, letterSpacing: '1px' }}>
                  PILAR {p.nomor}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>{p.nama}</div>
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#d8f3dc', marginBottom: 4 }}>
              {p.sub}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45 }}>
              {p.keterangan}
            </div>
          </div>
        );
      })}
    </div>
  );
};
