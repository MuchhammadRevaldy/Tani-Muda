import React from 'react';
import { useCurrentFrame } from 'remotion';
import { maju, pegas, EASE, ayun } from '../../v2/gerak';
import { IkonTani, type NamaIkonTani } from '../../v2/IkonTani';
import { HURUF, W } from '../../v2/tema';
import { DATA, rentangBahan, tgl } from '../data';
import { Judul, KartuGambar, Keterangan, KertasDokumen, PanggungDok, TeksKecil } from '../dasar';

/** Adegan Ide dan masalah, lalu Perencanaan [AG-52]. */

export const S01: React.FC<{ d: number }> = ({ d }) => {
  const kartu = [
    { src: 'dokumentasi/dok-prd.png', x: 930, y: 150, putar: -9 },
    { src: 'dokumentasi/papan-03-beranda-petani-desktop.png', x: 1240, y: 210, putar: 7 },
    { src: 'dokumentasi/ide.png', x: 960, y: 450, putar: 4 },
    { src: 'dokumentasi/phpmyadmin.png', x: 1290, y: 520, putar: -6 },
    { src: 'dokumentasi/sekarang-beranda-desktop.png', x: 1100, y: 330, putar: -2 },
  ];
  return (
    <PanggungDok durasi={d} latar="sawah" dari={{ zoom: 1.0, x: -20 }} ke={{ zoom: 1.08, x: 40 }} aksen={['daun', null, 'benih', null, 'sawi', 'tetes', 'matahari', null, 'koin']}>
      {() => (
        <>
          {kartu.map((k, i) => (
            <KartuGambar key={i} src={k.src} x={k.x} y={k.y} lebar={520} tinggi={330} putar={k.putar} masuk={4 + i * 7} z={i} />
          ))}
          <TeksKecil style={{ position: 'absolute', left: 120, top: 300, fontSize: 32, color: W.daun, fontWeight: 700 }}>Dokumentasi pembuatan Tani Muda</TeksKecil>
          <Judul frasa="Dari ide ke aplikasi" mulai={10} left={110} top={350} lebar={760} ukuran={110} rata="left" sorot={['aplikasi']} />
          <Keterangan mulai={30}>
            5–19 Oktober 2026 · {DATA.git.total} commit di git · semua bahan diambil dari repositori proyek
          </Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

export const S02: React.FC<{ d: number }> = ({ d }) => (
  <PanggungDok durasi={d} latar="sawah" dari={{ zoom: 1.04, x: 30 }} ke={{ zoom: 1.1, x: -20, y: 10 }} aksen={['benih', 'daun', null, null, null, null, 'tetes']}>
    {() => (
      <>
        <Judul frasa="Berawal dari empat ketidakpastian" mulai={6} left={100} top={170} lebar={820} ukuran={84} rata="left" sorot={['empat']} />
        <KertasDokumen dok="prd" keJudul="Latar Belakang Masalah" dariY={0} x={1020} y={130} lebar={760} tinggi={730} miring={-18} gulirMulai={6} gulirLama={45} judulBesar={{ x: 104, y: 520, lebar: 820, ukuran: 70 }} />
        <Keterangan>docs/prd-tani-muda.md · commit pertama {tgl(DATA.tanggalBahan.prd.awal)}</Keterangan>
      </>
    )}
  </PanggungDok>
);

const MASALAH: { ikon: NamaIkonTani; judul: string; isi: string }[] = [
  { ikon: 'benih', judul: 'Pengetahuan terbatas', isi: 'Pemula menanam dengan coba-coba.' },
  { ikon: 'koin', judul: 'Modal tidak terukur', isi: 'Tidak tahu berapa benih dan pupuk yang dibutuhkan.' },
  { ikon: 'tetes', judul: 'Jadwal perawatan terlupa', isi: 'Keterlambatan bisa menurunkan hasil.' },
  { ikon: 'keranjang', judul: 'Pasar tidak pasti', isi: 'Penjualan bergantung pada tengkulak.' },
];

export const S03: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  return (
    <PanggungDok durasi={d} latar="bedengan" dari={{ zoom: 1.08, x: -40 }} ke={{ zoom: 1.02, x: 40 }} aksen={[null, null, null, null, null, null, 'daun', 'sawi', null, null]}>
      {() => (
        <>
          <Judul frasa="Empat masalah petani muda" mulai={4} top={80} ukuran={84} sorot={['Empat']} />
          {MASALAH.map((m, i) => {
            const f0 = 15 + i * 15;
            const sp = pegas(frame, f0, i % 2 ? 'pantul' : 'lembut');
            const pIkon = maju(frame, f0, 24, EASE.keluar);
            return (
              <div
                key={m.judul}
                style={{
                  position: 'absolute',
                  left: 130 + i * 425,
                  top: 270,
                  width: 385,
                  height: 560,
                  borderRadius: 28,
                  background: W.putih,
                  boxShadow: '0 30px 50px rgba(46,53,71,0.18)',
                  transform: `translateY(${(1 - sp) * 500 + ayun(frame, i * 20, 8, 90 + i * 8)}px) rotate(${(1 - sp) * (i % 2 ? 10 : -10) + (i - 1.5) * 1.2}deg)`,
                  padding: '44px 34px',
                  boxSizing: 'border-box',
                  fontFamily: HURUF,
                }}
              >
                <IkonTani nama={m.ikon} ukuran={170} p={pIkon} />
                <div style={{ fontSize: 40, fontWeight: 800, color: W.daun, lineHeight: 1.1, marginTop: 34 }}>{m.judul}</div>
                <div style={{ fontSize: 28, color: W.teks, lineHeight: 1.35, marginTop: 18 }}>{m.isi}</div>
              </div>
            );
          })}
          <Keterangan mulai={20}>Ringkasan bagian Latar Belakang Masalah, docs/prd-tani-muda.md · {tgl(DATA.tanggalBahan.prd.awal)}</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

export const S04: React.FC<{ d: number }> = ({ d }) => (
  <PanggungDok durasi={d} latar="langit" dari={{ zoom: 1.02, x: -30 }} ke={{ zoom: 1.1, x: 30, y: -10 }} aksen={[null, null, null, 'koin', 'cangkul', 'benih', null, 'daun']}>
    {() => (
      <>
        <KertasDokumen dok="prd" keJudul="Kebutuhan Wajib (P0)" dariY={3000} x={150} y={140} lebar={760} tinggi={740} miring={18} gulirMulai={4} gulirLama={52} judulBesar={{ x: 1010, y: 560, lebar: 820, ukuran: 76 }} />
        <Judul frasa="Rencana ditulis sebelum kode" mulai={6} left={1010} top={200} lebar={700} ukuran={84} rata="left" sorot={['sebelum']} />
        <Keterangan kanan>docs/prd-tani-muda.md · {rentangBahan('prd')}</Keterangan>
      </>
    )}
  </PanggungDok>
);

export const S05: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const terakhir = Number(DATA.keputusanTerakhir.replace('D-', ''));
  const n = Math.max(1, Math.round(maju(frame, 6, 70, EASE.keluar) * terakhir));
  const sp = pegas(frame, 6, 'pantul');
  return (
    <PanggungDok durasi={d} latar="kota" dari={{ zoom: 1.05, x: 20 }} ke={{ zoom: 1.1, x: -30 }} aksen={['daun', 'tetes', null, null, null, null, 'benih']}>
      {() => (
        <>
          <Judul frasa={`${terakhir} keputusan tercatat`} mulai={4} left={100} top={130} lebar={900} ukuran={76} rata="left" sorot={[String(terakhir)]} />
          <div style={{ position: 'absolute', left: 100, top: 250, fontFamily: HURUF, fontWeight: 800, fontSize: 200, color: W.daun, transform: `scale(${0.6 + sp * 0.4})`, transformOrigin: '0 50%', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            D-{String(n).padStart(2, '0')}
          </div>
          <KertasDokumen dok="keputusan" keJudul="D-19." dariY={0} x={1030} y={130} lebar={740} tinggi={740} miring={-16} gulirMulai={4} gulirLama={70} judulBesar={{ x: 104, y: 560, lebar: 840, ukuran: 64 }} />
          <Keterangan>docs/keputusan.md · {rentangBahan('keputusan')}</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

export const S06: React.FC<{ d: number }> = ({ d }) => (
  <PanggungDok durasi={d} latar="bedengan" dari={{ zoom: 1.1, y: -10 }} ke={{ zoom: 1.03, x: -40 }} aksen={[null, null, null, 'cangkul', 'sawi', 'tomat', null, 'matahari']}>
    {() => (
      <>
        <KertasDokumen dok="rencana" keJudul="Tahap 1. Fondasi" dariY={0} x={160} y={150} lebar={740} tinggi={730} miring={16} gulirMulai={4} gulirLama={40} judulBesar={{ x: 1010, y: 540, lebar: 820, ukuran: 80 }} />
        <Judul frasa="Rencana kerja per tahap" mulai={6} left={1010} top={210} lebar={700} ukuran={84} rata="left" />
        <Keterangan kanan>docs/rencana-kerja.md · {rentangBahan('rencana')}</Keterangan>
      </>
    )}
  </PanggungDok>
);

export const S07: React.FC<{ d: number }> = ({ d }) => (
  <PanggungDok durasi={d} latar="kota" dari={{ zoom: 1.02, x: -30, y: 10 }} ke={{ zoom: 1.09, x: 20 }} aksen={['koin', null, 'keranjang', null, null, null, 'daun']}>
    {() => (
      <>
        <Judul frasa="Kontrak API sebelum backend" mulai={6} left={100} top={190} lebar={820} ukuran={84} rata="left" sorot={['API']} />
        <KertasDokumen dok="kontrak" keJudul="1.4 Galat" dariY={0} x={1030} y={140} lebar={740} tinggi={730} miring={-14} gulirMulai={4} gulirLama={44} judulBesar={{ x: 104, y: 560, lebar: 820, ukuran: 80 }} />
        <Keterangan>docs/kontrak-api.md · {rentangBahan('kontrak')}</Keterangan>
      </>
    )}
  </PanggungDok>
);
