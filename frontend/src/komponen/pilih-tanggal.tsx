import {
  lazy,
  Suspense,
  useId,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { formatTanggal } from '../lib/format';
import { cx } from './gabung-kelas';
import { Ikon } from './ikon';
import { PesanKolom } from './kolom-isian';
import { useLayarLebar } from './use-layar-lebar';

const KalenderIsi = lazy(() =>
  import('./kalender-isi').then((m) => ({ default: m.KalenderIsi })),
);

export interface PilihTanggalProps {
  id?: string;
  name?: string;
  label: ReactNode;
  labelTersembunyi?: boolean;
  nilai: string;
  onChange: (nilai: string) => void;
  placeholder?: string;
  bantuan?: ReactNode;
  galat?: ReactNode;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
  bisaDihapus?: boolean;
}

export function PilihTanggal({
  id,
  name,
  label,
  labelTersembunyi,
  nilai,
  onChange,
  placeholder = 'Pilih tanggal...',
  bantuan,
  galat,
  disabled,
  className,
  min,
  max,
  bisaDihapus = true,
}: PilihTanggalProps) {
  const autoId = useId();
  const idKontrol = id ?? autoId;
  const idLabel = `${idKontrol}-label`;
  const [terbuka, setTerbuka] = useState(false);
  const isLayarLebar = useLayarLebar();
  const wadahRef = useRef<HTMLDivElement>(null);

  // Tutup bila klik di luar (khusus desktop)
  useEffect(() => {
    if (!terbuka || !isLayarLebar) return;
    function handleKlikLuar(e: MouseEvent) {
      if (wadahRef.current && !wadahRef.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    }
    document.addEventListener('mousedown', handleKlikLuar);
    return () => document.removeEventListener('mousedown', handleKlikLuar);
  }, [terbuka, isLayarLebar]);

  // Tutup dengan Escape
  useEffect(() => {
    if (!terbuka) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setTerbuka(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [terbuka]);

  let teksTampilan = placeholder;
  if (nilai && /^\d{4}-\d{2}-\d{2}$/.test(nilai)) {
    try {
      teksTampilan = formatTanggal(nilai, { denganTahun: true });
    } catch {
      teksTampilan = nilai;
    }
  }

  const adaPesan = Boolean(galat || bantuan);

  return (
    <div ref={wadahRef} className={cx('relative flex flex-col gap-2', className)}>
      <label
        id={idLabel}
        htmlFor={idKontrol}
        className={cx('text-isi font-medium text-teks', labelTersembunyi && 'sr-saja')}
      >
        {label}
      </label>

      {/* Input date tersembunyi untuk kompatibilitas form & pengujian otomatis */}
      <input
        type="date"
        id={idKontrol}
        name={name}
        value={nilai}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-invalid={galat ? true : undefined}
        aria-describedby={adaPesan ? `${idKontrol}-pesan` : undefined}
        className="sr-saja"
        disabled={disabled}
      />

      <button
        type="button"
        id={`${idKontrol}-tombol`}
        onClick={() => {
          if (!disabled) setTerbuka((prev) => !prev);
        }}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={terbuka}
        aria-invalid={galat ? true : undefined}
        aria-describedby={adaPesan ? `${idKontrol}-pesan` : undefined}
        className={cx(
          'flex min-h-kontrol w-full items-center justify-between gap-3 rounded-xl bg-putih px-4 py-3 text-left',
          'transition-colors duration-150',
          galat ? 'border-2 border-tomat' : 'border-1.5 border-garis-kuat',
          'focus:border-daun-tua focus:shadow-fokus focus:outline-none',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        <span className="sr-saja">{label}: </span>
        <span
          className={cx(
            'truncate text-isi',
            nilai ? 'font-medium text-teks' : 'text-teks-pendukung',
          )}
        >
          {teksTampilan}
        </span>
        <Ikon
          nama="kalender"
          ukuran={20}
          className="flex-none text-teks-pendukung"
        />
      </button>

      {/* Panel Kalender Desktop */}
      {terbuka && isLayarLebar ? (
        <div className="absolute left-0 top-full z-40 mt-1.5 overflow-hidden rounded-2xl border border-garis bg-putih shadow-kartu animate-masuk-halaman">
          <Suspense
            fallback={
              <div className="flex h-72 w-80 items-center justify-center p-6 text-keterangan text-teks-pendukung">
                Memuat kalender...
              </div>
            }
          >
            <KalenderIsi
              nilai={nilai}
              onPilih={(tgl) => {
                onChange(tgl);
                setTerbuka(false);
              }}
              min={min}
              max={max}
              bisaDihapus={bisaDihapus}
              onTutup={() => setTerbuka(false)}
            />
          </Suspense>
        </div>
      ) : null}

      {/* Panel Kalender Mobile (Lembar Bawah) */}
      {terbuka && !isLayarLebar
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-end justify-center animate-masuk-halaman">
              <div
                className="absolute inset-0 bg-tirai"
                aria-hidden="true"
                onClick={() => setTerbuka(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-3xl bg-putih p-4 shadow-kartu animate-masuk-halaman"
              >
                <span
                  aria-hidden="true"
                  className="mb-2 h-1 w-10 self-center rounded-full bg-garis"
                />
                <div className="mb-2 flex items-center justify-between border-b border-garis pb-2">
                  <span className="text-isi font-semibold text-teks">{label}</span>
                  <button
                    type="button"
                    onClick={() => setTerbuka(false)}
                    aria-label="Tutup kalender"
                    className="flex h-sentuh w-sentuh items-center justify-center rounded-lg text-teks-pendukung hover:bg-embun-pagi transition-colors focus:shadow-fokus focus:outline-none"
                  >
                    <Ikon nama="silang" ukuran={18} />
                  </button>
                </div>

                <Suspense
                  fallback={
                    <div className="flex h-64 items-center justify-center text-keterangan text-teks-pendukung">
                      Memuat kalender...
                    </div>
                  }
                >
                  <KalenderIsi
                    nilai={nilai}
                    onPilih={(tgl) => {
                      onChange(tgl);
                      setTerbuka(false);
                    }}
                    min={min}
                    max={max}
                    bisaDihapus={bisaDihapus}
                    onTutup={() => setTerbuka(false)}
                  />
                </Suspense>
              </div>
            </div>,
            document.body,
          )
        : null}

      <PesanKolom id={idKontrol} galat={galat} bantuan={bantuan} />
    </div>
  );
}
