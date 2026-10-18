import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonKameraDaun, IkonGelembungChat, IkonCuaca, IkonPinBertunas, IkonKotakStok } from '../ikon';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan08FiturPintar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 5 Shot cepat @ 132 frame
  const shotAktif =
    frame < 132 ? 1 : frame < 264 ? 2 : frame < 396 ? 3 : frame < 528 ? 4 : 5;
  const frameShot = frame % 132;

  const sp = spring({
    frame: frameShot,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

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
      {/* SHOT 1: Pindai Daun AI & Label Dugaan (0 - 132) */}
      {shotAktif === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sp})` }}>
          <div style={{ position: 'relative', marginBottom: 30 }}>
            <IkonKameraDaun size={180} strokeWidth={4} />
            {/* Garis pindai menyapu */}
            <div
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                height: 3,
                backgroundColor: TOKEN_WARNA.daunTerang,
                top: `${interpolate(frameShot, [10, 80], [20, 160], { extrapolateRight: 'clamp' })}px`,
              }}
            />
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: TOKEN_WARNA.teksPudar, marginBottom: 8 }}>
            dugaan: bercak daun awal
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
            Deteksi Cepat Gejala Tanaman
          </div>
          <SubtitelVideo teks="Foto daun dianalisis dengan label dugaan dan rekomendasi tindakan aman." />
        </div>
      )}

      {/* SHOT 2: Titik-titik Mengetik di Chatbot (132 - 264) */}
      {shotAktif === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sp})` }}>
          <div style={{ marginBottom: 30 }}>
            <IkonGelembungChat size={180} strokeWidth={4} />
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: TOKEN_WARNA.daunTerang, marginBottom: 8 }}>
            mengetik saran takaran PPM...
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
            Asisten Tanya Jawab 24 Jam
          </div>
          <SubtitelVideo teks="Konsultasi nutrisi dan hama pertanian kapan saja langsung dijawab." />
        </div>
      )}

      {/* SHOT 3: Cuaca Awan, Hujan & Matahari (264 - 396) */}
      {shotAktif === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sp})` }}>
          <div style={{ marginBottom: 30 }}>
            <IkonCuaca size={180} strokeWidth={4} />
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: TOKEN_WARNA.emas, marginBottom: 8 }}>
            data BMKG 3 hari ke depan
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
            Prakiraan Cuaca Adaptif
          </div>
          <SubtitelVideo teks="Pengingat siram otomatis menyesuaikan potensi hujan di desa." />
        </div>
      )}

      {/* SHOT 4: Peta Garis Jawa Tengah & Pin Bertunas (396 - 528) */}
      {shotAktif === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sp})` }}>
          <div style={{ marginBottom: 30 }}>
            <IkonPinBertunas size={180} strokeWidth={4} />
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: TOKEN_WARNA.daunTerang, marginBottom: 8 }}>
            lokasi dibulatkan demi privasi kebun
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
            Peta Sebaran Petani Sekitar
          </div>
          <SubtitelVideo teks="Pembeli menemukan kebun terdekat tanpa mengekspos koordinat persis petani." />
        </div>
      )}

      {/* SHOT 5: Kotak Stok Panen Bertumpuk (528 - 660) */}
      {shotAktif === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sp})` }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginBottom: 30 }}>
            <IkonKotakStok size={140} strokeWidth={4} />
            <IkonKotakStok size={180} strokeWidth={4} />
            <IkonKotakStok size={140} strokeWidth={4} />
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: TOKEN_WARNA.daunTerang, marginBottom: 8 }}>
            stok segar siap panen & COD
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
            Pasar Panen Lokal Terbuka
          </div>
          <SubtitelVideo teks="Stok siap jual langsung terlihat oleh pelaku usaha di sekitar." />
        </div>
      )}
    </div>
  );
};
