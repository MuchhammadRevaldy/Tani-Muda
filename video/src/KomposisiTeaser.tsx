import React from 'react';
import { Sequence, staticFile } from 'remotion';
import { TOKEN_WARNA } from './konfigurasi';
import type { Linimasa } from './linimasa';
import { AudioTerkontrol } from './komponen/AudioTerkontrol';
import { SapuanTransisi } from './komponen/SapuanTransisi';
import { SubtitelNarasi } from './komponen/SubtitelVideo';
import { PenyediaWaktuNarasi } from './komponen/WaktuNarasi';
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

export const KOMPONEN_ADEGAN: Record<string, React.FC> = {
  '01': Adegan01Pembuka,
  '02': Adegan02Data,
  '03': Adegan03Masalah,
  '04': Adegan04Solusi,
  '05': Adegan05Hitung,
  '06': Adegan06Rawat,
  '07': Adegan07Jual,
  '08': Adegan08FiturPintar,
  '09': Adegan09Bertahan,
  '10': Adegan10Penutup,
};

const WARNA_SAPUAN = [TOKEN_WARNA.daunTua, TOKEN_WARNA.tanah, TOKEN_WARNA.daunTerang];
const DURASI_SAPUAN = 15;

export interface PropsTeaser {
  linimasa: Linimasa;
  [kunci: string]: unknown;
}

export const KomposisiTeaser: React.FC<PropsTeaser> = ({ linimasa }) => {
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

      <AudioTerkontrol linimasa={linimasa} />

      {linimasa.adegan.map((a, i) => {
        const Adegan = KOMPONEN_ADEGAN[a.id];
        const terakhir = i === linimasa.adegan.length - 1;
        return (
          <Sequence key={a.id} from={a.mulaiFrame} durationInFrames={a.durasiFrame} name={`${a.id}. ${a.judul}`}>
            <PenyediaWaktuNarasi adegan={a}>
              <Adegan />
            </PenyediaWaktuNarasi>
            {!terakhir && (
              <SapuanTransisi
                mulaiFrame={a.durasiFrame - DURASI_SAPUAN}
                durasiFrame={DURASI_SAPUAN}
                warna={WARNA_SAPUAN[i % WARNA_SAPUAN.length]}
              />
            )}
          </Sequence>
        );
      })}

      {/* Subtitel di lapisan teratas, mengikuti waktu tiap kalimat narasi. */}
      {linimasa.adegan.map((a) => (
        <Sequence
          key={`subtitel-${a.id}`}
          from={a.mulaiFrame + a.awalNarasiFrame}
          durationInFrames={Math.max(1, a.durasiFrame - a.awalNarasiFrame)}
          name={`Subtitel ${a.id}`}
          layout="none"
        >
          <SubtitelNarasi kalimat={a.kalimat} />
        </Sequence>
      ))}
    </div>
  );
};
