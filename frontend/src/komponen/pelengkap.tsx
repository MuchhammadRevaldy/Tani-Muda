import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { formatHitungMundur } from '../lib/format';
import { hapusMundurOtp, isiOtp, kodeLengkap, otpKosong } from '../lib/kotak-otp';
import { teksKomponen } from '../teks/komponen';
import { cx } from './gabung-kelas';
import { Ikon } from './ikon';

/* ---------- KotakOtp ---------- */

export function KotakOtp({
  onLengkap,
  onUbah,
  sisaDetikAwal = 0,
  onKirimUlang,
  nilaiAwal,
  galat,
}: {
  onLengkap?: (kode: string) => void;
  /** Setiap perubahan: kode 6 angka bila lengkap, null bila belum. */
  onUbah?: (kode: string | null) => void;
  /** Pesan galat di bawah kotak (mis. kode salah). */
  galat?: ReactNode;
  /** Detik sebelum "Kirim ulang kode" bisa diketuk. */
  sisaDetikAwal?: number;
  onKirimUlang?: () => void;
  /** Untuk halaman /komponen: isi awal, mis. "48211". */
  nilaiAwal?: string;
}) {
  const t = teksKomponen.otp;
  const [digit, setDigit] = useState(() =>
    nilaiAwal ? isiOtp(otpKosong(), 0, nilaiAwal).digit : otpKosong(),
  );
  const [sisa, setSisa] = useState(sisaDetikAwal);
  const kotak = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (sisa <= 0) return;
    const id = window.setTimeout(() => setSisa((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [sisa]);

  function terapkan(h: { digit: string[]; fokus: number }) {
    setDigit(h.digit);
    kotak.current[h.fokus]?.focus();
    const kode = kodeLengkap(h.digit);
    onUbah?.(kode);
    if (kode) onLengkap?.(kode);
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 p-0 font-medium">{t.label}</legend>
        <div className="grid grid-cols-6 gap-2">
          {digit.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                kotak.current[i] = el;
              }}
              aria-label={t.digit(i + 1)}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              value={d}
              onChange={(e) =>
                terapkan(isiOtp(digit, i, e.target.value.slice(d ? 1 : 0) || e.target.value))
              }
              onPaste={(e) => {
                e.preventDefault();
                terapkan(isiOtp(digit, i, e.clipboardData.getData('text')));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace') {
                  e.preventDefault();
                  terapkan(hapusMundurOtp(digit, i));
                }
              }}
              aria-invalid={galat ? true : undefined}
              className={cx(
                'h-14 w-full rounded-md bg-putih p-0 text-center text-tampil-1 font-semibold text-teks outline-none focus:border-daun-tua focus:shadow-fokus',
                galat ? 'border-2 border-tomat' : 'border-1.5 border-garis-kuat',
              )}
            />
          ))}
        </div>
      </fieldset>
      {galat ? (
        <p
          role="alert"
          className="m-0 flex items-start gap-2 text-keterangan font-medium text-tomat-teks"
        >
          <Ikon nama="peringatan" ukuran={20} className="mt-px" />
          <span>{galat}</span>
        </p>
      ) : null}
      {sisa > 0 ? (
        <div className="flex items-center gap-2 text-teks-pendukung" aria-live="polite">
          <Ikon nama="jam" ukuran={20} />
          <span>{t.kirimUlangDalam(formatHitungMundur(sisa))}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            onKirimUlang?.();
            setSisa(sisaDetikAwal);
          }}
          className="fokus-cincin -ml-2 inline-flex min-h-sentuh cursor-pointer items-center self-start rounded-md border-0 bg-transparent px-2 text-isi font-semibold text-daun-tua"
        >
          {t.kirimUlang}
        </button>
      )}
    </div>
  );
}

/* ---------- Stepper ---------- */

/** "Langkah n dari 3" dengan batang kemajuan. */
export function Stepper({ langkah, total = 3 }: { langkah: number; total?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-teks-pendukung">
        {teksKomponen.stepper.langkah(langkah, total)}
      </span>
      <div
        aria-hidden="true"
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx('h-1.5 rounded-full', i < langkah ? 'bg-daun-tua' : 'bg-garis')}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- DaftarLangkah ---------- */

/** Daftar bernomor (cara mengerjakan, aturan gagal panen). */
export function DaftarLangkah({ butir }: { butir: ReactNode[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
      {butir.map((b, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-daun-lembut font-semibold leading-5.5 text-daun-tua">
            {i + 1}
          </span>
          <span>{b}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- DaftarSyarat ---------- */

/** Daftar bercentang (standar kualitas, keunggulan). */
export function DaftarSyarat({ butir }: { butir: ReactNode[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {butir.map((b, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="flex flex-none pt-0.5 text-daun-tua">
            <Ikon nama="centang" ukuran={20} tebal={2.5} />
          </span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- FaqLipat ---------- */

/**
 * Tanya jawab yang bisa dibuka dan ditutup (landing, Bantuan); butir pertama terbuka (D-61): tombol dengan aria-expanded, isi bertransisi tinggi
 * lewat grid-template-rows 0fr → 1fr ditambah opacity (kelas `lipatan`), panah berputar 180°.
 */
export function FaqLipat({ butir }: { butir: { tanya: string; jawab: ReactNode }[] }) {
  const idDasar = useId();
  const [terbuka, setTerbuka] = useState<Set<number>>(() => new Set([0]));
  const ganti = (i: number) =>
    setTerbuka((lama) => {
      const baru = new Set(lama);
      if (baru.has(i)) baru.delete(i);
      else baru.add(i);
      return baru;
    });
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-garis bg-putih">
      {butir.map((b, i) => {
        const buka = terbuka.has(i);
        const idIsi = `${idDasar}-${i}`;
        return (
          <div key={i} className={cx('px-4', i > 0 && 'border-t border-garis')}>
            <h3 className="m-0 text-isi">
              <button
                type="button"
                aria-expanded={buka}
                aria-controls={idIsi}
                onClick={() => ganti(i)}
                className="fokus-cincin flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-0 text-left text-isi font-semibold text-teks"
              >
                <span>{b.tanya}</span>
                <Ikon
                  nama="panah-kanan"
                  className={cx(
                    'rotate-90 text-teks-pendukung transition-transform duration-lambat ease-keluar',
                    buka && '-rotate-90',
                  )}
                />
              </button>
            </h3>
            <div id={idIsi} className="lipatan" data-terbuka={buka} inert={!buka}>
              <div>
                <p className="mb-4 mt-0 text-teks-pendukung">{b.jawab}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
