/**
 * Jadwal siklus (papan 20, 21, T4.10, PRD P0-12): filter tipe tugas, daftar dikelompokkan per hari
 * (`kelompokkanPerHari`), tugas berulang tidak tampil puluhan baris (`tugasJadwal`), keadaan kosong
 * per filter, panel samping desktop "Tiga jenis tugas" dan "Pengingat".
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePengingat } from '../../api/kueri';
import { tugasKeDomain } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import type { Tugas } from '../../api/tipe';
import { Banner } from '../../komponen/banner';
import { BarisTugas } from '../../komponen/baris-tugas';
import { Ikon, IkonTipeTugas, type TipeTugas } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilPilihan } from '../../komponen/pilihan';
import { kelasTombol } from '../../komponen/tombol';
import { formatTanggal } from '../../lib/format';
import {
  kelompokkanPerHari,
  saringTipe,
  statusTugas,
  type KunciKelompok,
} from '../../lib/jadwal-ubah';
import { tugasJadwal } from '../../lib/jadwal-tampil';
import { tambahHari } from '../../lib/tanggal';
import { teksBeranda } from '../../teks/beranda';
import { teksFrekuensi, teksStatusWaktu } from '../../teks/jadwal';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { KerangkaSiklus, type DataSiklus } from './kerangka-siklus';
import { useCentangTugas } from './use-centang';

type Filter = TipeTugas | 'semua';
const href = (id: string) => `/tugas/${encodeURIComponent(id)}`;

function judulKelompok(
  k: KunciKelompok,
  tugas: { tanggal: string }[],
  hariIni: string,
  besok: string,
): string {
  if (k === 'terlambat')
    return tugas[0] ? t.kelompok.terlambat(tugas[0].tanggal) : t.kelompok.terlambatSaja;
  if (k === 'hari-ini') return t.kelompok.hariIni(hariIni);
  if (k === 'besok') return t.kelompok.besok(besok);
  if (k === 'selesai') return t.kelompok.selesai;
  return formatTanggal(k);
}

function PanelSamping({ d }: { d: DataSiklus }) {
  const p = usePengingat(d.siklus.status === 'aktif' ? d.siklus.id : null);
  return (
    <>
      <Kartu judul={t.tigaJenis} keterangan={t.tigaJenisKet} tingkatJudul={2}>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {(['sekali', 'berulang', 'ukur'] as const).map((x) => (
            <li key={x} className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-ikon bg-daun-lembut">
                <IkonTipeTugas tipe={x} />
              </span>
              <span className="flex flex-col">
                <span className="font-medium">{t.namaTipe[x]}</span>
                <span className="text-keterangan text-teks-pendukung">{t.jenisKet[x]}</span>
              </span>
            </li>
          ))}
        </ul>
      </Kartu>
      {p.data ? (
        <Kartu
          judul={t.pengingat}
          keterangan={t.pengingatKet(p.data.jam_pagi.replace(':', '.'), p.data.pengingat_sore)}
          tingkatJudul={2}
        >
          <Link
            to={`/kebun/${encodeURIComponent(d.siklus.id)}/pengingat`}
            className={kelasTombol('sekunder')}
          >
            <Ikon nama="lonceng" />
            {t.aturPengingat}
          </Link>
        </Kartu>
      ) : null}
    </>
  );
}

function IsiJadwal({ d }: { d: DataSiklus }) {
  const hariIni = useHariIni();
  const navigate = useNavigate();
  const { centang, sedang, gagal } = useCentangTugas();
  const [filter, setFilter] = useState<Filter>('semua');
  const s = d.siklus;
  const besok = tambahHari(hariIni, 1);

  if (s.status === 'rencana') {
    return (
      <Kartu judul={t.rencana} keterangan={t.rencanaKet} tingkatJudul={2}>
        <Link
          to={`/kebun/${encodeURIComponent(s.id)}/tanggal-tanam`}
          className={kelasTombol('utama')}
        >
          {t.pilihTanggalTanam}
        </Link>
      </Kartu>
    );
  }

  const domain = d.tugas.map(tugasKeDomain);
  const tersaring = saringTipe(domain, filter);
  const tampil = tugasJadwal(tersaring.tugas, hariIni);
  const perId = new Map(d.tugas.map((x) => [x.id, x]));
  const kelompok = kelompokkanPerHari(tampil, hariIni);

  return (
    <section className="flex flex-col gap-3" aria-labelledby="judul-daftar-tugas">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="judul-daftar-tugas" className="m-0 text-judul-bagian font-semibold">
          {t.daftarTugas}
        </h2>
        {s.resep_contoh ? <LabelKecil nada="contoh">{teksUmum.labelContoh}</LabelKecil> : null}
      </div>
      <PilPilihan<Filter>
        label={t.filterTipe}
        nilai={filter}
        onPilih={setFilter}
        className="flex-wrap"
        opsi={[
          { nilai: 'semua', label: t.semua },
          ...(['sekali', 'berulang', 'ukur'] as const).map((x) => ({
            nilai: x,
            label: t.namaTipe[x],
            ikon: <IkonTipeTugas tipe={x} ukuran={18} />,
          })),
        ]}
      />
      {gagal ? <Banner jenis="bahaya">{teksBeranda.gagalCentang}</Banner> : null}
      <div key={`jadwal-${filter}`} className="flex flex-col gap-4 animate-masuk-halaman">
        {tersaring.kosongKarena ? (
          <p className="m-0 rounded-lg border border-garis bg-putih p-4 text-teks-pendukung">
            {t.kosongTipe(t.namaTipe[filter as TipeTugas])}
          </p>
        ) : kelompok.length === 0 ? (
          <p className="m-0 rounded-lg border border-garis bg-putih p-4 text-teks-pendukung">
            {t.kosongSemua}
          </p>
        ) : (
          kelompok.map((k) => (
            <div key={k.kunci} className="flex flex-col gap-2">
              <h3 className="m-0 text-isi font-semibold">
                {judulKelompok(k.kunci, k.tugas, hariIni, besok)}
              </h3>
              <div className="overflow-hidden rounded-lg border border-garis bg-putih">
                {k.tugas.map((dt) => {
                  const x = perId.get(dt.id) as Tugas;
                  const st = statusTugas(x, hariIni);
                  const selesai = x.status === 'selesai' || sedang.has(x.id);
                  const ukur = x.tipe === 'ukur';
                  const keterangan =
                    x.tipe === 'sekali'
                      ? x.status === 'selesai'
                        ? t.hariKeTanggal(x.hst, x.tanggal)
                        : teksBeranda.hariKe(x.hst)
                      : teksFrekuensi(x.interval ?? 1);
                  const waktu =
                    st.jenis === 'terlambat' || st.jenis === 'hari-ini' || st.jenis === 'besok'
                      ? st.jenis
                      : undefined;
                  return (
                    <BarisTugas
                      key={x.id}
                      judul={x.judul}
                      tipe={x.tipe}
                      keterangan={keterangan}
                      waktu={waktu}
                      teksWaktu={st.jenis === 'terlambat' ? teksStatusWaktu(st) : undefined}
                      selesai={selesai}
                      onCentang={(jadi) => {
                        if (ukur) navigate(`${href(x.id)}/ukur`);
                        else if (jadi && x.status !== 'selesai') void centang(x.id);
                      }}
                      href={href(x.id)}
                      hrefUkur={
                        ukur && (waktu === 'terlambat' || waktu === 'hari-ini')
                          ? `${href(x.id)}/ukur`
                          : undefined
                      }
                      jumlahFoto={x.foto ? 1 : 0}
                      onKamera={() => navigate(href(x.id))}
                      tanpaKamera={ukur || st.jenis === 'nanti'}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      {s.status === 'aktif' ? (
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={`/kebun/${encodeURIComponent(s.id)}/tanggal-tanam`}
            className={kelasTombol('sekunder')}
          >
            {t.ubahTanggalTanam}
          </Link>
          <Link to={`/kebun/${encodeURIComponent(s.id)}/akhir`} className={kelasTombol('sekunder')}>
            {t.akhiriSiklus}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function HalamanJadwal() {
  return (
    <KerangkaSiklus samping={(d) => <PanelSamping d={d} />}>
      {(d) => <IsiJadwal d={d} />}
    </KerangkaSiklus>
  );
}
