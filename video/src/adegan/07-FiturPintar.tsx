import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BingkaiHp } from '../komponen/BingkaiHp';
import { WARNA } from '../konfigurasi';

export const AdeganFiturPintar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tentukan fase fitur aktif berdasarkan waktu
  // Fase 1: 0 - 240 frame (0-8 detik) -> Deteksi Penyakit AI
  // Fase 2: 240 - 480 frame (8-16 detik) -> Chatbot Pertanian
  // Fase 3: 480 - 700 frame (16-23.3 detik) -> Prakiraan Cuaca BMKG
  // Fase 4: 700 - 900 frame (23.3-30 detik) -> Stok, Chat & Peta Privasi

  const fase =
    frame < 240 ? 1 : frame < 480 ? 2 : frame < 700 ? 3 : 4;

  const getSubfiturInfo = () => {
    switch (fase) {
      case 1:
        return {
          judulKecil: 'KECERDASAN BUATAN',
          judulBesar: 'Deteksi Gejala Tanaman (AI)',
          sub: 'Analisis Daun Cepat Berlabel Dugaan & Tindakan Aman',
          deskripsi:
            'Mengidentifikasi bercak daun, hama, dan defisiensi nutrisi hanya dari foto kamera HP. Rekomendasi penanganan praktis tanpa bahan kimia berlebih.',
          tag: '🏷️ Label Dugaan Edukatif',
          video: 'rekaman/07-deteksi.webm',
          warna: '#52b788',
        };
      case 2:
        return {
          judulKecil: 'ASISTEN VIRTUAL 24 JAM',
          judulBesar: 'Chatbot Cerdas Pertanian',
          sub: 'Konsultasi Budidaya Kapan Saja & Di Mana Saja',
          deskripsi:
            'Menjawab pertanyaan seputar PPM, waktu pupuk pertama, hama spesifik, hingga tips agribisnis secara ramah, cepat, dan terpercaya.',
          tag: '💬 Tanya Jawab Interaktif',
          video: 'rekaman/07-chatbot.webm',
          warna: '#e9c46a',
        };
      case 3:
        return {
          judulKecil: 'DATA REAL-TIME BMKG',
          judulBesar: 'Prakiraan Cuaca 3 Hari',
          sub: 'Efisiensi Penyiraman & Adaptasi Perubahan Iklim',
          deskripsi:
            'Prakiraan suhu, kelembapan, dan potensi hujan di tingkat desa. Pengingat siram otomatis dilewati bila prakiraan cuaca menunjukkan hujan lebat.',
          tag: '🌦️ Hemat Air & Nutrisi',
          video: 'rekaman/07-cuaca.webm',
          warna: '#74c69d',
        };
      default:
        return {
          judulKecil: 'KOMUNITAS & PASAR LOKAL',
          judulBesar: 'Stok Panen, Chat & Peta Privasi',
          sub: 'Perlindungan Lokasi Kebun dengan Pembulatan 2 Desimal',
          deskripsi:
            'Pembeli dapat melihat stok segar sekitar, bernegosiasi via chat langsung, serta melihat peta sebaran petani tanpa mengekspos koordinat persis.',
          tag: '🛡️ Privasi Terlindungi (~1 km)',
          video: 'rekaman/07-stok.webm',
          warna: '#f4a261',
        };
    }
  };

  const info = getSubfiturInfo();

  // Animasi masuk kartu samping
  const kartuSpring = spring({
    frame: frame % 240,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: WARNA.latarGelap,
        backgroundImage: `radial-gradient(circle at 60% 50%, rgba(45, 106, 79, 0.35) 0%, rgba(8, 28, 21, 0.98) 85%)`,
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
      {/* Header Adegan */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: info.warna,
            marginBottom: 6,
          }}
        >
          Teknologi Cerdas Tani Muda
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Ekosistem Agrikultur Berbasis AI, IoT & Komunitas
        </div>
      </div>

      {/* Bagian Tengah: Tampilan Split HP dan Informasi Detail */}
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
        {/* Smartphone Mockup Memutar Video Rekaman Asli */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BingkaiHp
            videoSrc={info.video}
            lebar={360}
            tinggi={780}
            skala={0.92}
          />
        </div>

        {/* Panel Informasi Fitur di Sisi Kanan */}
        <div
          style={{
            width: 580,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            transform: `translateY(${(1 - kartuSpring) * 30}px)`,
          }}
        >
          {/* Badge Kategori */}
          <div
            style={{
              backgroundColor: `${info.warna}22`,
              border: `1.5px solid ${info.warna}66`,
              color: info.warna,
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '1.5px',
              alignSelf: 'flex-start',
            }}
          >
            {info.judulKecil}
          </div>

          {/* Judul & Subjudul */}
          <div>
            <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>
              {info.judulBesar}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#d8f3dc' }}>{info.sub}</div>
          </div>

          {/* Deskripsi */}
          <div
            style={{
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.6,
              backgroundColor: 'rgba(18, 48, 36, 0.85)',
              border: '1px solid rgba(82, 183, 136, 0.3)',
              borderRadius: 20,
              padding: '24px 28px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {info.deskripsi}
          </div>

          {/* Highlight Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'rgba(233, 196, 106, 0.15)',
              border: '1px solid rgba(233, 196, 106, 0.4)',
              color: WARNA.emas,
              padding: '12px 24px',
              borderRadius: 16,
              fontSize: 18,
              fontWeight: 700,
              alignSelf: 'flex-start',
            }}
          >
            {info.tag}
          </div>
        </div>
      </div>

      {/* Progress Dots 4 Fitur di Bawah */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: fase === i ? 36 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: fase === i ? WARNA.daunTerang : 'rgba(255, 255, 255, 0.25)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
