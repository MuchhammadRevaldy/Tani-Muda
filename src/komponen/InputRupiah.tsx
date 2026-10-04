import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { terbilang } from '../lib/format';
import { olahKetikanRupiah, posisiSetelahDigit, tampilanRupiah } from '../lib/ketikan-rupiah';
import { cx } from './cx';
import { kelasBingkai, kelasInput, PesanKolom } from './KolomIsian';

export interface InputRupiahProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size'
> {
  label: ReactNode;
  /** Nilai terkendali. Kosongkan untuk mode tidak terkendali dengan `nilaiAwal`. */
  nilai?: number | null;
  nilaiAwal?: number | null;
  onUbah?: (nilai: number | null) => void;
  bantuan?: ReactNode;
  galat?: ReactNode;
  akhiran?: ReactNode;
  /** Matikan ejaan angka di bawah kolom. */
  tanpaTerbilang?: boolean;
}

/**
 * Kolom uang: titik ribuan otomatis, kursor dijaga, dan mengeja angkanya supaya salah ketik
 * nol langsung ketahuan.
 */
export function InputRupiah({
  label,
  nilai: nilaiTerkendali,
  nilaiAwal = null,
  onUbah,
  bantuan,
  galat,
  akhiran,
  tanpaTerbilang,
  className,
  id,
  ...lain
}: InputRupiahProps) {
  const autoId = useId();
  const idKolom = id ?? autoId;
  const terkendali = nilaiTerkendali !== undefined;
  const [nilaiSendiri, setNilaiSendiri] = useState<number | null>(nilaiAwal);
  const nilai = terkendali ? nilaiTerkendali : nilaiSendiri;
  const ref = useRef<HTMLInputElement>(null);
  const kursor = useRef<number | null>(null);
  const tampil = tampilanRupiah(nilai);

  useLayoutEffect(() => {
    const el = ref.current;
    if (kursor.current === null || !el || document.activeElement !== el) {
      kursor.current = null;
      return;
    }
    const pos = posisiSetelahDigit(el.value, kursor.current);
    el.setSelectionRange(pos, pos);
    kursor.current = null;
  });

  function ubah(e: ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const hasil = olahKetikanRupiah(el.value, el.selectionStart ?? el.value.length);
    kursor.current = hasil.digitSebelumKursor;
    if (!terkendali) setNilaiSendiri(hasil.nilai);
    onUbah?.(hasil.nilai);
  }

  const pesanBantuan = bantuan ?? (!tanpaTerbilang && nilai ? terbilang(nilai) : null);
  const adaPesan = Boolean(galat || pesanBantuan);
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={idKolom} className="text-isi font-medium text-teks">
        {label}
      </label>
      <div className={kelasBingkai(Boolean(galat))}>
        <span
          className="flex items-center border-r border-garis bg-tanah-lembut pl-4 pr-3 text-judul-bagian font-semibold text-tanah"
          aria-hidden="true"
        >
          Rp
        </span>
        <input
          ref={ref}
          id={idKolom}
          className={cx(
            kelasInput,
            'pl-3 text-uang font-semibold tabular-nums text-tanah placeholder:font-normal',
          )}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={tampil}
          onChange={ubah}
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
      <PesanKolom id={idKolom} galat={galat} bantuan={pesanBantuan} />
    </div>
  );
}
