/**
 * Pengingat per siklus (papan 26, T4.14, PRD P0-38, P1-05): pilih siklus, jam pagi 05.00–07.00,
 * pengingat sore, saklar per tipe tugas, "Lewati siram saat hujan" segera hadir, contoh notifikasi
 * dari `tugasUntukNotifikasi`. Mematikan tipe tidak menghapus tugas dari jadwal dan beranda.
 */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  useDaftarSiklus,
  useKomoditas,
  useLahan,
  usePengingat,
  useUbahPengingat,
} from '../../api/kueri';
import { pengaturanKeDomain, tugasKeDomain } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import type { PengaturanPengingat } from '../../api/tipe';
import { Ikon, IkonTipeTugas, type TipeTugas } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilPilihan, Saklar } from '../../komponen/pilihan';
import { Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { tugasUntukNotifikasi } from '../../lib/pengingat';
import { teksBeranda } from '../../teks/beranda';
import { teksNotifikasiPagi } from '../../teks/jadwal';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { useDataSiklus } from './kerangka-siklus';

const JAM = ['05:00', '05:30', '06:00', '06:30', '07:00'];
const TIPE: TipeTugas[] = ['sekali', 'berulang', 'ukur'];

function ContohNotifikasi({
  ikon,
  pengirim,
  jam,
  judul,
  isi,
}: {
  ikon: 'kebun' | 'lonceng';
  pengirim: string;
  jam: string;
  judul: string;
  isi: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-garis bg-putih p-4">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-daun-tua text-putih">
        <Ikon nama={ikon} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex justify-between gap-2 text-keterangan text-teks-pendukung">
          <span className="truncate">{pengirim}</span>
          <span className="tabular-nums">{jam}</span>
        </span>
        <span className="font-semibold">{judul}</span>
        <span className="text-keterangan">{isi}</span>
      </span>
    </div>
  );
}

function FormPengingat({ siklusId, awal }: { siklusId: string; awal: PengaturanPengingat }) {
  const { data: d } = useDataSiklus(siklusId);
  const hariIni = useHariIni();
  const lebar = useLayarLebar();
  const simpan = useUbahPengingat();
  const [p, setP] = useState(awal);
  const [info, setInfo] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const tugas = d?.tugas ?? [];
  const judulTipe = (x: TipeTugas) =>
    [...new Set(tugas.filter((tg) => tg.tipe === x).map((tg) => tg.judul))]
      .join(', ')
      .toLowerCase();
  const isi = tugasUntukNotifikasi(tugas.map(tugasKeDomain), pengaturanKeDomain(p), hariIni);
  const notif = teksNotifikasiPagi(isi);
  const pengirim = t.pengirim(d?.nama ?? '');

  async function kirim() {
    setInfo(null);
    setGalat(null);
    try {
      await simpan.mutateAsync({
        siklusId,
        jam_pagi: p.jam_pagi,
        pengingat_sore: p.pengingat_sore,
        tipe_aktif: p.tipe_aktif,
      });
      setInfo(t.pengaturanTersimpan);
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const waktu = (
    <Kartu judul={t.waktuPengingat} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-medium">{t.jamPagi}</span>
          <PilPilihan
            label={t.jamPagi}
            nilai={p.jam_pagi}
            onPilih={(jam_pagi) => setP((x) => ({ ...x, jam_pagi }))}
            opsi={JAM.map((j) => ({ nilai: j, label: j.replace(':', '.') }))}
            className="flex-wrap"
          />
          <span className="text-keterangan text-teks-pendukung">{t.jamPagiKet}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-garis pt-4">
          <span className="flex flex-col">
            <span className="font-medium">{t.pengingatSore}</span>
            <span className="text-keterangan text-teks-pendukung">{t.pengingatSoreKet}</span>
          </span>
          <Saklar
            label={t.pengingatSore}
            aktif={p.pengingat_sore}
            onUbah={(v) => setP((x) => ({ ...x, pengingat_sore: v }))}
          />
        </div>
      </div>
    </Kartu>
  );
  const jenis = (
    <Kartu judul={t.jenisDiingatkan} tingkatJudul={2} tanpaIsi>
      <div className="flex flex-col px-4">
        {TIPE.map((x) => {
          const judul = judulTipe(x);
          return (
            <div key={x} className="flex items-center gap-3 border-b border-garis py-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-ikon bg-embun-pagi">
                <IkonTipeTugas tipe={x} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{t.namaTipe[x]}</span>
                <span className="text-keterangan text-teks-pendukung">
                  {judul || t.tidakAdaTipe(t.namaTipe[x])}
                </span>
              </span>
              {judul ? (
                <Saklar
                  label={t.namaTipe[x]}
                  aktif={p.tipe_aktif[x]}
                  onUbah={(v) => setP((s) => ({ ...s, tipe_aktif: { ...s.tipe_aktif, [x]: v } }))}
                />
              ) : null}
            </div>
          );
        })}
        <div className="flex items-center gap-3 py-3">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex flex-wrap items-center gap-2 text-teks-pendukung">
              {t.lewatiHujan}
              <LabelKecil nada="segera">{t.segeraHadir}</LabelKecil>
            </span>
            <span className="text-keterangan text-teks-pendukung">{t.lewatiHujanKet}</span>
          </span>
        </div>
      </div>
    </Kartu>
  );
  const contoh = (
    <div className="flex flex-col gap-3">
      <h2 className="m-0 text-judul-bagian font-semibold">{t.contohPengingat}</h2>
      {notif ? (
        <ContohNotifikasi
          ikon="kebun"
          pengirim={pengirim}
          jam={p.jam_pagi.replace(':', '.')}
          judul={notif.judul}
          isi={notif.isi}
        />
      ) : (
        <p className="m-0 text-teks-pendukung">{t.tidakAdaPagi}</p>
      )}
      {p.pengingat_sore ? (
        <ContohNotifikasi
          ikon="lonceng"
          pengirim={pengirim}
          jam="16.00"
          judul={t.soreJudul}
          isi={t.soreIsi}
        />
      ) : null}
    </div>
  );
  const aksi = (
    <>
      {galat ? <PesanKolom id="galat-pengingat" galat={galat} /> : null}
      {info ? (
        <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
          <Ikon nama="centang" ukuran={20} />
          {info}
        </p>
      ) : null}
      <Tombol penuh disabled={simpan.isPending} onClick={() => void kirim()}>
        {simpan.isPending ? t.menyimpan : t.simpanPengaturan}
      </Tombol>
    </>
  );
  return lebar ? (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {waktu}
        {jenis}
      </div>
      <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4">
        {contoh}
        {aksi}
      </aside>
    </div>
  ) : (
    <>
      {waktu}
      {jenis}
      {contoh}
      {aksi}
    </>
  );
}

export function HalamanPengingat() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const aktifQ = useDaftarSiklus({ status: 'aktif' });
  const komoditasQ = useKomoditas();
  const lahanQ = useLahan();
  const pengingatQ = usePengingat(id || null);
  const nama = (k: string, l: string) =>
    teksBeranda.namaSiklus(
      komoditasQ.data?.find((x) => x.id === k)?.nama ?? k,
      lahanQ.data?.find((x) => x.id === l)?.nama ?? '',
    );
  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          to={`/kebun/${encodeURIComponent(id)}/jadwal`}
          className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
        >
          <Ikon nama="panah-kiri" ukuran={20} />
          <span>{t.kembaliJadwal}</span>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-judul-halaman font-semibold">{t.judulPengingat}</h1>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.subPengingat}</p>
        </div>
      </div>
      {(aktifQ.data ?? []).length > 1 ? (
        <div className="flex flex-col gap-2">
          <span className="font-medium">{t.siklus}</span>
          <PilPilihan
            label={t.siklus}
            nilai={id}
            onPilih={(baru) =>
              navigate(`/kebun/${encodeURIComponent(baru)}/pengingat`, { replace: true })
            }
            opsi={(aktifQ.data ?? []).map((s) => ({
              nilai: s.id,
              label: nama(s.komoditas_id, s.lahan_id),
            }))}
            className="lg:flex-wrap"
          />
        </div>
      ) : null}
      {pengingatQ.data ? (
        <FormPengingat key={id} siklusId={id} awal={pengingatQ.data} />
      ) : (
        <p role="status" className="m-0 text-teks-pendukung">
          {teksUmum.memuat}
        </p>
      )}
    </>
  );
}
