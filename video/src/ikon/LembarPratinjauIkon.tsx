import React from 'react';
import {
  IkonCuaca,
  IkonDaunUlat,
  IkonGembor,
  IkonGrafikTurun,
  IkonKalkulator,
  IkonKotakStok,
  IkonPetaniMuda,
  IkonRantai,
  IkonTimbangan,
  IkonTruk,
} from './koleksi-ikon';
import {
  IkonBelajar,
  IkonCentang,
  IkonChat,
  IkonKamera,
  IkonKebun,
  IkonKunci,
  IkonPanen,
  IkonPengukur,
  IkonPeta,
  IkonPin,
  IkonUang,
} from './IkonAplikasi';
import type { IkonProps } from './tipe';
import { WARNA_IKON } from './tipe';

interface ItemIkon {
  id: string;
  peran: string;
  Komp: React.FC<IkonProps>;
}

/** Ikon yang diambil apa adanya dari frontend/src/komponen/ikon.tsx. */
export const IKON_DARI_APLIKASI: ItemIkon[] = [
  { id: 'uang', peran: 'Uang muka, dana cair', Komp: IkonUang },
  { id: 'pin', peran: 'Peta petani sekitar', Komp: IkonPin },
  { id: 'panen', peran: 'Siklus Jual, harga panen', Komp: IkonPanen },
  { id: 'kamera', peran: 'Foto daun sakit', Komp: IkonKamera },
  { id: 'chat', peran: 'Asisten dan chat pembeli', Komp: IkonChat },
  { id: 'kebun', peran: 'Tunas pembuka', Komp: IkonKebun },
  { id: 'belajar', peran: 'Siklus Belajar', Komp: IkonBelajar },
  { id: 'kunci', peran: 'Dana ditahan', Komp: IkonKunci },
  { id: 'centang', peran: 'Tugas dan kiriman selesai', Komp: IkonCentang },
  { id: 'pengukur', peran: 'Cek pH', Komp: IkonPengukur },
  { id: 'peta', peran: 'Peta Jawa Tengah', Komp: IkonPeta },
];

/** Ikon yang digambar khusus untuk video karena tidak ada di aplikasi. */
export const IKON_BUATAN_VIDEO: ItemIkon[] = [
  { id: 'kalkulator', peran: 'Siklus Hitung', Komp: IkonKalkulator },
  { id: 'gembor', peran: 'Siklus Rawat', Komp: IkonGembor },
  { id: 'timbangan', peran: 'Bobot panen', Komp: IkonTimbangan },
  { id: 'grafik-turun', peran: 'Harga jatuh', Komp: IkonGrafikTurun },
  { id: 'daun-ulat', peran: 'Hama', Komp: IkonDaunUlat },
  { id: 'rantai', peran: 'Rantai perantara', Komp: IkonRantai },
  { id: 'truk', peran: 'Panen tanpa tujuan', Komp: IkonTruk },
  { id: 'cuaca', peran: 'Prakiraan cuaca', Komp: IkonCuaca },
  { id: 'kotak-stok', peran: 'Stok siap jual', Komp: IkonKotakStok },
  { id: 'petani-muda', peran: 'Data petani muda', Komp: IkonPetaniMuda },
];

const Kelompok: React.FC<{ judul: string; keterangan: string; daftar: ItemIkon[] }> = ({ judul, keterangan, daftar }) => (
  <div style={{ marginBottom: 34 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 16 }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: WARNA_IKON.daunTua }}>{judul}</div>
      <div style={{ fontSize: 18, color: WARNA_IKON.teksPudar }}>{keterangan}</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 14 }}>
      {daftar.map(({ id, peran, Komp }) => (
        <div
          key={id}
          style={{
            backgroundColor: WARNA_IKON.latarPutih,
            border: '1.5px solid #eae3d7',
            borderRadius: 14,
            padding: '18px 8px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Komp size={72} />
          <div style={{ fontSize: 16, fontWeight: 800, color: WARNA_IKON.daunTua, marginTop: 10 }}>{id}</div>
          <div style={{ fontSize: 13, color: WARNA_IKON.teksPudar, marginTop: 2, lineHeight: 1.3 }}>{peran}</div>
        </div>
      ))}
    </div>
  </div>
);

export const LembarPratinjauIkon: React.FC = () => (
  <div
    style={{
      width: 1920,
      height: 1080,
      backgroundColor: WARNA_IKON.latarKrem,
      padding: '56px 70px',
      boxSizing: 'border-box',
      fontFamily: "'Outfit', sans-serif",
    }}
  >
    <div style={{ fontSize: 44, fontWeight: 800, color: WARNA_IKON.daunTua, marginBottom: 6 }}>Ikon teaser Tani Muda</div>
    <div style={{ fontSize: 20, color: WARNA_IKON.teksPudar, marginBottom: 40 }}>
      Garis setara 1,7 pada grid 24, ujung membulat, dua warna token. Setiap bagian path terpisah untuk animasi.
    </div>
    <Kelompok
      judul="Dari aplikasi"
      keterangan="salinan apa adanya dari frontend/src/komponen/ikon.tsx, diperiksa otomatis"
      daftar={IKON_DARI_APLIKASI}
    />
    <Kelompok
      judul="Buatan video"
      keterangan="tidak ada padanannya di aplikasi"
      daftar={IKON_BUATAN_VIDEO}
    />
  </div>
);
