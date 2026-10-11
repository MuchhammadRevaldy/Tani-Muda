/**
 * Akhir siklus (turunan, T4.17, PRD P0-18, tujuan pengguna 3): pendapatan nyata, untung sebenarnya
 * = pendapatan nyata − pengeluaran nyata (`untungSebenarnya`), dibandingkan dengan untung rencana.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import { useAkhiriSiklus, usePengeluaran } from '../../api/kueri';
import { Ikon } from '../../komponen/ikon';
import { InputRupiah } from '../../komponen/input-rupiah';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { untungSebenarnya } from '../../lib/realisasi';
import { hitungRingkasan } from '../../lib/ringkasan';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { KerangkaSiklus, type DataSiklus } from './kerangka-siklus';

function Isi({ d }: { d: DataSiklus }) {
  const s = d.siklus;
  const pengeluaranQ = usePengeluaran(s.id);
  const akhiri = useAkhiriSiklus();
  const [pendapatan, setPendapatan] = useState<number | null>(s.pendapatan_nyata);
  const [galat, setGalat] = useState<string | null>(null);
  const keluar = (pengeluaranQ.data ?? []).reduce((a, p) => a + p.nominal, 0);
  const rencana = hitungRingkasan({
    totalModal: s.modal.total_modal,
    perkiraanPanenKg: s.perkiraan_panen_kg,
    hargaJual: s.harga_jual,
  });
  const untungRencana = rencana.ok ? rencana.nilai.untung : null;
  const untung = pendapatan !== null ? untungSebenarnya(pendapatan, keluar) : null;
  const selesai = s.status === 'selesai';

  async function kirim() {
    setGalat(null);
    if (pendapatan === null) return setGalat(t.isiPendapatan);
    try {
      await akhiri.mutateAsync({ id: s.id, pendapatan_nyata: pendapatan });
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  return (
    <Kartu
      judul={t.judulAkhir}
      keterangan={selesai ? t.siklusSelesai : t.akhirKet}
      tingkatJudul={2}
    >
      <div className="flex flex-col gap-4">
        {s.resep_contoh ? (
          <LabelKecil nada="contoh" className="self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
        <InputRupiah
          label={t.pendapatanNyata}
          nilai={pendapatan}
          onUbah={setPendapatan}
          disabled={selesai}
        />
        <dl className="m-0 flex flex-col gap-3 rounded-md bg-tanah-lembut p-4">
          <div className="flex justify-between gap-3">
            <dt>{t.pengeluaranNyata}</dt>
            <dd className="m-0">
              <Uang nilai={keluar} />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-semibold">{t.untungSebenarnya}</dt>
            <dd className="m-0">{untung !== null ? <Uang nilai={untung} besar /> : '–'}</dd>
          </div>
          {untungRencana !== null ? (
            <div className="flex justify-between gap-3">
              <dt>{t.untungRencana}</dt>
              <dd className="m-0">
                <Uang nilai={untungRencana} />
              </dd>
            </div>
          ) : null}
          {untung !== null && untungRencana !== null ? (
            <div className="flex justify-between gap-3">
              <dt>{t.selisihRencana}</dt>
              <dd className="m-0">
                <Uang nilai={untung - untungRencana} />
              </dd>
            </div>
          ) : null}
        </dl>
        {untung !== null && untung < 0 ? (
          <p className="m-0 flex items-start gap-2 font-medium text-tomat">
            <Ikon nama="peringatan" ukuran={20} className="mt-0.5" />
            {t.rugiNyata}
          </p>
        ) : null}
        {galat ? <PesanKolom id="galat-akhir" galat={galat} /> : null}
        {selesai ? (
          <Link to="/kebun" className={kelasTombol('sekunder', true)}>
            {t.kembaliKeKebun}
          </Link>
        ) : (
          <>
            <p className="m-0 text-keterangan text-teks-pendukung">{t.akhiriKet}</p>
            <Tombol penuh disabled={akhiri.isPending} onClick={() => void kirim()}>
              {akhiri.isPending ? t.menyimpan : t.akhiri}
            </Tombol>
          </>
        )}
      </div>
    </Kartu>
  );
}

export function HalamanAkhirSiklus() {
  return <KerangkaSiklus>{(d) => <Isi d={d} />}</KerangkaSiklus>;
}
