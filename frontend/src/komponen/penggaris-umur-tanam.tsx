import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  hitungTataLetakPenggaris,
  ukurTeksPerkiraan,
  type JadwalPin,
  type StatusPin,
  type UkurTeks,
  type VarianPenggaris,
} from '../lib/tata-letak-penggaris';
import { teksKomponen } from '../teks/komponen';
import { cx } from './gabung-kelas';
import { Ikon, type NamaIkon } from './ikon';

export type { JadwalPin, StatusPin } from '../lib/tata-letak-penggaris';

const IKON_PIN: Partial<Record<StatusPin, NamaIkon>> = {
  selesai: 'centang',
  besok: 'jam',
  terlambat: 'peringatan',
  panen: 'panen',
};

const KELAS_PIN: Record<StatusPin, string> = {
  selesai: 'bg-daun-tua text-putih',
  besok: 'border-3 border-matahari bg-matahari-lembut text-matahari-teks',
  belum: 'border-2 border-garis-kuat bg-putih',
  terlambat: 'border-2.5 border-tomat bg-tomat-lembut text-tomat-teks',
  panen: 'border-3 border-tanah bg-putih text-tanah',
};

const KELAS_TANGKAI: Record<StatusPin, string> = {
  selesai: 'bg-daun-tua',
  besok: 'bg-matahari',
  belum: 'bg-garis-kuat',
  terlambat: 'bg-tomat',
  panen: 'bg-tanah',
};

const KELAS_KALIMAT: Record<StatusPin, string> = {
  selesai: 'text-daun-tua',
  besok: 'font-medium text-matahari-teks',
  belum: 'text-teks-pendukung',
  terlambat: 'font-medium text-tomat-teks',
  panen: 'text-tanah',
};

/** Pin bulat berstatus. Ukuran 24/28/32 piksel sesuai konteks. */
export function Pin({
  status,
  ukuran,
  className,
}: {
  status: StatusPin;
  ukuran: 24 | 28 | 32;
  className?: string;
}) {
  const ikon = IKON_PIN[status];
  const kelasUkuran = { 24: 'h-6 w-6', 28: 'h-7 w-7', 32: 'h-8 w-8' }[ukuran];
  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid flex-none place-items-center rounded-full',
        kelasUkuran,
        KELAS_PIN[status],
        className,
      )}
    >
      {ikon ? (
        <Ikon
          nama={ikon}
          ukuran={Math.round(ukuran * (status === 'selesai' ? 0.62 : 0.56))}
          tebal={status === 'selesai' ? 3 : 2.5}
        />
      ) : null}
    </span>
  );
}

let kanvas: CanvasRenderingContext2D | null | undefined;
/** Ukur lebar teks 16px Outfit lewat canvas; cadangan perkiraan bila tidak ada. */
const ukurTeksCanvas: UkurTeks = (teks, berat) => {
  try {
    if (kanvas === undefined) kanvas = document.createElement('canvas').getContext('2d');
    if (!kanvas) return ukurTeksPerkiraan(teks, berat);
    kanvas.font = `${berat} 16px Outfit, system-ui, sans-serif`;
    return Math.ceil(kanvas.measureText(teks).width);
  } catch {
    return ukurTeksPerkiraan(teks, berat);
  }
};

export interface PenggarisUmurTanamProps {
  /** hp: pin tanpa label, daftar di bawah. lebar: label nama, hari, status di atas pin. */
  varian?: VarianPenggaris;
  hariIni: number;
  hariPanen: number;
  jadwal: JadwalPin[];
  /** Bawaan: tampil di varian hp. */
  tampilkanDaftar?: boolean;
  className?: string;
}

/**
 * Elemen khas Tani Muda: garis dari hari ke-0 (tanam) sampai panen, bagian terlalui hijau,
 * penanda gelap untuk hari ini, pin untuk setiap jadwal.
 */
