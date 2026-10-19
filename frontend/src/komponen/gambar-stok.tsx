import { useState } from 'react';
import { adaIlustrasiKomoditas, alamatIlustrasiKomoditas, alamatFotoKomoditas } from './ilustrasi';
import { labelPenafianTampil } from '../lib/label-penafian';
import { cx } from './gabung-kelas';

export interface PropertiGambarStok {
  foto?: string | null;
  komoditasId: string;
  namaKomoditas?: string;
  alt?: string;
  className?: string;
  wadahClassName?: string;
  wadahStyle?: React.CSSProperties;
}

/**
 * Urutan cadangan gambar kartu & detail stok (AG-38):
 * 1. Foto unggahan petani (stok.foto)
 * 2. Foto bawaan komoditas asli (/foto/komoditas/{komoditas}.webp) dengan label "Foto contoh"
 * 3. Ilustrasi 3D komoditas (/ilustrasi/komoditas/{komoditas}.svg) saat onError
 */
export function GambarStok({
  foto,
  komoditasId,
  namaKomoditas,
  alt,
  className,
  wadahClassName,
  wadahStyle,
}: PropertiGambarStok) {
  const kunci = `${foto ?? ''}-${komoditasId}`;
  const [keadaan, setKeadaan] = useState({ kunci, gagal: 0 });

  const gagal = keadaan.kunci === kunci ? keadaan.gagal : 0;
  const punyaFotoUnggahan = Boolean(foto && foto.trim() !== '' && !foto.startsWith('/foto/komoditas/'));

  let tahap: 'unggahan' | 'bawaan' | 'ilustrasi';
  if (punyaFotoUnggahan) {
    if (gagal === 0) tahap = 'unggahan';
    else if (gagal === 1) tahap = 'bawaan';
    else tahap = 'ilustrasi';
  } else {
    if (gagal === 0) tahap = 'bawaan';
    else tahap = 'ilustrasi';
  }

  const handleGalat = () => {
    setKeadaan({ kunci, gagal: gagal + 1 });
  };

  const src =
    tahap === 'unggahan' && foto
      ? foto
      : tahap === 'bawaan'
      ? alamatFotoKomoditas(komoditasId)
      : adaIlustrasiKomoditas(komoditasId)
      ? alamatIlustrasiKomoditas(komoditasId)
      : '/ilustrasi/komoditas/sawi.svg';

  const teksAlt =
    alt ??
    (tahap === 'bawaan'
      ? `Foto contoh ${namaKomoditas ?? komoditasId}`
      : `Foto ${namaKomoditas ?? komoditasId}`);

  return (
    <div
      style={wadahStyle}
      className={cx(
        'relative flex items-center justify-center overflow-hidden border border-garis/50 bg-embun-pagi/60',
        wadahClassName ?? 'mb-3 h-36 w-full rounded-2xl',
      )}
    >
      <img
        src={src}
        alt={teksAlt}
        className={cx('h-full w-full object-contain p-2 transition-transform duration-200', className)}
        onError={handleGalat}
      />
      {tahap === 'bawaan' && labelPenafianTampil() ? (
        <span
          data-testid="label-foto-contoh"
          className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-teks/75 px-2 py-0.5 text-keterangan font-medium text-putih backdrop-blur-sm"
        >
          Foto contoh
        </span>
      ) : null}
    </div>
  );
}
