import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { acak, antara, ayun, EASE, kamera as hitungKamera, maju, pegas, type Kamera } from '../v2/gerak';
import type { NamaIkonTani } from '../v2/IkonTani';
import { Latar, type JenisLatar } from '../v2/Latar';
import { IkonTani } from '../v2/IkonTani';
import { JudulKata, type KataJudul } from '../v2/Panggung';
import { HURUF, W } from '../v2/tema';
import { DATA, judulDokumen, type KunciDokumen } from './data';

/**
 * Bagian bersama video dokumentasi [AG-52]: panggung berlapis (latar paralaks, objek utama,
 * ikon tani melayang), judul per kata, keterangan sumber, kertas dokumen 3D, laptop, HP,
 * dan kotak sorot yang digambar. Primitif teaser (src/v2) hanya dipakai, tidak diubah.
 */

// ---------------------------------------------------------------- panggung

/**
 * Tempat ikon tani melayang di tepi layar saja, supaya tidak menutupi judul, kertas, atau
 * layar (berbeda dengan teaser yang menaruhnya lebih ke tengah).
 */
const SLOT_TEPI = [
  { x: 60, y: 90 },
  { x: 1860, y: 80 },
  { x: 40, y: 560 },
  { x: 1880, y: 520 },
  { x: 250, y: 860 },
  { x: 1700, y: 870 },
  { x: 930, y: 30 },
  { x: 1880, y: 300 },
];

const AksenTepi: React.FC<{ ikon: (NamaIkonTani | null)[]; k: Kamera }> = ({ ikon, k }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {ikon.map((nama, i) => {
        if (!nama) return null;
        const slot = SLOT_TEPI[i % SLOT_TEPI.length];
        const dalam = 0.5 + acak(i + 17) * 0.9;
        const ukuran = 56 + dalam * 44;
        const sp = pegas(frame, i * 3, 'pantul');
        const x = slot.x - k.x * dalam * 0.9;
        const y = slot.y - k.y * dalam * 0.9 + ayun(frame, i * 23, 10 + dalam * 6, 70 + i * 9);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - ukuran / 2,
              top: y - ukuran / 2,
              transform: `scale(${sp}) rotate(${ayun(frame, i * 31, 10, 120 + i * 11)}deg)`,
              opacity: 0.6 + dalam * 0.25,
              filter: dalam < 0.75 ? 'blur(1.5px)' : undefined,
            }}
          >
            <IkonTani nama={nama} ukuran={ukuran} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const PanggungDok: React.FC<{
  durasi: number;
  latar: JenisLatar;
  dari?: Partial<Kamera>;
  ke?: Partial<Kamera>;
  aksen?: (NamaIkonTani | null)[];
  senja?: number;
  horizon?: number;
  children?: (k: Kamera) => React.ReactNode;
  atas?: React.ReactNode;
}> = ({ durasi, latar, dari = { zoom: 1.03 }, ke = { zoom: 1.09, x: 30 }, aksen = ['daun', 'koin', 'tetes', 'benih', 'sawi', 'matahari'], senja, horizon, children, atas }) => {
  const frame = useCurrentFrame();
  const k = hitungKamera(frame, durasi, dari, ke);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: W.langit, fontFamily: HURUF }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + (k.zoom - 1) * 0.35})`, transformOrigin: '50% 60%' }}>
        <Latar jenis={latar} kamera={k} senja={senja} horizon={horizon ?? 150} />
      </div>
      <AksenTepi ikon={aksen} k={k} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${-k.x * 0.7}px, ${-k.y * 0.7}px) scale(${k.zoom}) rotate(${k.putar}deg)`,
          transformOrigin: '50% 55%',
        }}
      >
        {children?.(k)}
      </div>
      {atas}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- teks

/** Kata-kata judul muncul berurutan mulai `mulai`, `jeda` frame per kata. */
export function kata(frasa: string, mulai = 6, jeda = 5, sorot: string[] = []): KataJudul[] {
  return frasa.split(' ').map((teks, i) => ({ teks, f: mulai + i * jeda, warna: sorot.includes(teks) ? W.oranye : undefined }));
}

