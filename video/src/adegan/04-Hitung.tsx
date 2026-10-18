import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BingkaiLaptop } from '../komponen/BingkaiLaptop';
import { WARNA } from '../konfigurasi';

export const AdeganHitung: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const skalaLaptop = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 85 },
  });

  const geserKartuKiri = interpolate(frame, [25, 55], [-60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opasitasKartuKiri = interpolate(frame, [25, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const geserKartuKanan = interpolate(frame, [60, 90], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opasitasKartuKanan = interpolate(frame, [60, 90], [0, 1], {
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
            color: WARNA.emas,
            marginBottom: 6,
          }}
        >
          Pilar 02 · Hitung Modal & BEP
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Kalkulasi Transparan Sebelum Memulai Tanam
        </div>
      </div>

      {/* Bagian Tengah: Laptop dan Anotasi Samping */}
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
            transform: `translateX(${geserKartuKiri}px)`,
            opacity: opasitasKartuKiri,
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
              LANGKAH 1
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Pilih Komoditas & Lahan
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Pilih tanaman unggulan (sawi, pakcoy, selada) dan masukkan luas kebun dalam m².
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
              LANGKAH 2
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Rincian Biaya Otomatis
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Sistem menyusun kebutuhan modal bibit, nutrisi AB Mix, listrik, dan media tanam.
            </div>
          </div>
        </div>

        {/* Bingkai Laptop Memutar Video Asli */}
        <div style={{ transform: `scale(${skalaLaptop})` }}>
          <BingkaiLaptop
            videoSrc="rekaman/04-hitung.webm"
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
            transform: `translateX(${geserKartuKanan}px)`,
            opacity: opasitasKartuKanan,
            zIndex: 20,
          }}
        >
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
              FITUR UNGGULAN
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Titik Impas (BEP) Pasti
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Mengetahui secara tepat volume panen minimal yang harus tercapai agar modal kembali.
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(28, 42, 34, 0.92)',
              border: '2px solid rgba(82, 183, 136, 0.4)',
              borderRadius: 20,
              padding: '20px 22px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#74c69d', marginBottom: 4 }}>
              HASIL SIMULASI
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Estimasi Potensi Laba
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.45 }}>
              Memberikan proyeksi laba bersih dan tips efisiensi biaya sebelum melangkah ke ladang.
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
        💡 Menghapus risiko modal spekulatif melalui simulasi agribisnis berbasis data nyata
      </div>
    </div>
  );
};
