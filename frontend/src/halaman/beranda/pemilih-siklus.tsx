/**
 * Pemilih siklus di Beranda berupa kartu bergambar (AG-17, acuan docs/tema-baru/acuan/Pemilih-Siklus.png):
 * ilustrasi komoditas, nama, lahan atau pembeli, batang progres umur (bersegmen per petak untuk
 * kelompok petak pesanan, D-40), dan chip "n terlambat". Satu baris yang bisa digeser; di desktop
 * ada tombol panah bila kartu tidak muat. Satu pilihan: radiogroup, panah kiri/kanan berpindah.
 */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChipStatus } from '../../komponen/chip-status';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { IlustrasiKomoditas } from '../../komponen/ilustrasi';
import { teksBeranda as t } from '../../teks/beranda';

export interface OpsiKartuSiklus {
  id: string;
  /** Nama lengkap untuk pembaca layar, mis. "Sawi hijau · Rak hidroponik teras". */
  nama: string;
  komoditasId: string;
  judul: string;
  /** Nama lahan, atau "Untuk <pembeli>" untuk kelompok petak pesanan. */
  sub: string;
  /** Progres umur 0–1; satu nilai per petak untuk kelompok petak. */
  segmen: number[];
  keterangan: string;
  terlambat: number;
}

function BatangProgres({ segmen }: { segmen: number[] }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {segmen.map((p, i) => (
        <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-garis">
          <div
            className="h-full rounded-full bg-limau bg-progres-limau"
            style={{ width: `${Math.round(Math.min(1, Math.max(0, p)) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function PemilihSiklus({
  opsi,
  nilai,
  onPilih,
}: {
  opsi: OpsiKartuSiklus[];
  nilai: string;
  onPilih: (id: string) => void;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const kartu = useRef(new Map<string, HTMLButtonElement>());
  const [geser, setGeser] = useState({ kiri: false, kanan: false });

  const ukurGeser = () => {
    const w = wadah.current;
    if (!w) return;
    setGeser({
      kiri: w.scrollLeft > 8,
      kanan: w.scrollLeft + w.clientWidth < w.scrollWidth - 8,
    });
  };

  useLayoutEffect(() => {
    ukurGeser();
    const w = wadah.current;
    if (!w || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(ukurGeser);
    ro.observe(w);
    return () => ro.disconnect();
  }, [opsi.length]);

  // Kartu terpilih selalu terlihat di dalam deretan, tanpa menggulir halaman ke atas atau bawah.
  useEffect(() => {
    const w = wadah.current;
    const el = kartu.current.get(nilai);
    if (!w || !el) return;
    const kiri = el.offsetLeft - w.offsetLeft;
    if (kiri < w.scrollLeft || kiri + el.offsetWidth > w.scrollLeft + w.clientWidth)
      w.scrollTo?.({ left: Math.max(0, kiri - 8) });
  }, [nilai]);

  function tekanTombol(e: KeyboardEvent<HTMLDivElement>) {
    const i = opsi.findIndex((o) => o.id === nilai);
    const ke =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (i + 1) % opsi.length
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? (i - 1 + opsi.length) % opsi.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? opsi.length - 1
              : null;
    if (ke === null) return;
    e.preventDefault();
    const id = opsi[ke]!.id;
    onPilih(id);
    kartu.current.get(id)?.focus();
  }

  const geserKe = (arah: 1 | -1) =>
    wadah.current?.scrollBy?.({ left: arah * wadah.current.clientWidth * 0.8, behavior: 'smooth' });

  const tombolPanah = (arah: 1 | -1) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={arah < 0 ? t.geserKiri : t.geserKanan}
      onClick={() => geserKe(arah)}
      className={cx(
        'fokus-cincin absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-putih p-0 text-teks shadow-ikon lg:grid',
        arah < 0 ? '-left-3' : '-right-3',
      )}
    >
      <Ikon nama={arah < 0 ? 'panah-kiri' : 'panah-kanan'} />
    </button>
  );

  return (
    <div className="relative">
      {geser.kiri ? tombolPanah(-1) : null}
      <div
        ref={wadah}
        role="radiogroup"
        aria-label={t.pilihSiklus}
        onKeyDown={tekanTombol}
        onScroll={ukurGeser}
        className="-mx-1 -mb-5 flex scroll-px-1 snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-9 pt-1"
      >
        {opsi.map((o) => {
          const aktif = o.id === nilai;
          return (
            <button
              key={o.id}
              ref={(el) => {
                if (el) kartu.current.set(o.id, el);
                else kartu.current.delete(o.id);
              }}
              type="button"
              role="radio"
              aria-checked={aktif}
              aria-label={o.terlambat ? `${o.nama}, ${t.jumlahTerlambat(o.terlambat)}` : o.nama}
              tabIndex={aktif ? 0 : -1}
              onClick={() => onPilih(o.id)}
              className={cx(
                'fokus-cincin flex w-kartu-siklus flex-none cursor-pointer snap-start flex-col gap-3 rounded-kartu border-2 bg-putih p-4 text-left text-isi text-teks shadow-ikon lg:w-kartu-siklus-lebar',
                aktif ? 'border-limau' : 'border-transparent hover:border-garis-kuat',
              )}
            >
              <span className="flex items-center gap-3">
                <IlustrasiKomoditas nama={o.komoditasId} ukuran={48} alt="" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{o.judul}</span>
                  <span className="truncate text-keterangan text-teks-pendukung">{o.sub}</span>
                </span>
              </span>
              <BatangProgres segmen={o.segmen} />
              <span className="flex min-h-chip items-center justify-between gap-2">
                <span className="min-w-0 text-keterangan">{o.keterangan}</span>
                {o.terlambat ? (
                  <ChipStatus status="terlambat" className="flex-none">
                    {t.jumlahTerlambat(o.terlambat)}
                  </ChipStatus>
                ) : aktif ? (
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 flex-none place-items-center rounded-full bg-limau text-putih"
                  >
                    <Ikon nama="centang" ukuran={18} tebal={2.6} />
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {geser.kanan ? tombolPanah(1) : null}
    </div>
  );
}