export function PenggarisUmurTanam({
  varian = 'hp',
  hariIni,
  hariPanen,
  jadwal,
  tampilkanDaftar,
  className,
}: PenggarisUmurTanamProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(0);
  const [, setFontSiap] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setLebar(el.clientWidth);
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => setLebar(el.clientWidth))
        : null;
    ro?.observe(el);
    // Ukuran teks berubah setelah font selesai dimuat.
    document.fonts?.ready.then(() => setFontSiap((x) => x + 1)).catch(() => undefined);
    return () => ro?.disconnect();
  }, []);

  const t = teksKomponen.penggaris;
  const tata = useMemo(
    () =>
      hitungTataLetakPenggaris({
        lebar,
        hariIni,
        hariPanen,
        jadwal,
        varian,
        ukurTeks: ukurTeksCanvas,
        teks: t,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lebar, hariIni, hariPanen, jadwal, varian],
  );
  const daftar = tampilkanDaftar ?? varian === 'hp';
  const pinU = tata.ukuranPin as 28 | 32;
  const lebarL = varian === 'lebar';

  return (
    <div className={cx('relative', className)}>
      <div
        ref={ref}
        className="relative w-full"
        style={{ height: tata.tinggi }}
        role="img"
        aria-label={tata.ringkasan}
      >
        {lebar > 0 ? (
          <>
            <div
              className="absolute overflow-hidden rounded-full bg-garis"
              style={{
                left: tata.jalur.kiri,
                width: tata.jalur.lebar,
                top: tata.jalur.atas,
                height: tata.jalur.tinggi,
              }}
            >
              <div
                className="absolute bottom-0 left-0 top-0 bg-daun-tua"
                style={{ width: tata.jalur.lebarIsi }}
              />
            </div>
            {tata.tik.map((k) => (
              <span
                key={`t${k.x}`}
                className="absolute h-1.5 w-0.5 rounded-xs bg-garis-kuat"
                style={{ left: k.x, top: k.atas }}
              />
            ))}
            {tata.ujung.map((u) => (
              <span
                key={`u${u.teks}`}
                className="absolute whitespace-nowrap text-keterangan tabular-nums text-teks-pendukung"
                style={{ left: u.kiri, top: u.atas }}
              >
                {u.teks}
              </span>
            ))}
            {tata.pin.map((p, i) => (
              <span key={`p${i}`}>
                <span
                  className={cx('absolute -ml-px w-0.5', KELAS_TANGKAI[p.status])}
                  style={{
                    left: p.x,
                    top: p.yPin + pinU,
                    height: tata.jalur.atas - (p.yPin + pinU),
                  }}
                />
                <span className="absolute" style={{ left: p.x - pinU / 2, top: p.yPin }}>
                  <Pin status={p.status} ukuran={pinU} />
                </span>
                {lebarL ? (
                  <span
                    className={cx(
                      'absolute flex flex-col whitespace-nowrap',
                      p.rata === 'tengah'
                        ? 'text-center'
                        : p.rata === 'kanan'
                          ? 'text-right'
                          : 'text-left',
                    )}
                    style={{ left: p.kiri, width: p.lebar, top: p.yPin - 72 + 2 }}
                  >
                    <span className="text-isi font-semibold text-teks">{p.jadwal.label}</span>
                    <span className="text-keterangan tabular-nums text-teks-pendukung">
                      {t.hariKe(p.jadwal.hari)}
                    </span>
                    {p.frasa ? (
                      <span className={cx('text-keterangan tabular-nums', KELAS_KALIMAT[p.status])}>
                        {p.frasa}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </span>
            ))}
            <span
              className="absolute w-1 rounded-xs bg-teks"
              style={{ left: tata.penanda.x, top: tata.penanda.atas, height: tata.penanda.tinggi }}
            />
            <span
              className="absolute h-8 whitespace-nowrap rounded-full bg-teks px-3 text-isi font-semibold leading-8 tabular-nums text-putih"
              style={{ left: tata.labelHariIni.kiri, top: tata.labelHariIni.atas }}
            >
              {tata.labelHariIni.teks}
            </span>
          </>
        ) : null}
      </div>
      {daftar && tata.pin.length ? (
        <ul className="m-0 mt-4 grid list-none gap-2 border-t border-garis p-0 pt-3">
          {tata.pin.map((p, i) => (
            <li key={i} className="flex min-h-8 flex-wrap items-center gap-x-3">
              <Pin status={p.status} ukuran={24} />
              <span className="text-isi font-semibold text-teks">{p.jadwal.label}</span>
              <span className={cx('text-keterangan tabular-nums', KELAS_KALIMAT[p.status])}>
                {p.kalimat}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
