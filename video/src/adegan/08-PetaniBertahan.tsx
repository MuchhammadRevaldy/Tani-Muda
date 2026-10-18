import React from 'react';
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BingkaiHp } from '../komponen/BingkaiHp';
import { WARNA } from '../konfigurasi';

export const AdeganPetaniBertahan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const skalaHp = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 85 },
  });

  const lencanaList = [
    {
      nama: 'Panen Pertama',
      kategori: 'Pencapaian Siklus',
      file: 'lencana/panen-pertama.svg',
      delay: 20,
    },
    {
      nama: 'Pengukur Teliti',
      kategori: 'Disiplin pH & PPM',
      file: 'lencana/pengukur-teliti.svg',
      delay: 40,
    },
    {
      nama: 'Dipercaya Pembeli',
      kategori: 'Rating Bintang 5',
      file: 'lencana/dipercaya-pembeli.svg',
      delay: 60,
    },
    {
      nama: 'Panen Raya',
      kategori: 'Level Tertinggi',
      file: 'lencana/level-panen-raya.svg',
      delay: 80,
    },
  ];

  const opasitasOffline = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: WARNA.latarGelap,
        backgroundImage:
          'radial-gradient(circle at 40% 50%, rgba(45, 106, 79, 0.35) 0%, rgba(8, 28, 21, 0.98) 85%)',
        padding: '40px 80px',
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
      {/* Header Bagian */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: WARNA.emas,
            marginBottom: 6,
          }}
        >
          Retensi & Keberlanjutan Petani
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Gamifikasi Capaian & Desain Tangguh Tanpa Sinyal
        </div>
      </div>

      {/* Bagian Tengah: HP dan Koleksi Lencana 3D */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 70,
          width: '100%',
          maxWidth: 1600,
          zIndex: 10,
        }}
      >
        {/* Smartphone Mockup */}
        <div style={{ transform: `scale(${skalaHp})` }}>
          <BingkaiHp
            videoSrc="rekaman/08-level.webm"
            lebar={360}
            tinggi={780}
            skala={0.92}
          />
        </div>

        {/* Panel Sisi Kanan: Lencana 3D & Fitur Offline */}
        <div
          style={{
            width: 620,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Grid Koleksi Lencana 3D */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#d8f3dc', marginBottom: 14 }}>
              Koleksi Lencana Penghargaan 3D Petani:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
              }}
            >
              {lencanaList.map((l, idx) => {
                const badgeSpring = spring({
                  frame: frame - l.delay,
                  fps,
                  config: { damping: 12, stiffness: 90 },
                });

                return (
                  <div
                    key={idx}
                    style={{
                      transform: `scale(${badgeSpring})`,
                      backgroundColor: 'rgba(18, 48, 36, 0.85)',
                      border: '1.5px solid rgba(82, 183, 136, 0.35)',
                      borderRadius: 18,
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <img
                      src={staticFile(l.file)}
                      alt={l.nama}
                      style={{
                        width: 52,
                        height: 52,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#ffffff' }}>
                        {l.nama}
                      </div>
                      <div style={{ fontSize: 13, color: WARNA.emas, fontWeight: 500 }}>
                        {l.kategori}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banner PWA Offline First */}
          <div
            style={{
              opacity: opasitasOffline,
              backgroundColor: 'rgba(28, 42, 34, 0.95)',
              border: '2px solid rgba(233, 196, 106, 0.5)',
              borderRadius: 20,
              padding: '22px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26 }}>⚡</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: WARNA.emas }}>
                Mode Offline First (PWA)
              </span>
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
              Tetap lancar mencatat sensor pH/PPM, mengecek jadwal, dan melihat resep SOP di tengah
              ladang tanpa sinyal internet. Data tersimpan di perangkat dan otomatis sinkron saat
              kembali online.
            </div>
          </div>
        </div>
      </div>

      {/* Footer Tag */}
      <div
        style={{
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 500,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        🌾 Memberdayakan pemuda tani dengan apresiasi nyata dan keandalan sistem di kondisi lapangan sesungguhnya
      </div>
    </div>
  );
};
