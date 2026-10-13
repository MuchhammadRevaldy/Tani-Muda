/**
 * Belajar: daftar modul (papan 08, 09; T4.30, PRD P0-05, US-01, US-02). Pilih tanaman dan cara tanam
 * (`?komoditas=&metode=`, bawaan dari siklus aktif), kemajuan "n dari 6 modul selesai" dari
 * `ringkasProgres`, "Lanjutkan: …", baris modul dengan keadaan selesai / sedang ditonton (posisi di
 * perangkat) / tersimpan offline / belum, dan tombol unduh (D-43). Hidroponik hanya untuk sawi
 * (D-05): cara tanam diambil dari resep yang ada. Desktop: panel "Sedang dipelajari" dan "Unduhan".
 */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useDaftarResep,
  useDaftarSiklus,
  useKomoditas,
  useKonfigurasi,
  useMetode,
  useModul,
} from '../api/kueri';
import { usePosisiModul } from '../api/posisi-modul';
import type { Modul } from '../api/tipe';
import { useUnduhanModul } from '../api/unduhan-modul';
import { cx } from '../komponen/gabung-kelas';
import { Ikon } from '../komponen/ikon';
import { Kartu } from '../komponen/kartu';
import { LabelKecil } from '../komponen/label-kecil';
import { HeaderHalaman } from '../komponen/navigasi';
import { PilPilihan } from '../komponen/pilihan';
import { kelasTombol } from '../komponen/tombol';
import { useLayarLebar } from '../komponen/use-layar-lebar';
import { keadaanModul, ringkasProgres, sisaMenit } from '../lib/belajar';
import { teksBelajar as t } from '../teks/belajar';
import { teksGagalMuat } from '../teks/galat-api';
import { modulKeDomain } from '../api/peta';
import { Memuat } from './memuat';

const href = (m: Pick<Modul, 'id'>) => `/belajar/${encodeURIComponent(m.id)}`;

function Batang({ persen, className }: { persen: number; className?: string }) {
  return (
    <span className={cx('block h-2 overflow-hidden rounded-full bg-garis', className)}>
      <span
        className="block h-full rounded-full bg-daun-tua"
        style={{ width: `${Math.min(100, Math.max(0, persen))}%` }}
      />
    </span>
  );
}

function Gambar({ judul, besar }: { judul: string; besar?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid flex-none place-items-center rounded-md bg-daun-tua text-putih',
        besar ? 'aspect-video w-full' : 'h-12 w-16',
      )}
      title={judul}
    >
      <Ikon nama="putar" ukuran={besar ? 32 : 20} className="fill-current" />
    </span>
  );
}

