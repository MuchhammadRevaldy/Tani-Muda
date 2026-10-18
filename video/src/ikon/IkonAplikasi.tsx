import React from 'react';
import { buatPath } from './util-path';
import { TEBAL_GARIS_64, WARNA_IKON, type IkonProps } from './tipe';
import { IKON_APLIKASI, type NamaIkonAplikasi } from './ikon-aplikasi-data';

/** Ubah satu elemen SVG (path/circle/ellipse/rect/line/polygon) menjadi data path. */
function keDataPath(tag: string, atribut: Record<string, string>): string {
  const n = (k: string) => Number(atribut[k] ?? 0);
  switch (tag) {
    case 'path':
      return atribut.d;
    case 'circle': {
      const [cx, cy, r] = [n('cx'), n('cy'), n('r')];
      return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
    }
    case 'ellipse': {
      const [cx, cy, rx, ry] = [n('cx'), n('cy'), n('rx'), n('ry')];
      return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
    }
    case 'rect': {
      const [x, y, w, h] = [n('x'), n('y'), n('width'), n('height')];
      const r = Math.min(n('rx'), w / 2, h / 2);
      return (
        `M${x + r} ${y}H${x + w - r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h - r}a${r} ${r} 0 0 1 ${-r} ${r}` +
        `H${x + r}a${r} ${r} 0 0 1 ${-r} ${-r}V${y + r}a${r} ${r} 0 0 1 ${r} ${-r}Z`
      );
    }
    case 'line':
      return `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}`;
    case 'polygon': {
      const titik = atribut.points.trim().split(/[\s,]+/).map(Number);
      const pasangan: string[] = [];
      for (let i = 0; i < titik.length; i += 2) pasangan.push(`${titik[i]} ${titik[i + 1]}`);
      return `M${pasangan.join('L')}Z`;
    }
    default:
      return '';
  }
}

function urai(svg: string): string[] {
  const hasil: string[] = [];
  for (const m of svg.matchAll(/<(\w+)\s+([^>]*?)\/>/g)) {
    const atribut = Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    const d = keDataPath(m[1], atribut);
    if (d) hasil.push(d);
  }
  return hasil;
}

export interface PropsIkonAplikasi {
  nama: NamaIkonAplikasi;
  size?: number;
  /** Tebal garis pada grid 24 (aplikasi memakai 1,7). */
  strokeWidth?: number;
  warnaUtama?: string;
  warnaAksen?: string;
  /** Urutan bagian ikon (mulai 0) yang memakai warna aksen. */
  bagianAksen?: number[];
  /** 0–1: ikon digambar bagian demi bagian. */
  progress?: number;
  style?: React.CSSProperties;
}

/**
 * Ikon dari aplikasi Tani Muda, digambar ulang bagian per bagian supaya bisa
 * dianimasikan dengan evolvePath. Bentuknya sama persis dengan di aplikasi.
 */
export const IkonAplikasi: React.FC<PropsIkonAplikasi> = ({
  nama,
  size = 64,
  strokeWidth = 1.7,
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  bagianAksen = [],
  progress = 1,
  style,
}) => {
  const bagian = urai(IKON_APLIKASI[nama]);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ overflow: 'visible', ...style }}>
      {bagian.map((d, i) =>
        buatPath({
          id: `${nama}-${i}`,
          d,
          warna: bagianAksen.includes(i) ? warnaAksen : warnaUtama,
          tebal: strokeWidth,
          // Tiap bagian mulai digambar bergantian.
          progres: Math.max(0, Math.min(1, progress * bagian.length - i)),
        }),
      )}
    </svg>
  );
};

/**
 * Pembungkus dengan props yang sama seperti ikon buatan sendiri (grid 64),
 * supaya bisa langsung dipakai di adegan. Tebal garis grid 64 diubah ke grid 24.
 */
function ikonDariAplikasi(nama: NamaIkonAplikasi, bagianAksen: number[] = []): React.FC<IkonProps> {
  const Komponen: React.FC<IkonProps> = ({ size = 64, strokeWidth = TEBAL_GARIS_64, warnaUtama, warnaAksen, progress = 1, style }) => (
    <IkonAplikasi
      nama={nama}
      size={size}
      strokeWidth={(strokeWidth * 24) / 64}
      warnaUtama={warnaUtama}
      warnaAksen={warnaAksen}
      bagianAksen={bagianAksen}
      progress={progress}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
  Komponen.displayName = `IkonAplikasi(${nama})`;
  return Komponen;
}

export const IkonUang = ikonDariAplikasi('uang', [3, 4]);
export const IkonPin = ikonDariAplikasi('pin', [2, 3]);
export const IkonPanen = ikonDariAplikasi('panen', [3, 4]);
export const IkonKamera = ikonDariAplikasi('kamera', [1]);
export const IkonChat = ikonDariAplikasi('chat');
export const IkonKebun = ikonDariAplikasi('kebun', [1, 2]);
export const IkonBelajar = ikonDariAplikasi('belajar', [1]);
export const IkonKunci = ikonDariAplikasi('kunci', [1]);
export const IkonCentang = ikonDariAplikasi('centang');
export const IkonPengukur = ikonDariAplikasi('pengukur', [1, 2]);
export const IkonPeta = ikonDariAplikasi('peta');
