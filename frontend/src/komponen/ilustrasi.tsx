/**
 * Ilustrasi komoditas dan metode tanam.
 * - Komoditas (D-59): ilustrasi 3D lembut dari public/ilustrasi/komoditas/*.svg, dimuat lewat <img>
 *   dengan alt. Berkas di luar src/ sehingga warnanya tidak terikat token. "Segera hadir" tampil
 *   abu-abu redup.
 * - Metode tanam: ilustrasi garis 48px (kotak radius 12, garis 2px) dari design/extracted/ikon-sebaris/.
 *   Warna lewat kelas token: aktif = latar daun-lembut + garis daun-tua; segera hadir = latar
 *   embun-pagi + garis garis-kuat. Bagian isi putih memakai fill-putih.
 */
import { useState, type ReactNode } from 'react';
import { Ikon } from './ikon';

const P = ({ d, isi }: { d: string; isi?: boolean }) => (
  <path d={d} className={isi ? 'fill-putih' : undefined} />
);

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

/** Id komoditas → berkas ilustrasi dan teks alt. */
const KOMODITAS = {
  sawi: { berkas: 'sawi', alt: 'Ilustrasi sawi hijau' },
  pakcoy: { berkas: 'pakcoy', alt: 'Ilustrasi pakcoy' },
  bayam: { berkas: 'bayam', alt: 'Ilustrasi bayam' },
  kangkung: { berkas: 'kangkung', alt: 'Ilustrasi kangkung' },
  cabai: { berkas: 'cabai-rawit', alt: 'Ilustrasi cabai rawit' },
  tomat: { berkas: 'tomat', alt: 'Ilustrasi tomat' },
  selada: { berkas: 'selada', alt: 'Ilustrasi selada' },
  mentimun: { berkas: 'mentimun', alt: 'Ilustrasi mentimun' },
  terong: { berkas: 'terong', alt: 'Ilustrasi terong' },
  padi: { berkas: 'padi', alt: 'Ilustrasi padi' },
  jagung: { berkas: 'jagung-manis', alt: 'Ilustrasi jagung manis' },
  kedelai: { berkas: 'kedelai', alt: 'Ilustrasi kedelai' },
} as const;

export type NamaIlustrasiKomoditas = keyof typeof KOMODITAS;
export type NamaIlustrasiMetode = keyof typeof METODE;
export const daftarIlustrasiKomoditas = Object.keys(KOMODITAS) as NamaIlustrasiKomoditas[];
export const adaIlustrasiKomoditas = (id: string): id is NamaIlustrasiKomoditas =>
  Object.hasOwn(KOMODITAS, id);
/** Alamat berkas ilustrasi komoditas, mis. untuk kartu siklus dan halaman depan. */
export const alamatIlustrasiKomoditas = (nama: NamaIlustrasiKomoditas) =>
  `/ilustrasi/komoditas/${KOMODITAS[nama].berkas}.svg`;
/** Alamat berkas foto bawaan komoditas asli (format WebP 800px). */
export const alamatFotoKomoditas = (nama: string) => {
  const berkas = adaIlustrasiKomoditas(nama) ? KOMODITAS[nama].berkas : nama;
  return `/foto/komoditas/${berkas}.webp`;
};
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
  ukuran = 48,
  alt,
  className,
}: {
  /** Id komoditas; id tanpa ilustrasi memakai ikon kebun. */
  nama: string;
  /** Tampilan "Segera hadir" (tanpa resep). */
  segera?: boolean;
  ukuran?: number;
  /** Teks alt; kosongkan ("") bila nama komoditas sudah tertulis di sebelahnya. */
  alt?: string;
  className?: string;
}) {
  const [fotoGagal, setFotoGagal] = useState(false);
  const kelas = ['block flex-none', segera && 'opacity-60 grayscale', className]
    .filter(Boolean)
    .join(' ');
  if (!adaIlustrasiKomoditas(nama)) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        style={{ width: ukuran, height: ukuran }}
        className={['grid place-items-center rounded-md bg-daun-lembut text-daun-tua', kelas].join(
          ' ',
        )}
      >
        <Ikon nama="kebun" ukuran={Math.round(ukuran / 2)} />
      </span>
    );
  }
  // Gunakan foto asli (.webp) sebagai sumber utama, fallback ke SVG vector jika gagal
  const srcFoto = alamatFotoKomoditas(nama);
  const srcSvg = alamatIlustrasiKomoditas(nama);
  return (
    <img
      src={fotoGagal ? srcSvg : srcFoto}
      alt={alt ?? KOMODITAS[nama].alt}
      width={ukuran}
      height={ukuran}
      decoding="async"
      className={[kelas, !fotoGagal && 'rounded-lg object-cover'].filter(Boolean).join(' ')}
      onError={() => {
        if (!fotoGagal) setFotoGagal(true);
      }}
    />
  );
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
