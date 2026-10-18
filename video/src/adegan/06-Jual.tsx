import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BingkaiLaptop } from '../komponen/BingkaiLaptop';
import { WARNA } from '../konfigurasi';

export const AdeganJual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const skalaLaptop = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 85 },
  });

  const geserKiri = interpolate(frame, [20, 50], [-50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opasitasKiri = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const geserKanan = interpolate(frame, [50, 80], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opasitasKanan = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Animasi koin dana aman berdenyut
  const kilauKoin = (Math.sin(frame / 12) + 1) / 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: WARNA.latarGelap,
        backgroundImage:
          'radial-gradient(circle at 50% 60%, rgba(244, 162, 97, 0.25) 0%, rgba(8, 28, 21, 0.98) 85%)',
        padding: '40px 60px',
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
            color: WARNA.matahari,
            marginBottom: 6,
          }}
        >
          Pilar 04 · Jual Panen Pasti & Kemitraan
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Jaminan Pembeli & Uang Muka Sebelum Tanam Dimulai
        </div>
      </div>

      {/* Bagian Tengah: Laptop dan Anotasi Transaksi */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1800,
          position: 'relative',
          marginTop: 10,
        }}
      >
        {/* Anotasi Kiri: Alur Pembeli & Petani */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            transform: `translateX(${geserKiri}px)`,
            opacity: opasitasKiri,
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(28, 42, 34, 0.92)',
              border: '2px solid rgba(244, 162, 97, 0.5)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: WARNA.matahari, marginBottom: 4 }}>
              TAHAP 1
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Pembeli Bayar Uang Muka
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Kafe atau resto memesan kuota panen dan menyetor DP komitmen ke sistem rekening bersama.
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(18, 48, 36, 0.92)',
              border: '2px solid rgba(82, 183, 136, 0.4)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#74c69d', marginBottom: 4 }}>
              TAHAP 2
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Petani Ambil Kesepakatan
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Petani memeriksa kapasitas kebun, menyetujui pesanan, dan mengunci harga pasti.
            </div>
          </div>
        </div>

        {/* Laptop Frame */}
        <div style={{ transform: `scale(${skalaLaptop})` }}>
          <BingkaiLaptop
            videoSrc="rekaman/06-jual.webm"
            lebar={1080}
            tinggi={607}
          />
        </div>

        {/* Anotasi Kanan: Pengiriman, Rating, dan Dana Aman */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            transform: `translateX(${geserKanan}px)`,
            opacity: opasitasKanan,
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(18, 48, 36, 0.92)',
              border: '2px solid rgba(82, 183, 136, 0.5)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#52b788', marginBottom: 4 }}>
              TAHAP 3
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Konfirmasi Kiriman & Rating
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Hasil panen diterima, pembeli memberikan bintang 5 yang membangun reputasi petani.
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(38, 32, 20, 0.95)',
              border: '2px solid rgba(233, 196, 106, 0.6)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                color: WARNA.emas,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 18, opacity: 0.6 + kilauKoin * 0.4 }}>🪙</span>
              <span>ESCROW AMAN TERPADU</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Pencairan Dana Pasti
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Uang pelunasan ditransfer langsung ke saldo petani tanpa potongan pihak ketiga.
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
        🤝 Menghapus jeratan tengkulak dan menciptakan hubungan saling menguntungkan petani & pelaku usaha
      </div>
    </div>
  );
};
