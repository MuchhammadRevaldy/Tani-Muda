/**
 * Kerangka menu Pesanan (papan 29, 30, 33): judul "Pesanan" dan tab Di sekitar / Kiriman saya.
 * HP: tab di bawah judul selebar layar. Desktop: keterangan di bawah judul, tab di kanan.
 * Membuka menu ini menandai pesanan sudah dilihat, sehingga lencana menu Pesanan hilang (D-37).
 */
import { useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useKomoditas } from '../../api/kueri';
import { usePesananDilihat } from '../../api/pesanan-dilihat';
import type { Komoditas } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
import { normalisasiNomorHp } from '../../lib/nomor-hp';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { teksPesanan as t } from '../../teks/pesanan';

function TabPesanan({ className }: { className?: string }) {
  const tab = (ke: string, label: string) => (
    <NavLink
      to={ke}
      end
      className={({ isActive }) =>
        cx(
          'fokus-cincin flex min-h-sentuh items-center justify-center rounded-md px-4 text-center no-underline',
          isActive ? 'bg-daun-lembut font-semibold text-daun-tua' : 'font-medium text-teks',
        )
      }
    >
      {label}
    </NavLink>
  );
  return (
    <nav
      aria-label={t.tabLabel}
      className={cx(
        'grid grid-cols-2 gap-1 rounded-lg border border-garis bg-putih p-1',
        className,
      )}
    >
      {tab('/pesanan', t.tabSekitar)}
      {tab('/pesanan/kiriman', t.tabKiriman)}
    </nav>
  );
}

export function KerangkaPesanan({
  keterangan,
  children,
}: {
  /** Keterangan di bawah judul; hanya desktop (di HP halaman menaruhnya di bawah filter). */
  keterangan?: ReactNode;
  children: ReactNode;
}) {
  const lebar = useLayarLebar();
  const { tandaiDilihat } = usePesananDilihat();
  useEffect(() => {
    tandaiDilihat();
  }, [tandaiDilihat]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 text-judul-halaman font-semibold">{t.judul}</h1>
          {lebar && keterangan ? (
            <p className="m-0 text-keterangan text-teks-pendukung">{keterangan}</p>
          ) : null}
        </div>
        <TabPesanan className="w-full lg:w-tab-siklus" />
      </div>
      {children}
    </div>
  );
}

/** Tautan WhatsApp admin dari nomor di konfigurasi (D-13); null bila nomornya tidak sah. */
export function tautanWhatsApp(nomor: string): string | null {
  const r = normalisasiNomorHp(nomor);
  return r.ok ? `https://wa.me/${r.nilai.slice(1)}` : null;
}

/** Komoditas per id dan kata hasil untuk kalimat ("sayur" atau "hasil panen"). */
export function useKomoditasPeta(): {
  nama: (id: string) => string;
  komoditas: (id: string) => Komoditas | null;
  hasil: (id: string) => string;
} {
  const q = useKomoditas();
  const cari = (id: string) => q.data?.find((k) => k.id === id) ?? null;
  return {
    komoditas: cari,
    nama: (id) => cari(id)?.nama ?? id,
    hasil: (id) => (cari(id)?.kategori === 'tanaman_pangan' ? t.hasilPanen : t.hasilSayur),
  };
}
