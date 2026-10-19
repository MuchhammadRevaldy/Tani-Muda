import React from 'react';
import { Composition } from 'remotion';
import { Dokumentasi, ShotDokumentasi } from './dokumentasi/Komposisi';
import { SHOT_DOK, TOTAL_FRAME_DOK } from './dokumentasi/linimasa';
import { KomponenShot, TeaserV2 } from './v2/Komposisi';
import { SHOT, TOTAL_FRAME } from './v2/linimasa';
import { FPS, LEBAR, TINGGI } from './v2/tema';

/**
 * Komposisi teaser [AG-45]: satu kalimat narasi = satu shot, linimasa dari
 * src/data/waktu-kalimat.json (rekaman suara pemilik produk).
 * `Shot-AA-K` dipakai untuk lembar kontak (scripts/lembar-kontak.mjs).
 * `Dokumentasi` [AG-52]: video proses pembuatan; `Dok-NN` per shot untuk lembar kontaknya.
 */
export const Root: React.FC = () => (
  <>
    <Composition id="TeaserTaniMuda" component={TeaserV2} durationInFrames={TOTAL_FRAME} fps={FPS} width={LEBAR} height={TINGGI} />
    {SHOT.map((s) => (
      <Composition
        key={s.id}
        id={`Shot-${s.id.replace('.', '-')}`}
        component={KomponenShot}
        durationInFrames={s.durasiFrame}
        fps={FPS}
        width={LEBAR}
        height={TINGGI}
        defaultProps={{ shot: s }}
      />
    ))}
    <Composition id="Dokumentasi" component={Dokumentasi} durationInFrames={TOTAL_FRAME_DOK} fps={FPS} width={LEBAR} height={TINGGI} />
    {SHOT_DOK.map((s) => (
      <Composition key={`dok-${s.id}`} id={`Dok-${s.id}`} component={ShotDokumentasi} durationInFrames={s.durasiFrame} fps={FPS} width={LEBAR} height={TINGGI} defaultProps={{ shot: s }} />
    ))}
  </>
);
