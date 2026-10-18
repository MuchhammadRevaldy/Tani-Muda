import React from 'react';
import { Sequence, staticFile } from 'remotion';
import { ADEGAN_CONFIG, TOKEN_WARNA } from './konfigurasi';
import { AudioTerkontrol } from './komponen/AudioTerkontrol';
import { SapuanTransisi } from './komponen/SapuanTransisi';
import { Adegan01Pembuka } from './adegan/01-Pembuka';
import { Adegan02Data } from './adegan/02-Data';
import { Adegan03Masalah } from './adegan/03-Masalah';
import { Adegan04Solusi } from './adegan/04-Solusi';
import { Adegan05Hitung } from './adegan/05-Hitung';
import { Adegan06Rawat } from './adegan/06-Rawat';
import { Adegan07Jual } from './adegan/07-Jual';
import { Adegan08FiturPintar } from './adegan/08-FiturPintar';
import { Adegan09Bertahan } from './adegan/09-Bertahan';
import { Adegan10Penutup } from './adegan/10-Penutup';

export const KomposisiTeaser: React.FC = () => {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: TOKEN_WARNA.latarKrem,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
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

      {/* Kontrol Musik & Narasi dengan Ducking Dinamis */}
      <AudioTerkontrol />

      {/* 01. Pembuka (0 - 360) */}
      <Sequence from={ADEGAN_CONFIG[1].mulaiFrame} durationInFrames={ADEGAN_CONFIG[1].durasiFrame} name={ADEGAN_CONFIG[1].judul}>
        <Adegan01Pembuka />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[1].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.daunTua} />
      </Sequence>

      {/* 02. Data Sensus (360 - 810) */}
      <Sequence from={ADEGAN_CONFIG[2].mulaiFrame} durationInFrames={ADEGAN_CONFIG[2].durasiFrame} name={ADEGAN_CONFIG[2].judul}>
        <Adegan02Data />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[2].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.tanah} />
      </Sequence>

      {/* 03. Masalah Pertanian (810 - 1350) */}
      <Sequence from={ADEGAN_CONFIG[3].mulaiFrame} durationInFrames={ADEGAN_CONFIG[3].durasiFrame} name={ADEGAN_CONFIG[3].judul}>
        <Adegan03Masalah />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[3].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.daunTua} />
      </Sequence>

      {/* 04. Solusi Empat Pilar (1350 - 1740) */}
      <Sequence from={ADEGAN_CONFIG[4].mulaiFrame} durationInFrames={ADEGAN_CONFIG[4].durasiFrame} name={ADEGAN_CONFIG[4].judul}>
        <Adegan04Solusi />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[4].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.daunTerang} />
      </Sequence>

      {/* 05. Hitung Modal & BEP (1740 - 2400) */}
      <Sequence from={ADEGAN_CONFIG[5].mulaiFrame} durationInFrames={ADEGAN_CONFIG[5].durasiFrame} name={ADEGAN_CONFIG[5].judul}>
        <Adegan05Hitung />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[5].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.daunTua} />
      </Sequence>

      {/* 06. Rawat Tanaman Presisi (2400 - 2970) */}
      <Sequence from={ADEGAN_CONFIG[6].mulaiFrame} durationInFrames={ADEGAN_CONFIG[6].durasiFrame} name={ADEGAN_CONFIG[6].judul}>
        <Adegan06Rawat />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[6].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.tanah} />
      </Sequence>

      {/* 07. Jual Panen Pasti (2970 - 3780) */}
      <Sequence from={ADEGAN_CONFIG[7].mulaiFrame} durationInFrames={ADEGAN_CONFIG[7].durasiFrame} name={ADEGAN_CONFIG[7].judul}>
        <Adegan07Jual />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[7].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.daunTua} />
      </Sequence>

      {/* 08. Fitur Pintar Agrikultur (3780 - 4440) */}
      <Sequence from={ADEGAN_CONFIG[8].mulaiFrame} durationInFrames={ADEGAN_CONFIG[8].durasiFrame} name={ADEGAN_CONFIG[8].judul}>
        <Adegan08FiturPintar />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[8].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.daunTerang} />
      </Sequence>

      {/* 09. Bertahan & Gamifikasi (4440 - 4830) */}
      <Sequence from={ADEGAN_CONFIG[9].mulaiFrame} durationInFrames={ADEGAN_CONFIG[9].durasiFrame} name={ADEGAN_CONFIG[9].judul}>
        <Adegan09Bertahan />
        <SapuanTransisi mulaiFrame={ADEGAN_CONFIG[9].durasiFrame - 15} durasiFrame={15} warna={TOKEN_WARNA.daunTua} />
      </Sequence>

      {/* 10. Penutup & Identitas (4830 - 5100) */}
      <Sequence from={ADEGAN_CONFIG[10].mulaiFrame} durationInFrames={ADEGAN_CONFIG[10].durasiFrame} name={ADEGAN_CONFIG[10].judul}>
        <Adegan10Penutup />
      </Sequence>
    </div>
  );
};
