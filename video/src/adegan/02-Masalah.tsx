import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WARNA } from '../konfigurasi';

export const AdeganMasalah: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi counter 0.00% -> 21.93%
  const persentase = interpolate(frame, [15, 75], [0, 21.93], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const skalaAngka = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // 4 Kartu Masalah
  const masalahList = [
    {
      ikon: '📉',
      judul: 'Harga Anjlok Saat Panen',
      deskripsi: 'Harga pasar jatuh drastis saat pasokan melimpah, tanpa kontrak pembelian terikat.',
      delay: 70,
    },
    {
      ikon: '🐛',
      judul: 'Salah Takaran & Hama',
      deskripsi: 'Tebak-tebakan dosis pupuk dan terlambat deteksi penyakit berujung gagal panen.',
      delay: 100,
    },
    {
      ikon: '⛓️',
      judul: 'Jeratan Rantai Tengkulak',
      deskripsi: 'Rantai distribusi panjang memangkas margin keuntungan petani produsen.',
      delay: 130,
    },
    {
      ikon: '❓',
      judul: 'Pasar Tidak Menentu',
      deskripsi: 'Petani menanam modal tanpa kepastian siapa yang akan membeli hasil panen.',
      delay: 160,
    },
  ];

  const opasitasBannerBawah = interpolate(frame, [200, 230], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0a100d',
        backgroundImage:
          'radial-gradient(circle at 50% 20%, rgba(231, 111, 81, 0.15) 0%, rgba(10, 16, 13, 0.98) 80%)',
        padding: '60px 100px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header Bagian: Masalah Regenerasi */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: WARNA.terakota,
            marginBottom: 8,
          }}
        >
          Krisis Regenerasi Petani Nasional
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Mengapa Pemuda Ragu Terjun ke Pertanian?
        </div>
      </div>

      {/* Bagian Tengah: Counter Besar BPS */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${skalaAngka})`,
          zIndex: 10,
          margin: '20px 0',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #f4a261 0%, #e76f51 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 10px 25px rgba(231, 111, 81, 0.35))',
          }}
        >
          {persentase.toFixed(2)}%
        </div>
        <div
          style={{
            fontSize: 22,
            color: WARNA.teksPudar,
            fontWeight: 500,
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>Hanya 21,93% pemuda Indonesia yang bekerja di sektor pertanian</span>
          <span
            style={{
              backgroundColor: 'rgba(231, 111, 81, 0.25)',
              color: '#f4a261',
              padding: '3px 10px',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            BPS 2023
          </span>
        </div>
      </div>

      {/* Grid 4 Kartu Ketidakpastian */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          width: '100%',
          maxWidth: 1540,
          zIndex: 10,
        }}
      >
        {masalahList.map((m, idx) => {
          const kartuSpring = spring({
            frame: frame - m.delay,
            fps,
            config: { damping: 14, stiffness: 100 },
          });
          const opasitas = interpolate(frame, [m.delay, m.delay + 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={idx}
              style={{
                transform: `translateY(${(1 - kartuSpring) * 40}px)`,
                opacity: opasitas,
                backgroundColor: 'rgba(28, 20, 20, 0.75)',
                border: '1px solid rgba(231, 111, 81, 0.3)',
                borderRadius: 20,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ fontSize: 36 }}>{m.ikon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ffb4a2' }}>{m.judul}</div>
              <div style={{ fontSize: 16, color: '#e0d5d5', lineHeight: 1.5 }}>
                {m.deskripsi}
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner Visi Emas 2045 */}
      <div
        style={{
          opacity: opasitasBannerBawah,
          backgroundColor: 'rgba(45, 106, 79, 0.35)',
          border: '1px solid rgba(82, 183, 136, 0.4)',
          borderRadius: 30,
          padding: '12px 32px',
          fontSize: 20,
          fontWeight: 600,
          color: '#d8f3dc',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 10,
        }}
      >
        <span>🇮🇩</span>
        <span>
          Menuju <strong>Indonesia Emas 2045</strong> & Bonus Demografi: Regenerasi Petani Cerdas Adalah Kunci Kedaulatan Pangan
        </span>
      </div>
    </div>
  );
};
