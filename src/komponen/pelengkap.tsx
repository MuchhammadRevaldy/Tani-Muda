import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatHitungMundur } from '../lib/format';
import { hapusMundurOtp, isiOtp, kodeLengkap, otpKosong } from '../lib/kotak-otp';
import { teksKomponen } from '../teks/komponen';
import { cx } from './gabung-kelas';
import { Ikon } from './ikon';

/* ---------- KotakOtp ---------- */

export function KotakOtp({
  onLengkap,
  sisaDetikAwal = 0,
  onKirimUlang,
  nilaiAwal,
}: {
  onLengkap?: (kode: string) => void;
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
              className="h-14 w-full rounded-md border-1.5 border-garis-kuat bg-putih p-0 text-center text-tampil-1 font-semibold text-teks outline-none focus:border-daun-tua focus:shadow-fokus"
            />
          ))}
        </div>
      </fieldset>
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

/** Tanya jawab yang bisa dilipat (landing). Butir pertama terbuka. */
export function FaqLipat({ butir }: { butir: { tanya: string; jawab: ReactNode }[] }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-garis bg-putih">
      {butir.map((b, i) => (
        <details
          key={i}
          open={i === 0}
          className={cx('group px-4', i > 0 && 'border-t border-garis')}
        >
          <summary className="fokus-cincin flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
            <span>{b.tanya}</span>
            <Ikon
              nama="panah-kanan"
              className="rotate-90 text-teks-pendukung transition-transform group-open:-rotate-90"
            />
          </summary>
          <p className="mb-4 mt-0 text-teks-pendukung">{b.jawab}</p>
        </details>
      ))}
    </div>
  );
}
