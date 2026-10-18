import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BingkaiLaptop } from '../komponen/BingkaiLaptop';
import { WARNA } from '../konfigurasi';

export const AdeganRawat: React.FC = () => {
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

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: WARNA.latarGelap,
        backgroundImage:
          'radial-gradient(circle at 50% 60%, rgba(45, 106, 79, 0.3) 0%, rgba(8, 28, 21, 0.98) 85%)',
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
            color: '#74c69d',
            marginBottom: 6,
          }}
        >
          Pilar 03 · Rawat Tanaman Presisi
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Panduan SOP Setiap Hari dari Semai Hingga Panen
        </div>
      </div>

      {/* Bagian Tengah: Laptop dan Anotasi */}
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
        {/* Anotasi Kiri */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            width: 310,
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
              backgroundColor: 'rgba(18, 48, 36, 0.92)',
              border: '2px solid rgba(82, 183, 136, 0.4)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#74c69d', marginBottom: 4 }}>
              TIMELINE TANAMAN
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Penggaris Umur Tanaman
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Melacak fase pertumbuhan hari ke hari secara visual, memastikan setiap tahap tepat waktu.
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
              ASISTEN HARIAN
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Tugas & SOP Terjadwal
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Penyiraman, pemupukan, dan pengecekan instalasi disajikan sebagai ceklis harian praktis.
            </div>
          </div>
        </div>

        {/* Laptop Frame */}
        <div style={{ transform: `scale(${skalaLaptop})` }}>
          <BingkaiLaptop
            videoSrc="rekaman/05-rawat.webm"
            lebar={1080}
            tinggi={607}
          />
        </div>

        {/* Anotasi Kanan */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            width: 310,
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
              backgroundColor: 'rgba(28, 42, 34, 0.92)',
              border: '2px solid rgba(82, 183, 136, 0.5)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#52b788', marginBottom: 4 }}>
              KONTROL KUALITAS AIR
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Cek Sensor pH & PPM
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Input data kepekatan nutrisi PPM dan pH larutan untuk menjaga tanaman tumbuh optimal.
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(28, 42, 34, 0.92)',
              border: '2px solid rgba(233, 196, 106, 0.5)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: WARNA.emas, marginBottom: 4 }}>
              SARAN INSTAN
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Rekomendasi Tindakan
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Memberikan instruksi jelas jika PPM terlalu rendah atau pH asam tanpa perlu menebak.
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
        💧 Pertanian presisi menjaga konsistensi mutu dan bobot panen sesuai standar pembeli
      </div>
    </div>
  );
};
