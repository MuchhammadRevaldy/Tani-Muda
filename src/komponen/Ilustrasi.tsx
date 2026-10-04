/**
 * Ilustrasi 48px untuk komoditas dan metode tanam (kotak radius 12, garis 2px).
 * Sumber: design/extracted/icons-inline/ (komoditas-*.svg, metode-*.svg).
 * Warna lewat kelas token: aktif = latar daun-lembut + garis daun-tua; segera hadir =
 * latar embun-pagi + garis garis-kuat. Bagian isi putih memakai fill-putih.
 */
import type { ReactNode } from 'react';

const P = ({ d, isi }: { d: string; isi?: boolean }) => (
  <path d={d} className={isi ? 'fill-putih' : undefined} />
);

const KOMODITAS = {
  daun: (
    <>
      <P d="M20 36V20" />
      <P d="M20 36c-2-6-6-10-11-12" />
      <P d="M20 36c2-6 6-10 11-12" />
      <P isi d="M9 24c-4-6-2-14 4-17 4 4 4 11-4 17Z" />
      <P isi d="M31 24c4-6 2-14-4-17-4 4-4 11 4 17Z" />
      <P isi d="M20 22c-4-6-4-14 0-18 4 4 4 12 0 18Z" />
    </>
  ),
  bayam: (
    <>
      <P d="M20 37V20" />
      <P isi d="M20 27c-6 0-12-4-13-11 7-1 12 3 13 11Z" />
      <P isi d="M20 23c6 0 12-4 13-11-7-1-12 3-13 11Z" />
      <P isi d="M20 18c-3-4-3-10 0-14 3 4 3 10 0 14Z" />
    </>
  ),
  kangkung: (
    <>
      <P d="M14 37c2-10 6-20 14-30" />
      <P isi d="M18 27c-6-1-10-4-11-9 5 0 9 3 11 9Z" />
      <P isi d="M22 19c5-1 9-4 10-9-5 0-9 3-10 9Z" />
      <P isi d="M26 12c-3-2-4-5-4-8 3 1 4 4 4 8Z" />
    </>
  ),
  cabai: (
    <>
      <P d="M26 9c0-3 2-5 5-5" />
      <P isi d="M24 11c4-1 7 2 6 6-2 9-10 16-21 19 2-11 7-22 15-25Z" />
      <P d="M22 12c1 2 4 3 7 2" />
    </>
  ),
  tomat: (
    <>
      <circle cx="20" cy="23" r="12" className="fill-putih" />
      <P d="M20 11V6" />
      <P d="M13 12c3 2 5 2 7 0 2 2 4 2 7 0" />
    </>
  ),
  mentimun: (
    <>
      <P isi d="M8 30c-3-3-2-7 2-10L26 9c4-3 8-2 9 1 2 3 0 7-3 9L15 31c-3 2-5 1-7-1Z" />
      <P d="M15 23h.01M21 19h.01M27 15h.01M19 26h.01M25 22h.01" />
    </>
  ),
  terong: (
    <>
      <P isi d="M27 11c-8-2-17 7-17 17 0 5 3 8 8 8 10 0 14-12 11-22" />
      <P d="M24 10c1-3 4-5 8-4-1 4-4 6-8 5" />
      <P d="M30 6l2-3" />
    </>
  ),
  padi: (
    <>
      <P d="M16 37c0-12 3-21 10-29" />
      <P d="M16 37c-3-6-7-9-11-10" />
      <ellipse
        cx="27"
        cy="11"
        rx="2.6"
        ry="4.2"
        transform="rotate(35 27 11)"
        className="fill-putih"
      />
      <ellipse
        cx="31"
        cy="17"
        rx="2.6"
        ry="4.2"
        transform="rotate(60 31 17)"
        className="fill-putih"
      />
      <ellipse
        cx="22"
        cy="16"
        rx="2.6"
        ry="4.2"
        transform="rotate(-15 22 16)"
        className="fill-putih"
      />
      <ellipse
        cx="26"
        cy="23"
        rx="2.6"
        ry="4.2"
        transform="rotate(55 26 23)"
        className="fill-putih"
      />
    </>
  ),
  jagung: (
    <>
      <P isi d="M20 5c-6 4-8 13-7 23l7 7 7-7c1-10-1-19-7-23Z" />
      <P d="M13 28c-4-1-7-5-7-10 4 1 6 5 7 10Z" />
      <P d="M27 28c4-1 7-5 7-10-4 1-6 5-7 10Z" />
      <P d="M17 14h6M16 20h8M17 26h6" />
    </>
  ),
  kedelai: (
    <>
      <P isi d="M8 30C12 19 21 12 33 9c-2 12-12 21-25 21Z" />
      <circle cx="16" cy="25" r="2.5" />
      <circle cx="22" cy="20" r="2.5" />
      <circle cx="28" cy="15" r="2.5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

const METODE = {
  bedengan: (
    <>
      <P d="M2 33h36" />
      <P isi d="M6 33l4-8h20l4 8Z" />
      <P d="M13 25v-6" />
      <P isi d="M13 20c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
      <P d="M20 25v-8" />
      <P isi d="M20 18c3 0 5-2 5-5-3 0-5 2-5 5Z" />
      <P d="M27 25v-6" />
      <P isi d="M27 20c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
    </>
  ),
  polybag: (
    <>
      <P isi d="M10 19h20l-2 17H12Z" />
      <P d="M10 19l2-3h16l2 3" />
      <P d="M15 26h10" />
      <P d="M20 16V8" />
      <P isi d="M20 11c-3 0-6-2-6-5 3 0 6 2 6 5Z" />
      <P isi d="M20 13c3 0 6-2 6-5-3 0-6 2-6 5Z" />
    </>
  ),
  hidroponik: (
    <>
      <rect x="3" y="21" width="34" height="9" rx="4.5" className="fill-putih" />
      <P d="M11 21v-2h6v2M23 21v-2h6v2" />
      <P d="M14 19v-6" />
      <P isi d="M14 14c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
      <P isi d="M14 14c3 0 5-2 5-5-3 0-5 2-5 5Z" />
      <P d="M26 19v-6" />
      <P isi d="M26 14c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
      <P isi d="M26 14c3 0 5-2 5-5-3 0-5 2-5 5Z" />
      <P d="M20 32.5c-1.6 2.2-2.4 3.4-2.4 4.4a2.4 2.4 0 0 0 4.8 0c0-1-.8-2.2-2.4-4.4Z" />
    </>
  ),
  sawah: (
    <>
      <P d="M2 30c3-2 6-2 9 0s6 2 9 0 6-2 9 0 6 2 9 0" />
      <P d="M2 36c3-2 6-2 9 0s6 2 9 0 6-2 9 0 6 2 9 0" />
      <P d="M10 28V17" />
      <P d="M10 22c-2-3-4-4-7-4" />
      <P d="M10 20c2-4 4-6 7-6" />
      <P d="M28 28V15" />
      <P d="M28 21c-2-3-4-4-7-4" />
      <P d="M28 19c2-4 5-6 8-6" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type NamaIlustrasiKomoditas = keyof typeof KOMODITAS;
export type NamaIlustrasiMetode = keyof typeof METODE;
export const daftarIlustrasiKomoditas = Object.keys(KOMODITAS) as NamaIlustrasiKomoditas[];
export const daftarIlustrasiMetode = Object.keys(METODE) as NamaIlustrasiMetode[];

function Kotak({
  isi,
  segera,
  className,
}: {
  isi: ReactNode;
  segera?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={['block flex-none', className].filter(Boolean).join(' ')}
    >
      <rect
        width="48"
        height="48"
        rx="12"
        className={segera ? 'fill-embun-pagi' : 'fill-daun-lembut'}
      />
      <g
        transform="translate(4 4)"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={segera ? 'stroke-garis-kuat' : 'stroke-daun-tua'}
      >
        {isi}
      </g>
    </svg>
  );
}

export function IlustrasiKomoditas({
  nama,
  segera,
  className,
}: {
  nama: NamaIlustrasiKomoditas;
  /** Tampilan "Segera hadir" (tanpa resep). */
  segera?: boolean;
  className?: string;
}) {
  return <Kotak isi={KOMODITAS[nama]} segera={segera} className={className} />;
}

export function IlustrasiMetode({
  nama,
  segera,
  className,
}: {
  nama: NamaIlustrasiMetode;
  segera?: boolean;
  className?: string;
}) {
  return <Kotak isi={METODE[nama]} segera={segera} className={className} />;
}
