import React from 'react';
import { useCurrentFrame } from 'remotion';
import { antara, EASE, maju, pegas } from '../../v2/gerak';
import { HURUF, W } from '../../v2/tema';
import { DATA, tgl } from '../data';
import { Gores, IsiLayar, Judul, Keterangan, Laptop, PanggungDok } from '../dasar';

/**
 * Adegan Flowchart [AG-52]: langkah dari tabel "Alur" docs/naskah-demo.md digambar
 * berurutan, titik cahaya menelusuri panah, lalu kamera masuk ke satu kotak dan
 * potong-cocok ke layar aplikasi aslinya.
 */

export const LANGKAH = [
  { judul: 'Halaman depan', akun: 'belum masuk' },
  { judul: 'Daftar petani baru', akun: 'Rina (baru)' },
  { judul: 'Beranda', akun: 'Arif' },
  { judul: 'Rencana dan modal', akun: 'Arif' },
  { judul: 'Jadwal dan pengukuran', akun: 'Arif' },
  { judul: 'Mengambil pesanan', akun: 'Arif' },
  { judul: 'Pindah ke pembeli', akun: 'Bu Imas' },
  { judul: 'Pesanan dan uang muka', akun: 'Imas' },
  { judul: 'Konfirmasi kiriman', akun: 'Imas' },
  { judul: 'Penutup', akun: 'Imas' },
];

const KW = 340;
const KH = 190;
const POS = [
  { x: 230, y: 330 },
  { x: 595, y: 700 },
  { x: 960, y: 330 },
  { x: 1325, y: 700 },
  { x: 1690, y: 330 },
];
const JEDA = 21;

function lengkung(a: { x: number; y: number }, b: { x: number; y: number }) {
  const x1 = a.x + KW / 2 - 10;
  const x2 = b.x - KW / 2 + 10;
  const mx = (x1 + x2) / 2;
  return { d: `M${x1} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${x2} ${b.y}`, x1, x2, mx, y1: a.y, y2: b.y };
}

function titikBezier(t: number, l: ReturnType<typeof lengkung>) {
  const u = 1 - t;
  const x = u * u * u * l.x1 + 3 * u * u * t * l.mx + 3 * u * t * t * l.mx + t * t * t * l.x2;
  const y = u * u * u * l.y1 + 3 * u * u * t * l.y1 + 3 * u * t * t * l.y2 + t * t * t * l.y2;
  return { x, y };
}

export const KotakAlur: React.FC<{ n: number; judul: string; akun: string; p: number; aktif?: number; style?: React.CSSProperties }> = ({ n, judul, akun, p, aktif = 0, style }) => {
  const garis = `M${18} 2 L${KW - 18} 2 Q${KW - 2} 2 ${KW - 2} 18 L${KW - 2} ${KH - 18} Q${KW - 2} ${KH - 2} ${KW - 18} ${KH - 2} L18 ${KH - 2} Q2 ${KH - 2} 2 ${KH - 18} L2 18 Q2 2 18 2 Z`;
  const isi = Math.max(0, (p - 0.5) * 2);
  return (
    <div style={{ position: 'absolute', width: KW, height: KH, ...style }}>
      <div style={{ position: 'absolute', inset: 2, borderRadius: 16, background: aktif > 0 ? W.daunLembut : W.putih, opacity: isi, boxShadow: `0 ${18 * isi}px ${30 * isi}px rgba(46,53,71,0.18)` }} />
      <Gores d={garis} p={Math.min(1, p * 1.8)} lebar={KW} tinggi={KH} warna={W.daun} tebal={4} />
      <div style={{ position: 'absolute', inset: 0, padding: '22px 24px', boxSizing: 'border-box', fontFamily: HURUF, opacity: isi }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: W.limauTekan }}>{n}</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: W.teks, lineHeight: 1.1, marginTop: 4 }}>{judul}</div>
        <div style={{ fontSize: 22, color: W.teksPendukung, marginTop: 8 }}>akun: {akun}</div>
      </div>
    </div>
  );
};