export const Judul: React.FC<{ frasa: string; mulai?: number; sorot?: string[]; top?: number; left?: number; lebar?: number; ukuran?: number; rata?: 'center' | 'left' }> = ({
  frasa,
  mulai = 6,
  sorot = [],
  top = 70,
  left,
  lebar = 1700,
  ukuran = 76,
  rata = 'center',
}) => <JudulKata kata={kata(frasa, mulai, 5, sorot)} top={top} left={left} lebar={lebar} ukuran={ukuran} rata={rata} />;

/** Keterangan sumber dan tanggal: teks kecil tanpa kotak, di atas pita tanggal. */
export const Keterangan: React.FC<{ children: React.ReactNode; mulai?: number; kanan?: boolean; top?: number }> = ({ children, mulai = 10, kanan, top = 915 }) => {
  const frame = useCurrentFrame();
  const t = maju(frame, mulai, 14, EASE.keluar);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: kanan ? undefined : 70,
        right: kanan ? 70 : undefined,
        fontFamily: HURUF,
        fontSize: 25,
        fontWeight: 500,
        color: W.teks,
        opacity: t * 0.85,
        transform: `translateY(${(1 - t) * 14}px)`,
        textShadow: '0 0 3px #fff, 0 0 8px #fff, 0 0 16px rgba(255,255,255,0.9)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- garis sorot

/** Garis/kotak digambar dengan evolvePath; `p` 0→1. */
export const Gores: React.FC<{ d: string; p: number; warna?: string; tebal?: number; lebar: number; tinggi: number; style?: React.CSSProperties }> = ({
  d,
  p,
  warna = W.oranye,
  tebal = 6,
  lebar,
  tinggi,
  style,
}) => {
  if (p <= 0) return null;
  const dash = p < 1 ? evolvePath(Math.min(1, p), d) : {};
  return (
    <svg width={lebar} height={tinggi} viewBox={`0 0 ${lebar} ${tinggi}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style }}>
      <path d={d} fill="none" stroke={warna} strokeWidth={tebal} strokeLinecap="round" strokeLinejoin="round" {...dash} />
    </svg>
  );
};

/** Kotak tangan (sedikit goyang) di sekitar x,y,w,h. */
export function jalurKotak(x: number, y: number, w: number, h: number, benih = 1) {
  const g = (n: number) => (acak(benih * 7 + n) - 0.5) * 10;
  return `M${x + 14 + g(1)} ${y + g(2)} L${x + w + g(3)} ${y + 6 + g(4)} L${x + w - 4 + g(5)} ${y + h + g(6)} L${x + g(7)} ${y + h - 4 + g(8)} Z M${x + 14 + g(1)} ${y + g(2)} L${x + 60} ${y - 3}`;
}

/** Garis bawah bergelombang sepanjang w. */
export function jalurGarisBawah(x: number, y: number, w: number) {
  return `M${x} ${y} C ${x + w * 0.3} ${y - 9}, ${x + w * 0.6} ${y + 9}, ${x + w} ${y - 3}`;
}

/** Centang yang digambar. */
export const Centang: React.FC<{ p: number; ukuran?: number; warna?: string }> = ({ p, ukuran = 90, warna = W.limauTekan }) => (
  <svg width={ukuran} height={ukuran} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
    {p > 0 && <circle cx="50" cy="50" r="44" fill={W.daunLembut} stroke={warna} strokeWidth="7" {...(p < 0.5 ? evolvePath(p * 2, 'M50 6 A44 44 0 1 1 49.9 6') : {})} />}
    {p > 0.45 && <path d="M28 52 L44 68 L74 34" fill="none" stroke={warna} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" {...(p < 1 ? evolvePath(Math.min(1, (p - 0.45) / 0.55), 'M28 52 L44 68 L74 34') : {})} />}
  </svg>
);

// ---------------------------------------------------------------- kertas dokumen 3D

/**
 * Halaman dokumen asli (PNG hasil render docs/*.md) di bingkai kertas miring 3D. Kertas
 * menggulir dari `dariJudul` ke `keJudul`; saat tiba, judul itu dibesarkan keluar dari kertas
 * dan diberi garis sorot yang digambar.
 */
export const KertasDokumen: React.FC<{
  dok: KunciDokumen;
  keJudul: string;
  dariY?: number;
  x: number;
  y: number;
  lebar?: number;
  tinggi?: number;
  miring?: number;
  gulirMulai?: number;
  gulirLama?: number;
  sorotMulai?: number;
  judulBesar?: { x: number; y: number; lebar: number; ukuran?: number };
  teksBesar?: string;
}> = ({ dok, keJudul, dariY, x, y, lebar = 760, tinggi = 700, miring = -16, gulirMulai = 4, gulirLama = 50, sorotMulai, judulBesar, teksBesar }) => {
  const frame = useCurrentFrame();
  const d = DATA.dokumen[dok];
  const j = judulDokumen(dok, keJudul);
  const skala = lebar / d.lebar;
  const tujuan = Math.max(0, j.y - 110);
  const awal = dariY ?? Math.max(0, tujuan - 2600);
  const gulir = antara(maju(frame, gulirMulai, gulirLama, EASE.tajam), awal, tujuan) + frame * 0.6;
  const masuk = pegas(frame, 0, 'berat');
  const ry = miring + ayun(frame, 0, 2.5, 140);
  const rx = 7 + ayun(frame, 30, 1.5, 170);
  const sm = sorotMulai ?? gulirMulai + gulirLama - 4;
  const pSorot = maju(frame, sm, 16, EASE.keluar);
  const sp = pegas(frame, sm + 4, 'pantul');
  const yJudulDiKertas = (j.y - gulir) * skala;
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: y, width: lebar, height: tinggi, perspective: 1800 }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transform: `translateY(${(1 - masuk) * 500}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${miring > 0 ? 1.5 : -1.5}deg)`,
          }}
        >
          {[3, 2, 1].map((n) => (
            <div key={n} style={{ position: 'absolute', inset: 0, borderRadius: 10, background: n === 3 ? '#E3DCCB' : '#EFE9DA', transform: `translateZ(${-n * 5}px) translate(${n * 4}px, ${n * 5}px)`, boxShadow: n === 3 ? '0 40px 70px rgba(46,53,71,0.28)' : undefined }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 10, overflow: 'hidden', background: W.kertas, transform: 'translateZ(1px)' }}>
            <Img src={staticFile(d.gambar)} style={{ position: 'absolute', left: 0, top: -gulir * skala, width: lebar }} />
            {/* stabilo digambar di atas judul tujuan */}
            <div style={{ position: 'absolute', left: 54 * skala, top: yJudulDiKertas - 6, height: j.tinggi * skala + 12, width: (lebar - 120 * skala) * pSorot, background: W.matahari, opacity: 0.32, borderRadius: 6, mixBlendMode: 'multiply' }} />
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(120,100,60,0.12)' }} />
          </div>
        </div>
      </div>
      {judulBesar && (
        <div style={{ position: 'absolute', left: judulBesar.x, top: judulBesar.y, width: judulBesar.lebar, transform: `scale(${0.6 + sp * 0.4}) rotate(${(1 - sp) * -4}deg)`, transformOrigin: '0 50%', opacity: Math.min(1, sp * 1.5) }}>
          <div style={{ fontFamily: HURUF, fontWeight: 800, fontSize: judulBesar.ukuran ?? 64, lineHeight: 1.08, color: W.daun, textShadow: '0 3px 0 rgba(255,255,255,0.7)' }}>{teksBesar ?? j.teks}</div>
          <Gores d={jalurGarisBawah(0, 14, judulBesar.lebar * 0.9)} p={maju(frame, sm + 10, 16, EASE.keluar)} lebar={judulBesar.lebar} tinggi={30} tebal={8} style={{ position: 'relative' }} />
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- laptop

export interface TitikKamera {
  f: number;
  /** pusat pandang 0..1 dalam gambar */
  x: number;
  y: number;
  zoom: number;
}

/** Posisi kamera di dalam layar pada frame tertentu (dengan easing antar titik). */
function kameraLayar(frame: number, titik: TitikKamera[]) {
  if (!titik.length) return { x: 0.5, y: 0.5, zoom: 1 };
  let a = titik[0];
  let b = titik[0];
  for (let i = 0; i < titik.length; i++) {
    if (titik[i].f <= frame) a = titik[i];
    if (titik[i].f > frame) {
      b = titik[i];
      break;
    }
    b = titik[i];
  }
  const t = a === b ? 1 : maju(frame, a.f, b.f - a.f, EASE.halus);
  return { x: antara(t, a.x, b.x), y: antara(t, a.y, b.y), zoom: antara(t, a.zoom, b.zoom) };
}

export interface Sorot {
  /** kotak dalam koordinat gambar (px gambar asli) */
  x: number;
  y: number;
  w: number;
  h: number;
  f: number;
}

/**
 * Isi layar: gambar asli dengan kamera zoom-pan di dalamnya dan kotak sorot yang digambar.
 * Gambar selalu mengisi lebar layar; `titik` mengatur pusat dan perbesaran.
 */
export const IsiLayar: React.FC<{
  src: string;
  lebarGambar: number;
  tinggiGambar: number;
  lebar: number;
  tinggi: number;
  titik?: TitikKamera[];
  sorot?: Sorot[];
  /** lapisan tambahan dalam koordinat gambar asli; `s` = skala tampil */
  lapisan?: (s: number) => React.ReactNode;
}> = ({
  src,
  lebarGambar,
  tinggiGambar,
  lebar,
  tinggi,
  titik = [],
  sorot = [],
  lapisan,
}) => {
  const frame = useCurrentFrame();
  const k = kameraLayar(frame, titik);
  const dasar = lebar / lebarGambar;
  const s = dasar * k.zoom;
  const wTampil = lebarGambar * s;
  const hTampil = tinggiGambar * s;
  const tx = Math.min(0, Math.max(lebar - wTampil, lebar / 2 - k.x * wTampil));
  const ty = Math.min(0, Math.max(Math.min(0, tinggi - hTampil), tinggi / 2 - k.y * hTampil));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: W.embun }}>
      <div style={{ position: 'absolute', left: tx, top: ty, width: wTampil, height: hTampil }}>
        <Img src={staticFile(src)} style={{ width: wTampil, height: hTampil, display: 'block' }} />
        {sorot.map((b, i) => (
          <Gores key={i} d={jalurKotak(b.x * s, b.y * s, b.w * s, b.h * s, i + 1)} p={maju(frame, b.f, 18, EASE.keluar)} lebar={wTampil} tinggi={hTampil} tebal={7} />
        ))}
        {lapisan?.(s)}
      </div>
    </div>
  );
};

/** Laptop (bezel, engsel, alas) miring 3D; anak = isi layar ukuran `lebar`×`tinggi`. */
export const Laptop: React.FC<{ x: number; y: number; lebar: number; rasio?: number; miring?: number; masuk?: number; children: React.ReactNode }> = ({
  x,
  y,
  lebar,
  rasio = 1440 / 900,
  miring = 10,
  masuk = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const tinggi = lebar / rasio;
  const sp = pegas(frame, masuk, 'berat');
  const bezel = 18;
  const ry = miring + ayun(frame, 10, 2, 150);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: lebar + bezel * 2, perspective: 2200 }}>
      <div style={{ transformStyle: 'preserve-3d', transform: `translateY(${(1 - sp) * 600}px) rotateY(${ry}deg) rotateX(${4 + ayun(frame, 50, 1.2, 180)}deg)` }}>
        <div style={{ position: 'relative', width: lebar + bezel * 2, height: tinggi + bezel * 2 + 10, borderRadius: 22, background: W.teks, boxShadow: '0 50px 80px rgba(46,53,71,0.30)' }}>
          <div style={{ position: 'absolute', left: '50%', top: 7, width: 8, height: 8, marginLeft: -4, borderRadius: 4, background: '#59627A' }} />
          <div style={{ position: 'absolute', left: bezel, top: bezel + 4, width: lebar, height: tinggi, borderRadius: 4, overflow: 'hidden' }}>{children}</div>
        </div>
        <div style={{ position: 'relative', margin: '0 auto', width: lebar + bezel * 2 + 90, marginLeft: -45, height: 26, background: W.logam, borderRadius: '0 0 30px 30px', boxShadow: `inset 0 6px 0 ${W.logamGelap}` }}>
          <div style={{ position: 'absolute', left: '50%', top: 6, width: 160, height: 8, marginLeft: -80, borderRadius: '0 0 8px 8px', background: W.logamGelap }} />
        </div>
      </div>
    </div>
  );
};

/** HP sederhana (bezel, poni) miring 3D; anak = isi layar 390×844 diskalakan. */
export const Hp: React.FC<{ x: number; y: number; tinggi: number; miring?: number; masuk?: number; children: React.ReactNode }> = ({ x, y, tinggi, miring = -12, masuk = 0, children }) => {
  const frame = useCurrentFrame();
  const tepi = 14;
  const hLayar = tinggi - tepi * 2;
  const wLayar = (hLayar * 390) / 844;
  const sp = pegas(frame, masuk, 'pantul');
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: wLayar + tepi * 2, height: tinggi, perspective: 1800 }}>
      <div style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `translateY(${(1 - sp) * 700}px) rotateY(${miring + ayun(frame, 70, 2.5, 130)}deg) rotateZ(${ayun(frame, 20, 1, 160)}deg)` }}>
        {[2, 1].map((n) => (
          <div key={n} style={{ position: 'absolute', inset: 0, borderRadius: 52, background: n === 2 ? '#1F2433' : '#3A4258', transform: `translateZ(${-n * 6}px) translateX(${n * 3 * Math.sign(miring || 1)}px)` }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 52, background: W.teks, boxShadow: '0 40px 70px rgba(46,53,71,0.32)' }}>
          <div style={{ position: 'absolute', left: tepi, top: tepi, width: wLayar, height: hLayar, borderRadius: 40, overflow: 'hidden', background: W.embun }}>
            {children}
            <div style={{ position: 'absolute', left: '50%', top: 10, width: 110, height: 28, marginLeft: -55, borderRadius: 16, background: W.teks }} />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Gambar layar HP (390×844 @2x) mengisi layar. */
export const LayarHp: React.FC<{ src: string }> = ({ src }) => <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />;

// ---------------------------------------------------------------- kartu gambar melayang

export const KartuGambar: React.FC<{ src: string; x: number; y: number; lebar: number; tinggi: number; putar?: number; masuk?: number; z?: number }> = ({ src, x, y, lebar, tinggi, putar = 0, masuk = 0, z = 0 }) => {
  const frame = useCurrentFrame();
  const sp = pegas(frame, masuk, 'pantul');
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: lebar,
        height: tinggi,
        borderRadius: 14,
        overflow: 'hidden',
        background: W.putih,
        border: `6px solid ${W.putih}`,
        boxShadow: '0 30px 50px rgba(46,53,71,0.25)',
        transform: `translateY(${(1 - sp) * 400 + ayun(frame, z * 17, 6, 100 + z * 10)}px) rotate(${putar * sp + (1 - sp) * 20}deg) scale(${0.7 + sp * 0.3})`,
        opacity: Math.min(1, sp * 2),
        zIndex: z,
      }}
    >
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
    </div>
  );
};

/** Cahaya lembut yang menyala lalu berdenyut di atas kotak (untuk baris basis data baru). */
export const Nyala: React.FC<{ x: number; y: number; w: number; h: number; mulai: number }> = ({ x, y, w, h, mulai }) => {
  const frame = useCurrentFrame();
  const t = maju(frame, mulai, 12, EASE.keluar);
  const denyut = 0.75 + 0.25 * Math.sin((frame - mulai) / 6);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: W.limauTerang,
        opacity: t * 0.45 * denyut,
        boxShadow: `0 0 ${30 * t}px ${10 * t}px ${W.limau}`,
        borderRadius: 4,
        mixBlendMode: 'multiply',
      }}
    />
  );
};

export const TeksKecil: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: HURUF, fontSize: 26, fontWeight: 500, color: W.teksPendukung, ...style }}>{children}</div>
);

export { interpolate };
