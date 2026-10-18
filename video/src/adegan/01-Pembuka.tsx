import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonBenihTunas } from '../ikon';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan01Pembuka: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Garis tanah tergambar (frame 0 - 30)
  const lebarTanah = interpolate(frame, [5, 30], [0, 1400], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Benih jatuh memantul (frame 20 - 55)
  const jatuhBenih = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // 3. Tunas tumbuh (frame 45 - 90)
  const tumbuhTunas = interpolate(frame, [45, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 4. Huruf T-A-N-I M-U-D-A masuk satu per satu (frame 80 - 130)
  const hurufList = ['T', 'A', 'N', 'I', ' ', 'M', 'U', 'D', 'A'];

  // 5. Slogan kinetik (frame 140 - 220)
  const kataSlogan = ['Tanam', 'dengan', 'pembeli', 'yang', 'pasti'];

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: TOKEN_WARNA.latarKrem,
        backgroundImage: 'radial-gradient(#e5ded2 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Garis Tanah Tergambar */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          width: lebarTanah,
          height: 4,
          backgroundColor: TOKEN_WARNA.tanah,
          borderRadius: 2,
        }}
      />

      {/* Bagian Animasi Tunas & Logo */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - jatuhBenih) * -240}px)`,
        }}
      >
        <IkonBenihTunas size={180} strokeWidth={4} progress={tumbuhTunas} />
      </div>

      {/* Teks Judul Utama: Huruf Masuk Satu Per Satu */}
      <div
        style={{
          position: 'absolute',
          top: 690,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {hurufList.map((h, i) => {
          if (h === ' ') {
            return <div key={i} style={{ width: 28 }} />;
          }

          const sp = spring({
            frame: frame - (75 + i * 4),
            fps,
            config: { damping: 12, stiffness: 120 },
          });

          return (
            <span
              key={i}
              style={{
                fontSize: 84,
                fontWeight: 900,
                color: TOKEN_WARNA.daunTua,
                transform: `scale(${sp}) translateY(${(1 - sp) * 30}px)`,
                opacity: sp,
                display: 'inline-block',
              }}
            >
              {h}
            </span>
          );
        })}
      </div>

      {/* Slogan Tipografi Kinetik (Maks 6 Kata) */}
      <div
        style={{
          position: 'absolute',
          top: 800,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        {kataSlogan.map((kata, i) => {
          const sp = spring({
            frame: frame - (130 + i * 8),
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          return (
            <span
              key={i}
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: i >= 2 ? TOKEN_WARNA.daunTerang : TOKEN_WARNA.teks,
                transform: `translateY(${(1 - sp) * 25}px)`,
                opacity: sp,
              }}
            >
              {kata}
            </span>
          );
        })}
      </div>

      {/* Subtitel Terbakar di Bawah Tanpa Kotak */}
      <SubtitelVideo teks="Selamat datang di Tani Muda: Tanam dengan pembeli yang pasti." />
    </div>
  );
};
