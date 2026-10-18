import {
  useId,
  useState,
  useEffect,
  type ReactNode,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { cx } from './gabung-kelas';
import { Ikon } from './ikon';
import { IlustrasiKomoditas } from './ilustrasi';
import { PesanKolom } from './kolom-isian';
import { useLayarLebar } from './use-layar-lebar';

export interface OpsiDropdown<T extends string = string> {
  nilai: T;
  label: string;
  keterangan?: string;
  komoditasId?: string;
  nonaktif?: boolean;
}

export interface PilihanDropdownProps<T extends string = string> {
  id?: string;
  name?: string;
  label: ReactNode;
  labelTersembunyi?: boolean;
  nilai: T;
  onChange: (nilai: T) => void;
  pilihan: OpsiDropdown<T>[];
  placeholder?: string;
  bantuan?: ReactNode;
  galat?: ReactNode;
  disabled?: boolean;
  className?: string;
  /** Tampilkan pencarian manual (otomatis jika pilihan > 8) */
  denganPencarian?: boolean;
  'aria-label'?: string;
}

export function PilihanDropdown<T extends string = string>({
  id,
  name,
  label,
  labelTersembunyi,
  nilai,
  onChange,
  pilihan,
  placeholder = 'Pilih salah satu...',
  bantuan,
  galat,
  disabled,
  className,
  denganPencarian,
  'aria-label': ariaLabel,
}: PilihanDropdownProps<T>) {
  const autoId = useId();
  const idKontrol = id ?? autoId;
  const idLabel = `${idKontrol}-label`;
  const isLayarLebar = useLayarLebar();
  const [kataKunci, setKataKunci] = useState('');
  const inputCariRef = useRef<HTMLInputElement>(null);

  const perluCari = denganPencarian || pilihan.length > 8;
  const opsiTersaring = perluCari && kataKunci.trim()
    ? pilihan.filter((o) =>
        o.label.toLowerCase().includes(kataKunci.trim().toLowerCase()),
      )
    : pilihan;

  const terpilih = pilihan.find((p) => p.nilai === nilai);
  const adaPesan = Boolean(galat || bantuan);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      if (adaPesan) {
        buttonRef.current.setAttribute('aria-describedby', `${idKontrol}-pesan`);
      } else {
        buttonRef.current.removeAttribute('aria-describedby');
      }
    }
  }, [adaPesan, idKontrol]);

  return (
    <div className={cx('relative flex flex-col gap-2', className)}>
      <label
        id={idLabel}
        htmlFor={idKontrol}
        className={cx('text-isi font-medium text-teks', labelTersembunyi && 'sr-saja')}
      >
        {label}
      </label>

      {/* Select tersembunyi untuk kompatibilitas form & pembaca layar/alat uji */}
      <select
        id={idKontrol}
        name={name}
        value={nilai}
        onChange={(e) => onChange(e.target.value as T)}
        tabIndex={-1}
        aria-invalid={galat ? true : undefined}
        aria-describedby={adaPesan ? `${idKontrol}-pesan` : undefined}
        className="sr-saja"
        disabled={disabled}
      >
        {pilihan.map((o) => (
          <option key={o.nilai} value={o.nilai} disabled={o.nonaktif}>
            {o.label}
          </option>
        ))}
      </select>

      <Listbox value={nilai} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <>
            <ListboxButton
              ref={buttonRef}
              id={`${idKontrol}-tombol`}
              aria-label={labelTersembunyi ? (ariaLabel ?? (typeof label === 'string' ? label : undefined)) : undefined}
              aria-invalid={galat ? true : undefined}
              aria-describedby={adaPesan ? `${idKontrol}-pesan` : undefined}
              className={cx(
                'flex min-h-kontrol w-full items-center justify-between gap-2 rounded-xl bg-putih px-4 py-3 text-left',
                'transition-colors duration-150',
                galat ? 'border-2 border-tomat' : 'border-1.5 border-garis-kuat',
                'focus:border-daun-tua focus:shadow-fokus focus:outline-none',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5 truncate">
                {terpilih?.komoditasId ? (
                  <IlustrasiKomoditas
                    nama={terpilih.komoditasId}
                    ukuran={24}
                    alt=""
                    className="flex-none"
                  />
                ) : null}
                <span
                  className={cx(
                    'truncate text-isi',
                    terpilih ? 'text-teks' : 'text-teks-pendukung',
                  )}
                >
                  {terpilih ? terpilih.label : placeholder}
                </span>
              </span>
              <Ikon
                nama="panah-bawah"
                ukuran={18}
                className={cx(
                  'flex-none text-teks-pendukung transition-transform duration-200',
                  open && 'rotate-180',
                )}
              />
            </ListboxButton>

            {/* Panel Pilihan Desktop */}
            {open && isLayarLebar ? (
              <ListboxOptions
                static
                className="absolute left-0 right-0 top-full z-40 mt-1.5 flex max-h-64 flex-col overflow-hidden rounded-2xl border border-garis bg-putih shadow-kartu focus:outline-none animate-masuk-halaman"
              >
                {perluCari ? (
                  <div className="border-b border-garis p-2 bg-embun-pagi/50">
                    <div className="relative flex items-center">
                      <Ikon
                        nama="cari"
                        ukuran={16}
                        className="absolute left-3 text-teks-pendukung pointer-events-none"
                      />
                      <input
                        ref={inputCariRef}
                        type="text"
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder="Cari pilihan..."
                        className="w-full rounded-lg border border-garis bg-putih py-1.5 pl-8 pr-3 text-isi text-teks focus:border-daun-tua focus:outline-none"
                      />
                    </div>
                  </div>
                ) : null}
                <div className="min-h-0 flex-1 max-h-56 overflow-y-auto p-1 overscroll-contain">
                  {opsiTersaring.length === 0 ? (
                    <div className="px-4 py-3 text-center text-keterangan text-teks-pendukung">
                      Pilihan tidak ditemukan
                    </div>
                  ) : (
                    opsiTersaring.map((opsi) => (
                      <ListboxOption
                        key={opsi.nilai}
                        value={opsi.nilai}
                        disabled={opsi.nonaktif}
                        className={({ active, selected, disabled: optDisabled }) =>
                          cx(
                            'group flex min-h-sentuh cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-isi transition-colors',
                            selected
                              ? 'bg-daun-lembut font-medium text-teks'
                              : active
                                ? 'bg-embun-pagi text-teks'
                                : 'text-teks',
                            optDisabled && 'cursor-not-allowed opacity-50',
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className="flex min-w-0 flex-1 items-center gap-2.5">
                              {opsi.komoditasId ? (
                                <IlustrasiKomoditas
                                  nama={opsi.komoditasId}
                                  ukuran={28}
                                  alt=""
                                  className="flex-none"
                                />
                              ) : null}
                              <span className="truncate">{opsi.label}</span>
                            </span>
                            {selected ? (
                              <Ikon
                                nama="centang"
                                ukuran={18}
                                className="flex-none text-daun-tua"
                              />
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))
                  )}
                </div>
              </ListboxOptions>
            ) : null}

            {/* Panel Pilihan Mobile (Lembar Bawah) */}
            {open && !isLayarLebar
              ? createPortal(
                  <div className="fixed inset-0 z-50 flex items-end justify-center animate-masuk-halaman">
                    <div
                      className="absolute inset-0 bg-tirai"
                      aria-hidden="true"
                      onClick={() => {
                        buttonRef.current?.click();
                      }}
                    />
                    <ListboxOptions
                      static
                      className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-putih p-4 shadow-kartu animate-masuk-halaman focus:outline-none"
                    >
                      <span
                        aria-hidden="true"
                        className="mb-2 h-1 w-10 self-center rounded-full bg-garis"
                      />
                      <div className="mb-2 flex items-center justify-between border-b border-garis pb-2">
                        <span className="text-isi font-semibold text-teks">{label}</span>
                      </div>

                      {perluCari ? (
                        <div className="mb-2">
                          <div className="relative flex items-center">
                            <Ikon
                              nama="cari"
                              ukuran={16}
                              className="absolute left-3 text-teks-pendukung pointer-events-none"
                            />
                            <input
                              type="text"
                              value={kataKunci}
                              onChange={(e) => setKataKunci(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              placeholder="Cari pilihan..."
                              className="w-full rounded-xl border border-garis bg-embun-pagi py-2 pl-9 pr-3 text-isi text-teks focus:border-daun-tua focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="min-h-0 flex-1 max-h-[60vh] overflow-y-auto overscroll-contain">
                        {opsiTersaring.length === 0 ? (
                          <div className="px-4 py-6 text-center text-keterangan text-teks-pendukung">
                            Pilihan tidak ditemukan
                          </div>
                        ) : (
                          opsiTersaring.map((opsi) => (
                            <ListboxOption
                              key={opsi.nilai}
                              value={opsi.nilai}
                              disabled={opsi.nonaktif}
                              className={({ active, selected, disabled: optDisabled }) =>
                                cx(
                                  'flex min-h-sentuh cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-isi transition-colors',
                                  selected
                                    ? 'bg-daun-lembut font-medium text-teks'
                                    : active
                                      ? 'bg-embun-pagi text-teks'
                                      : 'text-teks',
                                  optDisabled && 'cursor-not-allowed opacity-50',
                                )
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className="flex min-w-0 flex-1 items-center gap-3">
                                    {opsi.komoditasId ? (
                                      <IlustrasiKomoditas
                                        nama={opsi.komoditasId}
                                        ukuran={28}
                                        alt=""
                                        className="flex-none"
                                      />
                                    ) : null}
                                    <span className="truncate">{opsi.label}</span>
                                  </span>
                                  {selected ? (
                                    <Ikon
                                      nama="centang"
                                      ukuran={18}
                                      className="flex-none text-daun-tua"
                                    />
                                  ) : null}
                                </>
                              )}
                            </ListboxOption>
                          ))
                        )}
                      </div>
                    </ListboxOptions>
                  </div>,
                  document.body,
                )
              : null}
          </>
        )}
      </Listbox>

      <PesanKolom id={idKontrol} galat={galat} bantuan={bantuan} />
    </div>
  );
}
