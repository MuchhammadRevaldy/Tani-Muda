/**
 * Kerangka detail siklus (papan 20, 21, 27, 28, T4.10): tautan kembali, nama siklus dan keterangan,
 * kartu penggaris umur tanam, tab Jadwal / Modal / Jurnal (tautan ke halaman terpisah,
 * `aria-current`). Desktop: tab dan penggaris di panel kanan 360px.
 */
import type { ReactNode } from 'react';
import { Link, NavLink, Navigate, useParams } from 'react-router-dom';
import { useKomoditas, useMetode, useResep, useSiklus, useTugas } from '../../api/kueri';
import { tugasKeDomain } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import type { Komoditas, MetodeTanam, ResepTanam, SiklusDetail, Tugas } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { PenggarisUmurTanam } from '../../komponen/penggaris-umur-tanam';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { pinPenggaris } from '../../lib/beranda';
import { selisihHari } from '../../lib/tanggal';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { ukuranSiklus } from '../beranda/kartu-siklus';
import { useNamaSiklus } from './nama-siklus';

export interface DataSiklus {
  siklus: SiklusDetail;
  nama: string;
  komoditas: Komoditas | null;
  metode: MetodeTanam | null;
  resep: ResepTanam | null;
  tugas: Tugas[];
  hariPanen: number;
}

/** Semua data satu siklus untuk halaman detail; null selama dimuat. */
export function useDataSiklus(id: string | null): {
  data: DataSiklus | null;
  memuat: boolean;
  galat: string | null;
} {
  const siklusQ = useSiklus(id);
  const tugasQ = useTugas(id);
  const komoditasQ = useKomoditas();
  const metodeQ = useMetode();
  const resepQ = useResep(siklusQ.data?.resep_id ?? null);
  const namaSiklus = useNamaSiklus();
  const s = siklusQ.data;
  if (siklusQ.isError) return { data: null, memuat: false, galat: siklusQ.error.message };
  if (!s || tugasQ.isPending) return { data: null, memuat: true, galat: null };
  const komoditas = komoditasQ.data?.find((k) => k.id === s.komoditas_id) ?? null;
  const hariPanen =
    s.tanggal_tanam && s.perkiraan_tanggal_panen
      ? selisihHari(s.tanggal_tanam, s.perkiraan_tanggal_panen)
      : (resepQ.data?.umur_panen_hari ?? 0);
  return {
    data: {
      siklus: s,
      nama: namaSiklus.siklus(s),
      komoditas,
      metode: metodeQ.data?.find((m) => m.id === s.metode_id) ?? null,
      resep: resepQ.data ?? null,
      tugas: tugasQ.data ?? [],
      hariPanen,
    },
    memuat: false,
    galat: null,
  };
}

function KartuUmur({ d, hariIni }: { d: DataSiklus; hariIni: string }) {
  const s = d.siklus;
  if (!s.tanggal_tanam || !s.perkiraan_tanggal_panen) return null;
  const hariKe = s.hari_ke ?? 0;
  const pin = pinPenggaris(d.tugas.map(tugasKeDomain), hariIni, d.hariPanen);
  return (
    <Kartu
      tingkatJudul={2}
      judul={t.hariKeDari(hariKe, d.hariPanen)}
      keterangan={t.panenLagi(
        s.perkiraan_tanggal_panen,
        selisihHari(hariIni, s.perkiraan_tanggal_panen),
      )}
    >
      {s.resep_contoh ? (
        <LabelKecil nada="contoh" className="mb-3">
          {teksUmum.labelContoh}
        </LabelKecil>
      ) : null}
      <PenggarisUmurTanam
        varian="hp"
        hariIni={hariKe}
        hariPanen={d.hariPanen}
        jadwal={pin}
        tampilkanDaftar={false}
      />
    </Kartu>
  );
}

function TabSiklus({ id }: { id: string }) {
  const tab: { ke: string; label: string }[] = [
    { ke: 'jadwal', label: t.tab.jadwal },
    { ke: 'modal', label: t.tab.modal },
    { ke: 'jurnal', label: t.tab.jurnal },
  ];
  return (
    <nav
      aria-label={t.bagianSiklus}
      className="grid grid-cols-3 gap-1 rounded-tab border border-garis bg-putih p-1"
    >
      {tab.map((x) => (
        <NavLink
          key={x.ke}
          to={`/kebun/${encodeURIComponent(id)}/${x.ke}`}
          className={({ isActive }) =>
            cx(
              'fokus-cincin flex min-h-sentuh items-center justify-center rounded-md no-underline',
              isActive
                ? 'bg-daun-lembut font-semibold text-daun-tua hover:text-daun-tua'
                : 'font-medium text-teks hover:bg-embun-pagi hover:text-teks',
            )
          }
        >
          {x.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function KerangkaSiklus({
  children,
  samping,
  kembaliKe = '/kebun',
  labelKembali = t.kembaliKebun,
}: {
  children: (d: DataSiklus) => ReactNode;
  /** Kartu tambahan di panel kanan desktop (di bawah tab dan penggaris). */
  samping?: (d: DataSiklus) => ReactNode;
  kembaliKe?: string;
  labelKembali?: string;
}) {
  const { id = '' } = useParams();
  const hariIni = useHariIni();
  const lebar = useLayarLebar();
  const { data: d, memuat, galat } = useDataSiklus(id);
  if (galat) return <Navigate to="/kebun" replace />;
  if (memuat || !d) {
    return (
      <p role="status" className="m-0 text-teks-pendukung">
        {teksUmum.memuat}
      </p>
    );
  }
  const s = d.siklus;
  const kepala = (
    <div className="flex flex-col gap-3">
      <Link
        to={kembaliKe}
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{labelKembali}</span>
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="m-0 text-judul-halaman font-semibold">{d.nama}</h1>
          <p className="m-0 text-keterangan text-teks-pendukung">
            {t.keteranganSiklus(d.metode?.nama ?? '', ukuranSiklus(s), s.tanggal_tanam)}
          </p>
        </div>
        {s.status === 'aktif' ? (
          <Link
            to={`/kebun/${encodeURIComponent(s.id)}/pengingat`}
            aria-label={t.aturPengingat}
            className="fokus-cincin grid h-sentuh w-sentuh flex-none place-items-center rounded-md border border-garis-kuat bg-putih text-teks lg:hidden"
          >
            <Ikon nama="lonceng" />
          </Link>
        ) : null}
      </div>
    </div>
  );
  if (!lebar) {
    return (
      <>
        {kepala}
        <KartuUmur d={d} hariIni={hariIni} />
        <TabSiklus id={s.id} />
        {children(d)}
      </>
    );
  }
  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {kepala}
        {children(d)}
      </div>
      <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4 pt-14">
        <TabSiklus id={s.id} />
        <KartuUmur d={d} hariIni={hariIni} />
        {samping?.(d)}
      </aside>
    </div>
  );
}