function BarisModul({
  m,
  posisiDetik,
  durasi,
  tersimpan,
  sedangUnduh,
  bisaUnduh,
  onUnduh,
}: {
  m: Modul;
  posisiDetik: number;
  durasi: number;
  tersimpan: boolean;
  sedangUnduh: boolean;
  bisaUnduh: boolean;
  onUnduh: () => void;
}) {
  const k = keadaanModul({ selesai: m.selesai, posisiDetik, tersimpan });
  const sisa = sisaMenit(posisiDetik, durasi);
  return (
    <li className="flex items-center gap-3 border-b border-garis py-3 first:pt-0 last:border-b-0 last:pb-0">
      <Link
        to={href(m)}
        aria-label={t.putarModul(m.judul)}
        className="fokus-cincin flex min-w-0 flex-1 items-center gap-3 rounded-md text-teks no-underline"
      >
        <Gambar judul={m.judul} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-semibold">{m.judul}</span>
          <span
            className={cx(
              'flex flex-wrap items-center gap-x-1.5 text-keterangan',
              k === 'selesai' ? 'text-daun-tua' : 'text-teks-pendukung',
            )}
          >
            {k === 'selesai' ? <Ikon nama="centang" ukuran={16} tebal={2.5} /> : null}
            {k === 'offline' ? <Ikon nama="unduh" ukuran={16} /> : null}
            {[
              t.modulKe(m.urutan),
              t.menit(m.menit),
              k === 'selesai'
                ? t.selesai
                : k === 'sedang' && sisa
                  ? t.sisaMenit(sisa)
                  : k === 'offline'
                    ? t.tersimpanOffline
                    : !m.video_url
                      ? t.videoMenyusul
                      : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {k === 'sedang' && durasi > 0 ? (
            <Batang persen={(posisiDetik / durasi) * 100} className="w-full max-w-pilihan-kotak" />
          ) : null}
        </span>
      </Link>
      {bisaUnduh && m.video_url && !tersimpan && k !== 'selesai' ? (
        <button
          type="button"
          onClick={onUnduh}
          disabled={sedangUnduh}
          aria-label={sedangUnduh ? t.mengunduh(m.judul) : t.unduh(m.judul)}
          className="fokus-cincin grid h-sentuh w-sentuh flex-none cursor-pointer place-items-center rounded-md border-1.5 border-garis-kuat bg-putih text-teks disabled:cursor-wait disabled:text-teks-pendukung"
        >
          <Ikon nama={sedangUnduh ? 'jam-pasir' : 'unduh'} />
        </button>
      ) : null}
    </li>
  );
}

export function HalamanBelajar() {
  const lebar = useLayarLebar();
  const [cari, setCari] = useSearchParams();
  const komoditasQ = useKomoditas();
  const metodeQ = useMetode();
  const siklusQ = useDaftarSiklus({ status: 'aktif' });
  const konfigurasiQ = useKonfigurasi();
  const posisi = usePosisiModul();
  const unduhan = useUnduhanModul();
  const [galatUnduh, setGalatUnduh] = useState<string | null>(null);

  const tersedia = (komoditasQ.data ?? []).filter((k) => k.status_resep === 'tersedia');
  const siklusPertama = siklusQ.data?.[0];
  const komoditasId =
    cari.get('komoditas') ?? siklusPertama?.komoditas_id ?? tersedia[0]?.id ?? null;
  const resepQ = useDaftarResep(komoditasId ? { komoditas_id: komoditasId } : {});
  const metodeTersedia = [...new Set((resepQ.data ?? []).map((r) => r.metode_id))];
  const metodeAlamat = cari.get('metode');
  const metodeId =
    metodeAlamat && metodeTersedia.includes(metodeAlamat)
      ? metodeAlamat
      : siklusPertama?.komoditas_id === komoditasId &&
          metodeTersedia.includes(siklusPertama?.metode_id ?? '')
        ? (siklusPertama?.metode_id ?? null)
        : (metodeTersedia[0] ?? null);
  const modulQ = useModul(
    komoditasId && metodeId ? { komoditas_id: komoditasId, metode_id: metodeId } : null,
  );

  const kepala = <HeaderHalaman judul={t.judul} keterangan={t.sub} />;
  if (komoditasQ.isError)
    return <p className="m-0 text-teks-pendukung">{teksGagalMuat(komoditasQ.error)}</p>;
  if (!komoditasQ.data || !metodeQ.data || !konfigurasiQ.data) return <Memuat />;

  const namaKomoditas = tersedia.find((k) => k.id === komoditasId)?.nama ?? '';
  const namaMetode = metodeQ.data.find((m) => m.id === metodeId)?.nama ?? '';
  const modul = modulQ.data ?? [];
  const progres = ringkasProgres(
    modul.map(modulKeDomain),
    modul.filter((m) => m.selesai).map((m) => m.id),
  );
  const lanjut = modul.find((m) => m.id === progres.modulLanjutan?.id) ?? null;
  const posLanjut = lanjut ? posisi.posisi(lanjut.id) : null;
  const batas = konfigurasiQ.data.batas_unduhan_offline_mb;

  async function unduh(m: Modul) {
    setGalatUnduh(null);
    if (!m.video_url) return;
    if (unduhan.ukuranMb + (m.ukuran_video_mb ?? 0) > batas) return setGalatUnduh(t.penuh(batas));
    if (!(await unduhan.unduh(m.video_url))) setGalatUnduh(t.gagalUnduh);
  }

  const pilihan = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="m-0 font-medium">{t.tanaman}</p>
        <PilPilihan<string>
          label={t.tanaman}
          className="flex-wrap"
          nilai={komoditasId ?? ''}
          onPilih={(id) => setCari({ komoditas: id }, { replace: true })}
          opsi={tersedia.map((k) => ({ nilai: k.id, label: k.nama }))}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="m-0 font-medium">{t.caraTanam}</p>
        <PilPilihan<string>
          label={t.caraTanam}
          className="flex-wrap"
          nilai={metodeId ?? ''}
          onPilih={(id) => setCari({ komoditas: komoditasId ?? '', metode: id }, { replace: true })}
          opsi={metodeTersedia.map((id) => ({
            nilai: id,
            label: metodeQ.data.find((m) => m.id === id)?.nama ?? id,
          }))}
        />
      </div>
    </div>
  );

  const tombolLanjut = (
    <Link to={href(lanjut ?? modul[0] ?? { id: '' })} className={kelasTombol('utama', true)}>
      {lanjut ? t.lanjutkan(lanjut.judul) : t.ulangiDariAwal}
    </Link>
  );

  const kemajuan = (
    <Kartu judul={t.kemajuan} keterangan={t.nDariM(progres.jumlahSelesai, progres.jumlahTotal)}>
      <div className="flex flex-col gap-4">
        <Batang persen={progres.persen} />
        {modul.length ? tombolLanjut : null}
      </div>
    </Kartu>
  );

  const daftar = (
    <section className="flex flex-col gap-3" aria-labelledby="judul-daftar-modul">
      <div className="flex flex-col gap-0.5">
        <h2 id="judul-daftar-modul" className="m-0 text-judul-bagian font-semibold">
          {t.judulDaftar(namaMetode, namaKomoditas)}
        </h2>
        <p className="m-0 text-keterangan text-teks-pendukung">{t.ketDaftar}</p>
      </div>
      <LabelKecil nada="contoh" className="self-start">
        {t.labelContoh}
      </LabelKecil>
      {galatUnduh ? (
        <p role="alert" className="m-0 font-medium text-tomat-teks">
          {galatUnduh}
        </p>
      ) : null}
      {modulQ.isPending && modulQ.fetchStatus !== 'idle' ? (
        <Memuat />
      ) : modul.length ? (
        <Kartu>
          <ul className="m-0 list-none p-0">
            {modul.map((m) => {
              const p = posisi.posisi(m.id);
              return (
                <BarisModul
                  key={m.id}
                  m={m}
                  posisiDetik={p?.detik ?? 0}
                  durasi={p?.durasi ?? 0}
                  tersimpan={!!m.video_url && unduhan.tersimpan.has(m.video_url)}
                  sedangUnduh={!!m.video_url && unduhan.sedang.has(m.video_url)}
                  bisaUnduh={unduhan.didukung}
                  onUnduh={() => void unduh(m)}
                />
              );
            })}
          </ul>
        </Kartu>
      ) : (
        <p className="m-0 text-teks-pendukung">{t.tidakAdaModul}</p>
      )}
    </section>
  );

  if (!lebar)
    return (
      <>
        {kepala}
        {pilihan}
        {kemajuan}
        {daftar}
      </>
    );

  return (
    <>
      {kepala}
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {pilihan}
          {daftar}
        </div>
        <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4">
          <Kartu
            judul={t.sedangDipelajari}
            keterangan={
              lanjut
                ? t.sedangKet(
                    lanjut.judul,
                    sisaMenit(posLanjut?.detik ?? 0, posLanjut?.durasi ?? 0),
                  )
                : undefined
            }
          >
            <div className="flex flex-col gap-3">
              <Link
                to={href(lanjut ?? modul[0] ?? { id: '' })}
                aria-label={lanjut ? t.putarModul(lanjut.judul) : t.ulangiDariAwal}
                className="fokus-cincin block rounded-md"
              >
                <Gambar judul={lanjut?.judul ?? ''} besar />
              </Link>
              <p className="m-0 text-teks-pendukung">
                {t.nDariM(progres.jumlahSelesai, progres.jumlahTotal)}
              </p>
              <Batang persen={progres.persen} />
              {modul.length ? tombolLanjut : null}
            </div>
          </Kartu>
          {unduhan.didukung ? (
            <Kartu judul={t.unduhan} keterangan={t.unduhanKet}>
              <p className="m-0 text-keterangan text-teks-pendukung">
                {t.pemakaian(unduhan.ukuranMb, batas)}
              </p>
            </Kartu>
          ) : null}
        </aside>
      </div>
    </>
  );
}
