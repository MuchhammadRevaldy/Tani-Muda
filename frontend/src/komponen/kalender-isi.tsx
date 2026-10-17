import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { id } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { cx } from './gabung-kelas';
import { Ikon } from './ikon';

export interface KalenderIsiProps {
  nilai?: string;
  onPilih: (tanggal: string) => void;
  min?: string;
  max?: string;
  bisaDihapus?: boolean;
  onTutup?: () => void;
  className?: string;
}

function keTanggalObjek(iso?: string): Date | undefined {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const [t, b, h] = iso.split('-').map(Number);
  if (!t || !b || !h) return undefined;
  return new Date(t, b - 1, h);
}

function keISO(d: Date): string {
  const th = d.getFullYear();
  const bl = String(d.getMonth() + 1).padStart(2, '0');
  const tg = String(d.getDate()).padStart(2, '0');
  return `${th}-${bl}-${tg}`;
}

export function KalenderIsi({
  nilai,
  onPilih,
  min,
  max,
  bisaDihapus = true,
  onTutup,
  className,
}: KalenderIsiProps) {
  const tanggalTerpilih = keTanggalObjek(nilai);
  const [bulanTampil, setBulanTampil] = useState<Date>(
    () => tanggalTerpilih ?? new Date(),
  );

  const tglMin = keTanggalObjek(min);
  const tglMax = keTanggalObjek(max);

  const isDateDisabled = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (tglMin) {
      const dMin = new Date(tglMin.getFullYear(), tglMin.getMonth(), tglMin.getDate());
      if (d < dMin) return true;
    }
    if (tglMax) {
      const dMax = new Date(tglMax.getFullYear(), tglMax.getMonth(), tglMax.getDate());
      if (d > dMax) return true;
    }
    return false;
  };

  function handlePilih(d?: Date) {
    if (!d) return;
    onPilih(keISO(d));
    onTutup?.();
  }

  function handleHariIni() {
    const hariIni = new Date();
    onPilih(keISO(hariIni));
    onTutup?.();
  }

  function handleHapus() {
    onPilih('');
    onTutup?.();
  }

  return (
    <div
      className={cx(
        'kalender-tani flex flex-col items-center bg-putih p-3 text-isi text-teks',
        className,
      )}
    >
      <DayPicker
        mode="single"
        locale={id}
        weekStartsOn={1}
        selected={tanggalTerpilih}
        onSelect={handlePilih}
        month={bulanTampil}
        onMonthChange={setBulanTampil}
        disabled={tglMin || tglMax ? isDateDisabled : undefined}
        classNames={{
          root: 'rdp-root m-0 select-none',
          month_caption: 'flex justify-center items-center h-10 font-semibold text-isi text-teks mb-2',
          nav: 'flex items-center justify-between absolute left-3 right-3 top-4 pointer-events-none',
          button_previous:
            'pointer-events-auto p-1.5 rounded-lg border border-garis bg-putih text-teks hover:bg-embun-pagi transition-colors focus:border-daun-tua focus:shadow-fokus focus:outline-none',
          button_next:
            'pointer-events-auto p-1.5 rounded-lg border border-garis bg-putih text-teks hover:bg-embun-pagi transition-colors focus:border-daun-tua focus:shadow-fokus focus:outline-none',
          weekday: 'text-keterangan font-medium text-teks-pendukung h-9 w-10 text-center',
          day: 'h-10 w-10 p-0 text-center',
          day_button:
            'h-9 w-9 mx-auto rounded-full text-isi transition-colors focus:shadow-fokus focus:outline-none hover:bg-embun-pagi',
          selected: 'bg-limau text-putih font-semibold rounded-full',
          today: 'font-bold text-daun-tua',
          disabled: 'opacity-35 cursor-not-allowed hover:bg-transparent',
          outside: 'opacity-40',
        }}
      />

      <div className="mt-3 flex w-full items-center justify-between gap-2 border-t border-garis pt-3">
        <button
          type="button"
          onClick={handleHariIni}
          className="rounded-lg px-3 py-1.5 text-keterangan font-medium text-daun-tua hover:bg-daun-lembut transition-colors focus:shadow-fokus focus:outline-none"
        >
          Hari ini
        </button>

        <div className="flex items-center gap-2">
          {bisaDihapus && nilai ? (
            <button
              type="button"
              onClick={handleHapus}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-keterangan font-medium text-tomat-teks hover:bg-tomat-lembut transition-colors focus:shadow-fokus focus:outline-none"
            >
              <Ikon nama="hapus" ukuran={16} />
              <span>Hapus</span>
            </button>
          ) : null}

          {onTutup ? (
            <button
              type="button"
              onClick={onTutup}
              className="rounded-lg px-3 py-1.5 text-keterangan font-medium text-teks-pendukung hover:bg-embun-pagi transition-colors focus:shadow-fokus focus:outline-none"
            >
              Tutup
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
