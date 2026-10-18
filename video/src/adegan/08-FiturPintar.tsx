import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonCuaca, IkonChat, IkonKamera, IkonKebun, IkonKotakStok, IkonPeta, IkonPin } from '../ikon';
import { TOKEN_WARNA } from '../konfigurasi';
import { useAwalKalimat } from '../komponen/WaktuNarasi';

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Judul: React.FC<{ kecil: string; besar: string; f: number; warnaKecil?: string }> = ({ kecil, besar, f, warnaKecil }) => {
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 8, fps, config: { damping: 14, stiffness: 110 } });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 34, opacity: sp, transform: `translateY(${(1 - sp) * 24}px)` }}>
      <div style={{ fontSize: 60, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>{besar}</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: warnaKecil ?? TOKEN_WARNA.teksPudar, marginTop: 6 }}>{kecil}</div>
    </div>
  );
};

/**
 * Lima shot fitur pintar. Setiap shot mulai saat fiturnya diucapkan [AG-44]:
 * kalimat 1 foto daun, 2 asisten/chat, 3 cuaca, 4 peta petani, 5 stok.
 */
export const Adegan08FiturPintar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const awal = useAwalKalimat('08');
  const awalShot = [0, awal[2] ?? 132, awal[3] ?? 264, awal[4] ?? 396, awal[5] ?? 528];
  const shot = awalShot.filter((f) => frame >= f).length;
  const f = frame - awalShot[shot - 1];
  const masuk = spring({ frame: f, fps, config: { damping: 14, stiffness: 100 } });
  const gambar = interpolate(f, [0, 30], [0, 1], klem);

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
      {shot === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.85 + masuk * 0.15})` }}>
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <IkonKamera size={260} progress={gambar} />
            <div style={{ position: 'absolute', left: 78, top: 96, opacity: interpolate(f, [20, 40], [0, 1], klem) }}>
              <IkonKebun size={104} />
            </div>
            {/* Garis pindai menyapu bolak-balik */}
            <div
              style={{
                position: 'absolute',
                left: 40,
                right: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: TOKEN_WARNA.daunTerang,
                top: 70 + Math.abs(Math.sin((f - 30) / 22)) * 150,
                opacity: interpolate(f, [30, 40], [0, 1], klem),
              }}
            />
          </div>
          <Judul f={f} besar="Foto daun, lihat dugaannya" kecil="dugaan: bercak daun · tanyakan ke penyuluh" warnaKecil={TOKEN_WARNA.tanah} />
        </div>
      )}

      {shot === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.85 + masuk * 0.15})` }}>
          <div style={{ position: 'relative' }}>
            <IkonChat size={240} progress={gambar} />
            {/* Titik-titik mengetik */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 88, display: 'flex', justifyContent: 'center', gap: 20 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: TOKEN_WARNA.daunTerang,
                    opacity: f > 25 ? 1 : 0,
                    transform: `translateY(${Math.sin((f - i * 6) / 5) * -10}px)`,
                  }}
                />
              ))}
            </div>
          </div>
          <Judul f={f} besar="Tanya asisten, chat pembeli" kecil="soal budidaya dan pesanan" />
        </div>
      )}

      {shot === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.85 + masuk * 0.15})` }}>
          <div style={{ transform: `translateY(${Math.sin(f / 14) * 10}px) rotate(${Math.sin(f / 20) * 3}deg)` }}>
            <IkonCuaca size={260} progress={gambar} />
          </div>
          <Judul f={f} besar="Prakiraan cuaca kebun" kecil="sumber: Open-Meteo" />
        </div>
      )}

      {shot === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 420, height: 280 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', opacity: 0.55 }}>
              <IkonPeta size={280} progress={gambar} warnaUtama={TOKEN_WARNA.tanah} />
            </div>
            {[
              { x: 70, y: 40, t: 18 },
              { x: 250, y: 10, t: 28 },
              { x: 165, y: 95, t: 38 },
            ].map((p, i) => {
              const jatuh = spring({ frame: f - p.t, fps, config: { damping: 8, stiffness: 140 } });
              return (
                <div key={i} style={{ position: 'absolute', left: p.x, top: p.y - (1 - jatuh) * 120, opacity: jatuh > 0.01 ? 1 : 0 }}>
                  <IkonPin size={i === 2 ? 130 : 96} progress={interpolate(f, [p.t, p.t + 25], [0.3, 1], klem)} />
                </div>
              );
            })}
          </div>
          <Judul f={f} besar="Petani di sekitarmu" kecil="lokasi dibulatkan, titik persis tidak ditampilkan" warnaKecil={TOKEN_WARNA.tanah} />
        </div>
      )}

      {shot === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', height: 260 }}>
            {[150, 210, 150].map((ukuran, i) => {
              const sp = spring({ frame: f - 6 - i * 9, fps, config: { damping: 9, stiffness: 150 } });
              return (
                <div key={i} style={{ transform: `translateY(${(1 - sp) * -260}px)`, opacity: sp > 0.01 ? 1 : 0 }}>
                  <IkonKotakStok size={ukuran} />
                </div>
              );
            })}
          </div>
          <Judul f={f} besar="Tawarkan stok siap jual" kecil="dilihat pembeli di sekitar" />
        </div>
      )}
    </div>
  );
};
