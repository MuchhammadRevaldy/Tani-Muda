import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IkonCentang, IkonKunci, IkonPanen, IkonUang } from '../ikon';
import { TOKEN_WARNA } from '../konfigurasi';
import { useAwalKalimat } from '../komponen/WaktuNarasi';

export const Adegan07Jual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Kejadian mengikuti kalimat narasi [AG-44]:
  // 0 pesan + uang muka, 1 ditahan, 2 petani ambil & kirim, 3 konfirmasi & cair, 4 slogan.
  const awal = useAwalKalimat('07');
  const tibaDiTengah = awal[1] ?? 75;
  const mulaiTerbang = Math.max(20, tibaDiTengah - 55);
  const petaniMasuk = awal[2] ?? 120;
  const mulaiKirim = petaniMasuk + 45;
  const konfirmasi = awal[3] ?? 200;
  const mulaiCair = konfirmasi + 30;
  const tibaDiPetani = mulaiCair + 45;

  const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  // Koin uang muka melengkung dari pembeli ke dana ditahan.
  const xKoin = interpolate(frame, [mulaiTerbang, tibaDiTengah], [430, 960], klem);
  const yKoin = interpolate(frame, [mulaiTerbang, (mulaiTerbang + tibaDiTengah) / 2, tibaDiTengah], [520, 330, 520], klem);
  // Setelah konfirmasi, koin melengkung ke petani.
  const xKoinCair = interpolate(frame, [mulaiCair, tibaDiPetani], [960, 1330], klem);
  const yKoinCair = interpolate(frame, [mulaiCair, (mulaiCair + tibaDiPetani) / 2, tibaDiPetani], [520, 300, 590], klem);

  const gembokTerkunci = frame >= tibaDiTengah && frame < mulaiCair;
  const danaCair = frame >= tibaDiPetani;
  const pantulGembok = spring({ frame: frame - tibaDiTengah, fps, config: { damping: 9, stiffness: 160 } });
  const sorotPetani = spring({ frame: frame - petaniMasuk, fps, config: { damping: 14 } });

  // Keranjang panen dikirim dari petani ke pembeli di bawah layar.
  const xPanen = interpolate(frame, [mulaiKirim, konfirmasi - 10], [1440, 480], klem);
  const tampakPanen = interpolate(frame, [mulaiKirim, mulaiKirim + 10, konfirmasi, konfirmasi + 25], [0, 1, 1, 0], klem);
  const gambarCentang = interpolate(frame, [konfirmasi, konfirmasi + 20], [0, 1], klem);
  // Gerak halus terus-menerus supaya tidak ada bingkai diam.
  const ayun = Math.sin(frame / 18) * 6;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: TOKEN_WARNA.latarKrem,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Judul kinetik: kata masuk bergantian */}
      <div style={{ position: 'absolute', top: 70, display: 'flex', gap: 14, zIndex: 30 }}>
        {['Uang', 'muka', 'aman,', 'pembeli', 'pasti'].map((w, i) => {
          const sp = spring({ frame: frame - (6 + i * 6), fps, config: { damping: 14, stiffness: 110 } });
          return (
            <span
              key={i}
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: i >= 3 ? TOKEN_WARNA.daun : TOKEN_WARNA.daunTua,
                opacity: sp,
                transform: `translateY(${(1 - sp) * 26}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* Garis pembagi layar */}
      <div style={{ position: 'absolute', top: 220, bottom: 190, left: 960, width: 2, backgroundColor: TOKEN_WARNA.garis }} />

      {/* Kiri: pembeli */}
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 330 + ayun * 0.4,
          width: 520,
          backgroundColor: TOKEN_WARNA.latarPutih,
          border: `2px solid ${TOKEN_WARNA.daunTua}`,
          borderRadius: 24,
          padding: 36,
          boxShadow: '0 12px 28px rgba(27,67,50,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: TOKEN_WARNA.tanah }}>Pembeli</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>Katering Bu Ratna</div>
        <div style={{ fontSize: 26, color: TOKEN_WARNA.teksPudar, lineHeight: 1.35 }}>
          Pesan 50 kg sawi sebelum panen, bayar uang muka.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 44, opacity: gambarCentang }}>
          <IkonCentang size={44} progress={gambarCentang} warnaUtama={TOKEN_WARNA.daun} />
          <span style={{ fontSize: 26, fontWeight: 800, color: TOKEN_WARNA.daun }}>Kiriman diterima</span>
        </div>
      </div>

      {/* Tengah: dana ditahan */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 520,
          transform: `translate(-50%, -50%) scale(${gembokTerkunci ? 0.9 + pantulGembok * 0.1 : 1})`,
          backgroundColor: TOKEN_WARNA.latarPutih,
          border: `3px solid ${gembokTerkunci ? TOKEN_WARNA.daunTua : TOKEN_WARNA.garis}`,
          borderRadius: 24,
          padding: '26px 34px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 12px 30px rgba(27,67,50,0.1)',
          zIndex: 20,
          minWidth: 280,
        }}
      >
        <IkonKunci
          size={64}
          warnaUtama={gembokTerkunci ? TOKEN_WARNA.daunTua : TOKEN_WARNA.teksPudar}
          warnaAksen={TOKEN_WARNA.daunTerang}
          style={{ transform: `rotate(${gembokTerkunci ? 0 : -12}deg)` }}
        />
        <div style={{ fontSize: 30, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>
          {frame >= mulaiCair ? 'Dana cair' : gembokTerkunci ? 'Dana ditahan' : 'Uang muka'}
        </div>
      </div>

      {/* Kanan: petani */}
      <div
        style={{
          position: 'absolute',
          right: 160,
          top: 330 - ayun * 0.4,
          width: 520,
          backgroundColor: TOKEN_WARNA.latarPutih,
          border: `2px solid ${TOKEN_WARNA.daunTua}`,
          borderRadius: 24,
          padding: 36,
          boxShadow: `0 12px ${28 + sorotPetani * 20}px rgba(27,67,50,${0.06 + sorotPetani * 0.08})`,
          transform: `scale(${0.96 + sorotPetani * 0.04})`,
          opacity: 0.55 + sorotPetani * 0.45,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: TOKEN_WARNA.daun }}>Petani</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: TOKEN_WARNA.daunTua }}>Arif, Klaten</div>
        <div style={{ fontSize: 26, color: TOKEN_WARNA.teksPudar, lineHeight: 1.35 }}>
          Ambil pesanan, rawat, lalu kirim hasil panen.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 44, opacity: danaCair ? 1 : 0 }}>
          <IkonUang size={44} />
          <span style={{ fontSize: 26, fontWeight: 800, color: TOKEN_WARNA.daun }}>Dana diterima</span>
        </div>
      </div>

      {/* Keranjang panen dikirim ke pembeli */}
      <div
        style={{
          position: 'absolute',
          left: xPanen,
          top: 850 + Math.abs(Math.sin(frame / 5)) * -10,
          transform: 'translate(-50%, -50%)',
          opacity: tampakPanen,
          zIndex: 30,
        }}
      >
        <IkonPanen size={84} />
      </div>

      {/* Koin uang muka */}
      <div
        style={{
          position: 'absolute',
          left: frame < mulaiCair ? xKoin : xKoinCair,
          top: frame < mulaiCair ? (frame >= tibaDiTengah ? 385 : yKoin) : yKoinCair,
          transform: `translate(-50%, -50%) scale(${frame >= tibaDiTengah && frame < mulaiCair ? 0.75 : 1})`,
          opacity: frame < mulaiTerbang ? 0 : interpolate(frame, [tibaDiPetani - 6, tibaDiPetani], [1, 0], klem),
          zIndex: 40,
        }}
      >
        <IkonUang size={72} />
      </div>
    </div>
  );
};