/** Lima kotak alur mulai `awal`; kamera masuk ke kotak `masuk` di akhir shot. */
const BaganAlur: React.FC<{ d: number; awal: number; masuk: number }> = ({ d, awal, masuk }) => {
  const frame = useCurrentFrame();
  const tz = maju(frame, d - 32, 30, EASE.tajam);
  const target = POS[masuk];
  const zoom = antara(tz, 1, 2.2);
  // titik cahaya: menelusuri panah ke kotak yang sedang digambar
  const majuTitik = Math.min(4, Math.max(0, (frame - 8) / JEDA));
  const seg = Math.min(3, Math.floor(majuTitik));
  const pt = titikBezier(Math.min(1, majuTitik - seg), lengkung(POS[seg], POS[seg + 1]));
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${(960 - target.x) * tz}px, ${(540 - target.y) * tz}px) scale(${zoom})`, transformOrigin: `${target.x}px ${target.y}px` }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {POS.slice(0, -1).map((a, i) => {
          const l = lengkung(a, POS[i + 1]);
          const p = maju(frame, 8 + i * JEDA + 6, JEDA - 4, EASE.halus);
          return (
            <g key={i}>
              <Gores d={l.d} p={p} lebar={1920} tinggi={1080} warna={W.daun} tebal={5} />
              {p >= 1 && <path d={`M${l.x2 - 16} ${l.y2 - 10} L${l.x2} ${l.y2} L${l.x2 - 16} ${l.y2 + 10}`} fill="none" stroke={W.daun} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
            </g>
          );
        })}
      </svg>
      {POS.map((pos, i) => {
        const p = maju(frame, i * JEDA, 20, EASE.keluar);
        const sp = pegas(frame, i * JEDA, 'pantul');
        const l = LANGKAH[awal + i];
        return <KotakAlur key={i} n={awal + i + 1} judul={l.judul} akun={l.akun} p={p} aktif={i === masuk ? tz : 0} style={{ left: pos.x - KW / 2, top: pos.y - KH / 2, transform: `scale(${0.85 + sp * 0.15})` }} />;
      })}
      {frame < 8 + 4 * JEDA + 10 && (
        <div style={{ position: 'absolute', left: pt.x - 14, top: pt.y - 14, width: 28, height: 28, borderRadius: 14, background: W.matahari, boxShadow: `0 0 24px 10px ${W.matahariLembut}` }} />
      )}
    </div>
  );
};

const BAHAN_ALUR = `docs/naskah-demo.md, tabel Alur · dibuat ${tgl(DATA.tanggalBahan.naskahDemo.awal, true)}, dibekukan 15 Okt 2026 (AG-34)`;

export const S13: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  return (
  <PanggungDok durasi={d} latar="langit" dari={{ zoom: 1.0 }} ke={{ zoom: 1.04, x: 20 }} aksen={['daun', null, null, null, null, null, 'benih', 'sawi']}>
    {() => (
      <>
        <BaganAlur d={d} awal={0} masuk={3} />
        <div style={{ opacity: 1 - maju(frame, d - 34, 14) }}>
          <Judul frasa="Alur demo tujuh menit" mulai={4} top={50} ukuran={76} sorot={['tujuh']} />
        </div>
        <Keterangan>{BAHAN_ALUR}</Keterangan>
      </>
    )}
  </PanggungDok>
  );
};

export const S15: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  return (
  <PanggungDok durasi={d} latar="kota" dari={{ zoom: 1.0, x: 20 }} ke={{ zoom: 1.04, x: -20 }} aksen={['keranjang', null, null, null, null, null, 'koin', 'tomat']}>
    {() => (
      <>
        <BaganAlur d={d} awal={5} masuk={0} />
        <div style={{ opacity: 1 - maju(frame, d - 34, 14) }}>
          <Judul frasa="Lalu giliran pembeli" mulai={4} top={50} ukuran={76} sorot={['pembeli']} />
        </div>
        <Keterangan>{BAHAN_ALUR}</Keterangan>
      </>
    )}
  </PanggungDok>
  );
};

/** Potong-cocok: kotak alur (ukuran saat diperbesar) melebar menjadi layar laptop. */
const KotakJadiLayar: React.FC<{ d: number; n: number; src: string; judul: string; keterangan: string }> = ({ d, n, src, judul, keterangan }) => {
  const frame = useCurrentFrame();
  const lebar = 1100;
  const tinggi = lebar / 1.6;
  const t = maju(frame, 0, 16, EASE.keluar);
  const kw = KW * 2.2;
  const kh = KH * 2.2;
  const w = antara(t, kw, lebar);
  const h = antara(t, kh, tinggi);
  const tampilLaptop = frame >= 14;
  const l = LANGKAH[n - 1];
  return (
    <PanggungDok durasi={d} latar={n === 4 ? 'langit' : 'kota'} dari={{ zoom: 1.0 }} ke={{ zoom: 1.06, x: 25 }} aksen={['daun', null, null, null, null, null, 'benih']}>
      {() => (
        <>
          {tampilLaptop ? (
            <Laptop x={(1920 - lebar) / 2 - 18} y={240} lebar={lebar} miring={-5} masuk={-40}>
              <IsiLayar src={src} lebarGambar={1440} tinggiGambar={900} lebar={lebar} tinggi={tinggi} titik={[{ f: 0, x: 0.5, y: 0.5, zoom: 1.05 }, { f: d, x: 0.55, y: 0.45, zoom: 1.25 }]} />
            </Laptop>
          ) : (
            <div style={{ position: 'absolute', left: 960 - w / 2, top: 540 - h / 2, width: w, height: h, borderRadius: 16, overflow: 'hidden', background: W.daunLembut, border: `${antara(t, 10, 4)}px solid ${W.daun}` }}>
              <div style={{ position: 'absolute', inset: 0, opacity: t }}>
                <IsiLayar src={src} lebarGambar={1440} tinggiGambar={900} lebar={w} tinggi={h} />
              </div>
              <div style={{ position: 'absolute', inset: 0, padding: 50, fontFamily: HURUF, opacity: 1 - t * 1.6 }}>
                <div style={{ fontSize: 53, fontWeight: 700, color: W.limauTekan }}>{n}</div>
                <div style={{ fontSize: 74, fontWeight: 800, color: W.teks }}>{l.judul}</div>
              </div>
            </div>
          )}
          <Judul frasa={judul} mulai={10} top={60} ukuran={80} />
          <Keterangan mulai={14}>{keterangan}</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

export const S14: React.FC<{ d: number }> = ({ d }) => (
  <KotakJadiLayar d={d} n={4} src="dokumentasi/sekarang-hitung-desktop.png" judul="Langkah 4 di aplikasi" keterangan={`Halaman Hitung, build demo versi sekarang · ${tgl(DATA.aplikasi?.sekarang.tanggal)}`} />
);

export const S16: React.FC<{ d: number }> = ({ d }) => (
  <KotakJadiLayar d={d} n={6} src="dokumentasi/sekarang-jual-desktop.png" judul="Langkah 6 di aplikasi" keterangan={`Halaman Pesanan, build demo versi sekarang · ${tgl(DATA.aplikasi?.sekarang.tanggal)}`} />
);
