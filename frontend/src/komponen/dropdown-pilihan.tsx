import { useState, useRef, useEffect } from 'react';
import { Ikon } from './ikon';
import { cx } from './gabung-kelas';

export interface OpsiDropdown<T extends string | number> {
  nilai: T;
  label: string;
  keterangan?: string;
}

interface DropdownPilihanProps<T extends string | number> {
  id?: string;
  label?: string;
  ariaLabel?: string;
  opsi: OpsiDropdown<T>[];
  nilaiTerpilih: T;
  onChange: (nilai: T) => void;
  className?: string;
  lebarMenu?: string;
}

/**
 * Dropdown pilihan kustom modern pengganti elemen select bawaan browser.
 * Didesain dengan gaya kapsul rounded-full, menu mengambang rounded-2xl,
 * status aktif berlatar daun-lembut dengan ikon centang, dan navigasi ramah sentuhan.
 */
export function DropdownPilihan<T extends string | number>({
  id,
  label,
  ariaLabel,
  opsi,
  nilaiTerpilih,
  onChange,
  className,
  lebarMenu,
}: DropdownPilihanProps<T>) {
  const [terbuka, setTerbuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const terpilih = opsi.find((o) => o.nilai === nilaiTerpilih) ?? opsi[0];

  useEffect(() => {
    if (!terbuka) return;
    const tekan = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTerbuka(false);
    };
    const klikLuar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    };
    document.addEventListener('keydown', tekan);
    document.addEventListener('mousedown', klikLuar);
    return () => {
      document.removeEventListener('keydown', tekan);
      document.removeEventListener('mousedown', klikLuar);
    };
  }, [terbuka]);

  return (
    <div ref={ref} className={cx('relative inline-block', className)}>
      {label ? (
        <span className="mb-1 block text-keterangan font-medium text-teks-pendukung">
          {label}
        </span>
      ) : null}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={terbuka}
        aria-label={ariaLabel || label || (terpilih ? terpilih.label : 'Pilih')}
        onClick={() => setTerbuka((x) => !x)}
        className={cx(
          'fokus-cincin flex items-center justify-between gap-2.5 rounded-full border border-garis bg-putih px-4 py-2 text-isi font-medium text-teks shadow-kartu transition-all hover:border-garis-kuat',
          terbuka && 'border-daun-tua'
        )}
      >
        <span className="truncate">{terpilih ? terpilih.label : 'Pilih'}</span>
        <svg
          className={cx(
            'h-4 w-4 flex-none text-teks-pendukung transition-transform duration-200',
            terbuka && 'rotate-180 text-daun-tua'
          )}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 7.5L10 12.5L15 7.5" />
        </svg>
      </button>

      {terbuka ? (
        <div
          role="listbox"
          aria-label={ariaLabel || label}
          className={cx(
            'absolute left-0 z-30 mt-2 min-w-full w-max max-h-60 overflow-y-auto rounded-2xl border border-garis bg-putih p-1.5 shadow-kartu-angkat',
            lebarMenu
          )}
        >
          {opsi.map((item) => {
            const aktif = item.nilai === nilaiTerpilih;
            return (
              <button
                key={String(item.nilai)}
                type="button"
                role="option"
                aria-selected={aktif}
                onClick={() => {
                  onChange(item.nilai);
                  setTerbuka(false);
                }}
                className={cx(
                  'flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-left text-isi transition-colors',
                  aktif
                    ? 'bg-daun-lembut font-semibold text-daun-tua'
                    : 'text-teks hover:bg-embun-pagi'
                )}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.keterangan ? (
                    <span className="text-keterangan text-teks-pendukung truncate">
                      {item.keterangan}
                    </span>
                  ) : null}
                </div>
                {aktif ? (
                  <Ikon nama="centang" ukuran={16} className="flex-none text-daun-tua" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
