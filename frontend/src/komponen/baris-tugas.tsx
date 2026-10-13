import { useState, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { teksKomponen } from '../teks/komponen';
import { ChipStatus, type StatusChip } from './chip-status';
import { cx } from './gabung-kelas';
import { Ikon, IkonTipeTugas, type TipeTugas } from './ikon';
import { kelasTombol } from './tombol';

export interface BarisTugasProps {
  judul: string;
  /** Tipe tugas (P0-12): ikon kalender, putar ulang, atau pengukur di baris meta. */
  tipe?: TipeTugas;
  /** Keterangan: frekuensi ("setiap hari") atau hari ("hari ke-14"). */
  keterangan?: ReactNode;
  /** Status waktu untuk chip. Diabaikan bila selesai. */
  waktu?: Exclude<
    StatusChip,
    'uang-muka-ditahan' | 'menunggu-konfirmasi' | 'dana-cair' | 'selesai'
  >;
  /** Teks chip, mis. "Terlambat 2 hari". */
  teksWaktu?: ReactNode;
  /** Hasil pengukuran terakhir, mis. "Terakhir pH 6,1 · normal". */
  hasil?: ReactNode;
  /** Terkendali. Kosongkan untuk mode tidak terkendali dengan `selesaiAwal`. */
  selesai?: boolean;
  selesaiAwal?: boolean;
  onCentang?: (selesai: boolean) => void;
  /** Tautan ke detail tugas (judul menjadi tautan). */
  href?: string;
  /** Tautan "Isi angka" untuk tugas pengukuran yang jatuh tempo. */
  hrefUkur?: string;
  /** "Isi angka" sebagai tombol utama (hanya satu per layar). */
  ukurUtama?: boolean;
  jumlahFoto?: number;
  onKamera?: () => void;
  tanpaKamera?: boolean;
  className?: string;
  /** Mis. --urutan untuk muncul bertahap (D-61). */
  style?: CSSProperties;
}

/** Baris tugas: centang 48px, judul, meta (tipe, keterangan, chip), kamera. */
export function BarisTugas({
  judul,
  tipe,
  keterangan,
  waktu,
  teksWaktu,
  hasil,
  selesai: selesaiTerkendali,
  selesaiAwal = false,
  onCentang,
  href,
  hrefUkur,
  ukurUtama,
  jumlahFoto = 0,
  onKamera,
  tanpaKamera,
  className,
  style,
}: BarisTugasProps) {
  const terkendali = selesaiTerkendali !== undefined;
  const [selesaiSendiri, setSelesaiSendiri] = useState(selesaiAwal);
  const selesai = terkendali ? selesaiTerkendali : selesaiSendiri;
  const t = teksKomponen.tugas;

  function centang() {
    if (!terkendali) setSelesaiSendiri(!selesai);
    onCentang?.(!selesai);
  }

  const kelasJudul = cx(
    'text-isi no-underline',
    selesai ? 'font-medium text-teks-pendukung' : 'font-semibold text-teks',
  );
  const chip = selesai ? (
    <ChipStatus status="selesai" />
  ) : waktu ? (
    <ChipStatus status={waktu}>{teksWaktu}</ChipStatus>
  ) : null;

  return (
    <div
      style={style}
      className={cx(
        'flex min-h-baris-tugas items-center gap-2 bg-putih py-2 pl-1 pr-3',
        '[&+&]:border-t [&+&]:border-garis',
        className,
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={selesai}
        aria-label={selesai ? t.batalkanSelesai(judul) : t.tandaiSelesai(judul)}
        onClick={centang}
        className="fokus-cincin group grid h-sentuh w-sentuh flex-none cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0"
      >
        <span
          className={cx(
            'grid h-lingkaran w-lingkaran place-items-center rounded-full border-2 text-putih',
            selesai
              ? 'border-limau bg-limau shadow-cahaya-limau'
              : 'border-garis-kuat bg-putih group-hover:border-daun-tua',
          )}
        >
          {selesai ? <Ikon nama="centang" ukuran={20} tebal={3} /> : null}
        </span>
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
        {href ? (
          <Link to={href} className={cx(kelasJudul, 'hover:text-daun-tua')}>
            {judul}
          </Link>
        ) : (
          <span className={kelasJudul}>{judul}</span>
        )}
        {tipe || keterangan || chip || hasil ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-keterangan text-teks-pendukung">
            {tipe || keterangan ? (
              <span className="inline-flex items-center gap-1.5 text-teks">
                {tipe ? <IkonTipeTugas tipe={tipe} /> : null}
                {keterangan ? <span>{keterangan}</span> : null}
                {tipe ? <span className="sr-saja">{t.awalanTipe + t.namaTipe[tipe]}</span> : null}
              </span>
            ) : null}
            {chip}
            {hasil ? (
              <span className="inline-flex min-h-7.5 items-center gap-1.5 rounded-full border-1.5 border-garis-kuat px-2.5 text-teks">
                <IkonTipeTugas tipe="ukur" ukuran={16} />
                {hasil}
              </span>
            ) : null}
          </span>
        ) : null}
        {hrefUkur && !selesai ? (
          <Link
            to={hrefUkur}
            className={cx(
              kelasTombol(ukurUtama ? 'utama' : 'sekunder'),
              'mt-1.5 min-h-sentuh self-start px-4.5',
            )}
          >
            {t.isiAngka}
          </Link>
        ) : null}
      </div>

      {tanpaKamera || selesai ? null : (
        <button
          type="button"
          onClick={onKamera}
          aria-label={jumlahFoto ? t.fotoBukti(jumlahFoto) : t.tambahFoto}
          className="fokus-cincin relative grid h-sentuh w-sentuh flex-none cursor-pointer place-items-center rounded-full border-0 bg-putih p-0 text-teks shadow-ikon hover:text-daun-tua"
        >
          <Ikon nama="kamera" />
          {jumlahFoto ? (
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 h-6.5 min-w-6.5 rounded-full border-2 border-putih bg-tanah px-1.5 text-center text-keterangan font-semibold text-putih"
            >
              {jumlahFoto}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
