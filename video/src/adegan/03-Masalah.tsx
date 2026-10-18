import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonGrafikTurun, IkonKeranjang, IkonDaunUlat, IkonRantai, IkonKoin, IkonTruk } from '../ikon';
import { SubtitelVideo } from '../komponen/SubtitelVideo';
import { TOKEN_WARNA } from '../konfigurasi';

export const Adegan03Masalah: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4 Shot @ 135 frame (4.5 detik per shot)
  const shotAktif = frame < 135 ? 'a' : frame < 270 ? 'b' : frame < 405 ? 'c' : 'd';
  const frameShot = frame % 135;

  const spShot = spring({
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
      {/* SHOT A: Harga Anjlok (0 - 135) */}
      {shotAktif === 'a' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${spShot})`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 40 }}>
            <IkonKeranjang size={140} strokeWidth={4} />
            <div style={{ fontSize: 44, color: TOKEN_WARNA.tomat, fontWeight: 900 }}>→</div>
            <IkonGrafikTurun size={180} strokeWidth={4} />
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            {['Harga', 'anjlok', 'saat', 'panen', 'raya'].map((w, i) => (
              <span
                key={i}
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: i === 1 ? TOKEN_WARNA.tomat : TOKEN_WARNA.daunTua,
                }}
              >
                {w}
              </span>
            ))}
          </div>
          <SubtitelVideo teks="Ketidakpastian harga yang sering anjlok saat pasokan melimpah." />
        </div>
      )}

      {/* SHOT B: Salah Takaran & Ulat Hama (135 - 270) */}
      {shotAktif === 'b' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${spShot})`,
          }}
        >
          <div style={{ marginBottom: 40 }}>
            <IkonDaunUlat size={220} strokeWidth={4} />
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            {['Gagal', 'panen', 'akibat', 'salah', 'takaran'].map((w, i) => (
              <span
                key={i}
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: i === 0 || i === 3 ? TOKEN_WARNA.tomat : TOKEN_WARNA.daunTua,
                }}
              >
                {w}
              </span>
            ))}
          </div>
          <SubtitelVideo teks="Takaran pupuk yang sulit ditebak dan terlambat mendeteksi hama." />
        </div>
      )}

      {/* SHOT C: Rantai Tengkulak Memotong Koin (270 - 405) */}
      {shotAktif === 'c' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${spShot})`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginBottom: 40,
              position: 'relative',
            }}
          >
            <IkonRantai size={180} strokeWidth={4} />
            {/* Koin berjalan dan menyusut */}
            <div
              style={{
                transform: `translateX(${interpolate(frameShot, [10, 110], [-100, 100], { extrapolateRight: 'clamp' })}px) scale(${interpolate(frameShot, [10, 110], [1.2, 0.4], { extrapolateRight: 'clamp' })})`,
              }}
            >
              <IkonKoin size={90} strokeWidth={4} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            {['Rantai', 'tengkulak', 'memotong', 'laba', 'petani'].map((w, i) => (
              <span
                key={i}
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: i === 1 ? TOKEN_WARNA.tomat : TOKEN_WARNA.daunTua,
                }}
              >
                {w}
              </span>
            ))}
          </div>
          <SubtitelVideo teks="Jeratan perantara panjang yang menggerus keuntungan petani muda." />
        </div>
      )}

      {/* SHOT D: Truk Berhenti di Persimpangan (405 - 540) */}
      {shotAktif === 'd' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${spShot})`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              marginBottom: 40,
            }}
          >
            <IkonTruk size={180} strokeWidth={4} />
            <div style={{ fontSize: 72, fontWeight: 900, color: TOKEN_WARNA.tomat }}>
              ?
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            {['Pasar', 'panen', 'tidak', 'menentu'].map((w, i) => (
              <span
                key={i}
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: i >= 2 ? TOKEN_WARNA.tomat : TOKEN_WARNA.daunTua,
                }}
              >
                {w}
              </span>
            ))}
          </div>
          <SubtitelVideo teks="Menanam tanpa kepastian siapa yang akan membeli hasil panen." />
        </div>
      )}
    </div>
  );
};
