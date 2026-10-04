import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';
import { Ikon } from './Ikon';

/** Pesan di bawah kolom: galat (prioritas) atau bantuan. */
export function PesanKolom({
  id,
  galat,
  bantuan,
}: {
  id: string;
  galat?: ReactNode;
  bantuan?: ReactNode;
}) {
  if (galat) {
    return (
      <p
        id={`${id}-pesan`}
        className="m-0 flex items-start gap-2 text-keterangan font-medium text-tomat"
      >
        <Ikon nama="peringatan" ukuran={20} className="mt-px" />
        <span>{galat}</span>
      </p>
    );
  }
  if (bantuan) {
    return (
      <p id={`${id}-pesan`} className="m-0 text-keterangan text-teks-pendukung">
        {bantuan}
      </p>
    );
  }
  return null;
}

export const kelasBingkai = (galat: boolean) =>
  cx(
    'flex min-h-kontrol items-stretch overflow-hidden rounded-md bg-putih',
    'focus-within:border-daun-tua focus-within:shadow-fokus',
    galat ? 'border-2 border-tomat' : 'border-1.5 border-garis-kuat',
  );

export const kelasInput =
  'm-0 min-w-0 flex-1 border-0 bg-transparent px-4 text-isi text-teks outline-none placeholder:text-teks-pendukung placeholder:opacity-100';

export interface KolomIsianProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode;
  bantuan?: ReactNode;
  galat?: ReactNode;
  /** Satuan di kanan kolom: "m²", "kg", "liter". */
  akhiran?: ReactNode;
}

export function KolomIsian({
  label,
  bantuan,
  galat,
  akhiran,
  className,
  id,
  ...lain
}: KolomIsianProps) {
  const autoId = useId();
  const idKolom = id ?? autoId;
  const adaPesan = Boolean(galat || bantuan);
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={idKolom} className="text-isi font-medium text-teks">
        {label}
      </label>
      <div className={kelasBingkai(Boolean(galat))}>
        <input
          id={idKolom}
          className={kelasInput}
          aria-invalid={galat ? true : undefined}
          aria-describedby={adaPesan ? `${idKolom}-pesan` : undefined}
          {...lain}
        />
        {akhiran ? (
          <span
            className="flex items-center pr-4 font-medium text-teks-pendukung"
            aria-hidden="true"
          >
            {akhiran}
          </span>
        ) : null}
      </div>
      <PesanKolom id={idKolom} galat={galat} bantuan={bantuan} />
    </div>
  );
}
