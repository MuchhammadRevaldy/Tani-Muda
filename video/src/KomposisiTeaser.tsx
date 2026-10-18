import React from 'react';
import { Sequence, staticFile } from 'remotion';
import { ADEGAN } from './konfigurasi';
import { AudioTerkontrol } from './komponen/AudioTerkontrol';
import { AdeganPembuka } from './adegan/01-Pembuka';
import { AdeganMasalah } from './adegan/02-Masalah';
import { AdeganSolusi } from './adegan/03-Solusi';
import { AdeganHitung } from './adegan/04-Hitung';
import { AdeganRawat } from './adegan/05-Rawat';
import { AdeganJual } from './adegan/06-Jual';
import { AdeganFiturPintar } from './adegan/07-FiturPintar';
import { AdeganPetaniBertahan } from './adegan/08-PetaniBertahan';
import { AdeganPenutup } from './adegan/09-Penutup';

export const KomposisiTeaser: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#081c15',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Definisi Font Outfit Lokal */}
      <style>
        {`
          @font-face {
            font-family: 'Outfit';
            font-style: normal;
            font-weight: 400 900;
            font-display: swap;
            src: url('${staticFile('fonts/outfit-latin.woff2')}') format('woff2');
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>

      {/* Kontrol Audio (Narasi + Musik dengan Ducking) */}
      <AudioTerkontrol />

      {/* Adegan 1: Pembuka (0 - 12 detik | 0 - 360 frame) */}
      <Sequence
        from={ADEGAN.pembuka.mulaiFrame}
        durationInFrames={ADEGAN.pembuka.durasiFrame}
        name={ADEGAN.pembuka.judul}
      >
        <AdeganPembuka />
      </Sequence>

      {/* Adegan 2: Masalah (12 - 30 detik | 360 - 900 frame) */}
      <Sequence
        from={ADEGAN.masalah.mulaiFrame}
        durationInFrames={ADEGAN.masalah.durasiFrame}
        name={ADEGAN.masalah.judul}
      >
        <AdeganMasalah />
      </Sequence>

      {/* Adegan 3: Solusi 4 Pilar (30 - 42 detik | 900 - 1260 frame) */}
      <Sequence
        from={ADEGAN.solusi.mulaiFrame}
        durationInFrames={ADEGAN.solusi.durasiFrame}
        name={ADEGAN.solusi.judul}
      >
        <AdeganSolusi />
      </Sequence>

      {/* Adegan 4: Hitung Modal & BEP (42 - 65 detik | 1260 - 1950 frame) */}
      <Sequence
        from={ADEGAN.hitung.mulaiFrame}
        durationInFrames={ADEGAN.hitung.durasiFrame}
        name={ADEGAN.hitung.judul}
      >
        <AdeganHitung />
      </Sequence>

      {/* Adegan 5: Rawat Tanaman Presisi (65 - 85 detik | 1950 - 2550 frame) */}
      <Sequence
        from={ADEGAN.rawat.mulaiFrame}
        durationInFrames={ADEGAN.rawat.durasiFrame}
        name={ADEGAN.rawat.judul}
      >
        <AdeganRawat />
      </Sequence>

      {/* Adegan 6: Jual Panen Pasti (85 - 115 detik | 2550 - 3450 frame) */}
      <Sequence
        from={ADEGAN.jual.mulaiFrame}
        durationInFrames={ADEGAN.jual.durasiFrame}
        name={ADEGAN.jual.judul}
      >
        <AdeganJual />
      </Sequence>

      {/* Adegan 7: Fitur Pintar AI & IoT (115 - 145 detik | 3450 - 4350 frame) */}
      <Sequence
        from={ADEGAN.fiturPintar.mulaiFrame}
        durationInFrames={ADEGAN.fiturPintar.durasiFrame}
        name={ADEGAN.fiturPintar.judul}
      >
        <AdeganFiturPintar />
      </Sequence>

      {/* Adegan 8: Petani Bertahan & Gamifikasi (145 - 160 detik | 4350 - 4800 frame) */}
      <Sequence
        from={ADEGAN.petaniBertahan.mulaiFrame}
        durationInFrames={ADEGAN.petaniBertahan.durasiFrame}
        name={ADEGAN.petaniBertahan.judul}
      >
        <AdeganPetaniBertahan />
      </Sequence>

      {/* Adegan 9: Penutup & Identitas Peserta (160 - 170 detik | 4800 - 5100 frame) */}
      <Sequence
        from={ADEGAN.penutup.mulaiFrame}
        durationInFrames={ADEGAN.penutup.durasiFrame}
        name={ADEGAN.penutup.judul}
      >
        <AdeganPenutup />
      </Sequence>
    </div>
  );
};
