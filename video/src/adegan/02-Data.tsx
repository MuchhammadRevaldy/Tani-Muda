import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonPetaniMuda } from '../ikon';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan02Data: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Angka berhitung ke 21.93% (frame 30 - 100)
  const nilaiAngka = interpolate(frame, [30, 95], [0, 21.93], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const skalaAngka = spring({
    frame: frame - 25,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Teks kinetik: 4 kata
  const kataTeks = ['petani', 'berusia', '19–39', 'tahun'];

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
        justifyContent: 'space-between',
        padding: '60px 80px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Bagian Atas: Angka Besar & Teks Kinetik */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 20,
          zIndex: 10,
        }}
      >
        {/* Angka Persentase Besar */}
        <div
          style={{
            fontSize: 128,
            fontWeight: 900,
            color: TOKEN_WARNA.daunTua,
            lineHeight: 1,
            transform: `scale(${skalaAngka})`,
            letterSpacing: '-2px',
          }}
        >
          {nilaiAngka.toFixed(2)}%
        </div>

        {/* Teks Kinetik (Maks 6 Kata) */}
        <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
          {kataTeks.map((kata, i) => {
            const sp = spring({
              frame: frame - (45 + i * 8),
              fps,
              config: { damping: 14, stiffness: 100 },
            });

            return (
              <span
                key={i}
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: i === 2 ? TOKEN_WARNA.tomat : TOKEN_WARNA.teks,
                  transform: `translateY(${(1 - sp) * 20}px)`,
                  opacity: sp,
                }}
              >
                {kata}
              </span>
            );
          })}
        </div>
      </div>

      {/* Bagian Tengah: Hamparan 100 Sosok Petani (10x10) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(20, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          gap: '12px 18px',
          width: '100%',
          maxWidth: 1540,
          margin: '20px auto',
          justifyItems: 'center',
          alignItems: 'center',
        }}
      >
        {Array.from({ length: 100 }).map((_, idx) => {
          // Gelombang masuk (staggered berdasarkan baris & kolom)
          const baris = Math.floor(idx / 20);
          const kolom = idx % 20;
          const delayMuncul = 15 + (baris + kolom) * 1.5;

          const sp = spring({
            frame: frame - delayMuncul,
            fps,
            config: { damping: 12, stiffness: 110 },
          });

          // Tepat 22 sosok pertama berubah warna daun hijau cerah pada frame 85
          const isMuda = idx < 22;
          const berubahWarna = interpolate(frame, [85, 110], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const warnaUtama = isMuda
            ? interpolateColorLocal(berubahWarna, '#9ca3af', TOKEN_WARNA.daunTua)
            : '#9ca3af';

          const warnaAksen = isMuda
            ? interpolateColorLocal(berubahWarna, '#d1d5db', TOKEN_WARNA.daunTerang)
            : '#e5e7eb';

          return (
            <div
              key={idx}
              style={{
                transform: `scale(${sp})`,
                opacity: sp,
                transition: 'transform 0.2s',
              }}
            >
              <IkonPetaniMuda
                size={44}
                strokeWidth={3}
                warnaUtama={warnaUtama}
                warnaAksen={warnaAksen}
              />
            </div>
          );
        })}
      </div>

      {/* Sumber Data Kecil di Pojok Bawah Tanpa Kotak */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 48,
          fontSize: 16,
          fontWeight: 600,
          color: TOKEN_WARNA.teksPudar,
          letterSpacing: '0.5px',
        }}
      >
        Sensus Pertanian 2023, BPS
      </div>

      {/* Subtitel Terbakar */}
      <SubtitelVideo teks="Hanya 21,93 persen pemuda Indonesia yang bekerja di sektor pertanian." />
    </div>
  );
};

function interpolateColorLocal(progress: number, color1: string, color2: string): string {
  if (progress <= 0) return color1;
  if (progress >= 1) return color2;
  return color2;
}
