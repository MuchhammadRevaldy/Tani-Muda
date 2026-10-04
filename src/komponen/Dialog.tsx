import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { teksKomponen } from '../teks/komponen';
import { cx } from './cx';
import { Ikon } from './Ikon';

const PILIHAN_FOKUS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DialogProps {
  terbuka: boolean;
  onTutup: () => void;
  judul: ReactNode;
  /** Isi di samping judul (mis. ilustrasi komoditas). */
  kepala?: ReactNode;
  keterangan?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Lembar bawah di HP (radius atas 20px, pegangan) dan dialog 480px di desktop (mulai lg).
 * Fokus terkurung, Esc menutup, fokus kembali ke pemicu, gulir latar dikunci.
 */
export function Dialog({
  terbuka,
  onTutup,
  judul,
  kepala,
  keterangan,
  children,
  className,
}: DialogProps) {
  const idJudul = useId();
  const panel = useRef<HTMLElement>(null);
  const pemicu = useRef<Element | null>(null);
  const tutupRef = useRef(onTutup);
  useEffect(() => {
    tutupRef.current = onTutup;
  });

  useEffect(() => {
    if (!terbuka) return;
    pemicu.current = document.activeElement;
    const gulirLama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const el = panel.current;
    const pertama = el?.querySelector<HTMLElement>(PILIHAN_FOKUS);
    (pertama ?? el)?.focus();

    function tekan(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        tutupRef.current();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const bisaFokus = Array.from(el.querySelectorAll<HTMLElement>(PILIHAN_FOKUS));
      if (bisaFokus.length === 0) return;
      const awal = bisaFokus[0]!;
      const akhir = bisaFokus[bisaFokus.length - 1]!;
      if (e.shiftKey && document.activeElement === awal) {
        e.preventDefault();
        akhir.focus();
      } else if (!e.shiftKey && document.activeElement === akhir) {
        e.preventDefault();
        awal.focus();
      }
    }
    document.addEventListener('keydown', tekan);
    return () => {
      document.removeEventListener('keydown', tekan);
      document.body.style.overflow = gulirLama;
      if (pemicu.current instanceof HTMLElement) pemicu.current.focus();
    };
  }, [terbuka]);

  if (!terbuka) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6">
      <div className="absolute inset-0 bg-tirai" aria-hidden="true" onClick={onTutup} />
      <section
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idJudul}
        tabIndex={-1}
        className={cx(
          'relative flex max-h-full w-full flex-col gap-4 overflow-y-auto bg-putih outline-none',
          'rounded-t-sheet px-4 pb-6 pt-2',
          'lg:w-dialog lg:max-w-full lg:rounded-lg lg:p-6',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="mb-1 h-1 w-10 self-center rounded-full bg-garis lg:hidden"
        />
        <div className="flex items-start gap-3.5">
          {kepala}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 id={idJudul} className="m-0 text-uang font-semibold">
              {judul}
            </h2>
            {keterangan ? (
              <span className="text-keterangan text-teks-pendukung">{keterangan}</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label={teksKomponen.dialog.tutup}
            className="fokus-cincin -mr-2 -mt-1 grid h-sentuh w-sentuh flex-none cursor-pointer place-items-center rounded-md border-0 bg-transparent text-teks-pendukung hover:text-teks"
          >
            <Ikon nama="silang" />
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}
