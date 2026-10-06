/**
 * Tugas pengukuran pH dan PPM (papan 23–25, T4.12, PRD P0-37): isian angka, batang rentang normal,
 * status dengan ikon dan kata, saran dari resep, grafik 7 pengukuran terakhir dengan pita normal.
 * Status dihitung `pengukuran.ts`; hasil di luar rentang membuat tugas "Ukur ulang" besok (server).
 */
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import { kunciIdempotenBaru, useCatatPengukuran, useRiwayatPengukuran } from '../../api/kueri';
import { besaranKeDomain, hasilPengukuranKeDomain, siklusDariIdTugas } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import type { BesaranUkur, PengukuranHasil } from '../../api/tipe';
import { Banner } from '../../komponen/banner';
import { BatangRentang } from '../../komponen/batang-rentang';
import { GrafikMini } from '../../komponen/grafik-mini';
import { Ikon, IkonTipeTugas } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { KolomIsian, PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { DaftarLangkah } from '../../komponen/pelengkap';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { formatDesimal, formatKisaran, formatTanggal } from '../../lib/format';
import { nilaiDariTeks, saranPengukuran, titikGrafik } from '../../lib/pengukuran';
import { bandingTanggal } from '../../lib/tanggal';
import { teksGalat } from '../../teks/galat';
import { teksFrekuensi } from '../../teks/jadwal';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { angkaUkur } from '../beranda/kartu-samping';
import { useDataSiklus } from './kerangka-siklus';

export function HalamanUkur() {
  const { id = '' } = useParams();
  const siklusId = siklusDariIdTugas(id);
  const { data: d, memuat, galat } = useDataSiklus(siklusId);
  const riwayatQ = useRiwayatPengukuran(siklusId);
  const catat = useCatatPengukuran();
  const hariIni = useHariIni();
  const lebar = useLayarLebar();
  const [teks, setTeks] = useState<Record<string, string>>({});
  const [hasil, setHasil] = useState<PengukuranHasil | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  if (galat) return <Navigate to="/kebun" replace />;
  if (memuat || !d) {
    return (
      <p role="status" className="m-0 text-teks-pendukung">
        {teksUmum.memuat}
      </p>
    );
  }
  const tugas = d.tugas.find((x) => x.id === id);
  const jadwalKe = `/kebun/${encodeURIComponent(siklusId)}/jadwal`;
  if (!tugas || tugas.tipe !== 'ukur' || !tugas.ukur) return <Navigate to={jadwalKe} replace />;
  const besaran: BesaranUkur[] = tugas.ukur;
  const selesai = tugas.status === 'selesai' || !!hasil;
  const riwayatTugas = (riwayatQ.data ?? []).filter((h) => h.tugas_id === tugas.id);
  const resepTugas = d.resep?.tugas.find((rt) => rt.id === tugas.resep_tugas_id) ?? null;
  const berikut = d.tugas
    .filter(
      (x) =>
        x.resep_tugas_id === tugas.resep_tugas_id && bandingTanggal(x.tanggal, tugas.tanggal) > 0,
    )
    .sort((a, b) => bandingTanggal(a.tanggal, b.tanggal))[0];

  // Nilai dari isian, atau dari hasil yang sudah tersimpan untuk tugas ini.
  const nilaiTampil = besaran.map((b) => {
    const tersimpan = riwayatTugas.find((h) => h.besaran === b.nama);
    const masuk = teks[b.nama] ?? (tersimpan ? angkaUkur(tersimpan.nilai) : '');
    return { b, teks: masuk, ...nilaiDariTeks(masuk, besaranKeDomain(b)) };
  });
  const semuaTerisi = nilaiTampil.every((n) => n.nilai !== null && !n.galat);
  const diLuar = nilaiTampil.filter(
    (n) => n.status === 'terlalu-rendah' || n.status === 'terlalu-tinggi',
  );
  const contoh = d.siklus.resep_contoh;

  async function simpan() {
    if (!tugas) return;
    setPesan(null);
    if (!semuaTerisi) return setPesan(t.isiDulu);
    try {
      const r = await catat.mutateAsync({
        id: tugas.id,
        nilai: nilaiTampil.map((n) => ({ besaran: n.b.nama, nilai: n.nilai as number })),
        kunci_idempoten: kunciIdempotenBaru(),
      });
      setHasil(r);
    } catch (e) {
      setPesan(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const kepala = (
    <div className="flex flex-col gap-3">
      <Link
        to={jadwalKe}
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembaliJadwal}</span>
      </Link>
      <span className="inline-flex items-center gap-1.5 font-medium text-daun-tua">
        <IkonTipeTugas tipe="ukur" ukuran={18} />
        {t.pengukuranFrek(teksFrekuensi(tugas.interval ?? 2))}
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-judul-halaman font-semibold">{tugas.judul}</h1>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.ketUkur(d.nama, tugas.hst, d.siklus.volume_tandon_liter)}
        </p>
      </div>
    </div>
  );

  const cara = resepTugas?.cara_mengerjakan?.length ? (
    <details className="group rounded-lg border border-garis bg-putih px-4">
      <summary className="fokus-cincin flex min-h-kontrol cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
        <span>{t.caraMengukur}</span>
        <Ikon
          nama="panah-kanan"
          className="rotate-90 text-teks-pendukung transition-transform group-open:-rotate-90"
        />
      </summary>
      <div className="pb-4">
        <DaftarLangkah butir={resepTugas.cara_mengerjakan} />
      </div>
    </details>
  ) : null;

  const isian = (
    <Kartu>
      <div className="flex flex-col gap-5">
        {nilaiTampil.map((n, i) => (
          <div
            key={n.b.nama}
            className={i ? 'flex flex-col gap-3 border-t border-garis pt-5' : 'flex flex-col gap-3'}
          >
            <KolomIsian
              label={t.labelBesaran[n.b.nama] ?? n.b.nama}
              inputMode="decimal"
              value={n.teks}
              readOnly={selesai}
              onChange={(e) => setTeks((x) => ({ ...x, [n.b.nama]: e.target.value }))}
              akhiran={n.b.satuan && n.b.satuan !== n.b.nama ? n.b.satuan.toLowerCase() : undefined}
              galat={n.galat ? teksGalat[n.galat] : undefined}
            />
            <BatangRentang
              nilai={n.galat ? null : n.nilai}
              status={n.status}
              batasBawah={n.b.batas_bawah}
              batasAtas={n.b.batas_atas}
              skalaMin={n.b.skala_min}
              skalaMaks={n.b.skala_maks}
              format={(v) =>
                Number.isInteger(n.b.batas_bawah) && Number.isInteger(n.b.batas_atas)
                  ? angkaUkur(Math.round(v))
                  : formatDesimal(v, 1, true)
              }
              teksNormal={t.normalRentang(
                formatKisaran(n.b.batas_bawah, n.b.batas_atas, angkaUkur),
              )}
              teksStatus={t.status[n.status]}
            />
          </div>
        ))}
        {contoh ? (
          <LabelKecil nada="contoh" className="self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : (
          <p className="m-0 text-keterangan text-teks-pendukung">{t.rentangDariResep}</p>
        )}
      </div>
    </Kartu>
  );

  const saran = !semuaTerisi ? (
    <p className="m-0 text-teks-pendukung">{t.isiDulu}</p>
  ) : diLuar.length === 0 ? (
    <div
      role="status"
      className="flex items-start gap-3 rounded-md border-1.5 border-daun-tua bg-daun-lembut px-4 py-3"
    >
      <span className="grid h-7.5 w-7.5 flex-none place-items-center rounded-full bg-daun-tua text-putih">
        <Ikon nama="centang" ukuran={18} tebal={3} />
      </span>
      <span className="flex flex-col">
        <span className="font-semibold">{t.baikJudul}</span>
        <span className="text-keterangan">
          {t.baikIsi(besaran.map((b) => b.nama).join(' dan '), berikut?.tanggal ?? null)}
        </span>
      </span>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {diLuar.map((n) => (
        <Banner
          key={n.b.nama}
          jenis={n.status === 'terlalu-rendah' ? 'bahaya' : 'peringatan'}
          judul={t.diLuarJudul(n.b.nama, t.status[n.status])}
        >
          {t.diLuarIsi(
            n.b.nama,
            angkaUkur(n.nilai as number),
            t.status[n.status],
            saranPengukuran(n.status, besaranKeDomain(n.b)) ?? '',
          )}
        </Banner>
      ))}
    </div>
  );

  const riwayat = (riwayatQ.data ?? []).map(hasilPengukuranKeDomain);
  const grafik = (
    <Kartu judul={t.tujuhTerakhir} keterangan={t.tujuhTerakhirKet} tingkatJudul={2}>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
        {nilaiTampil.map((n) => {
          const titik =
            !selesai && n.nilai !== null && !n.galat
              ? [
                  ...riwayat,
                  {
                    tugasId: tugas.id,
                    besaran: n.b.nama,
                    nilai: n.nilai,
                    status: n.status,
                    sumber: 'manual' as const,
                    tanggal: hariIni,
                  },
                ]
              : riwayat;
          const g = titikGrafik(titik, besaranKeDomain(n.b));
          const akhir = g.titik.at(-1);
          return (
            <div key={n.b.nama} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">{n.b.nama}</span>
                <span className="text-keterangan text-teks-pendukung">
                  {t.grafikKet(
                    formatKisaran(n.b.batas_bawah, n.b.batas_atas, angkaUkur),
                    akhir ? angkaUkur(akhir.nilai) : null,
                  )}
                </span>
              </div>
              {g.titik.length ? (
                <>
                  <GrafikMini grafik={g} label={t.grafikAria(n.b.nama, g.titik.length)} />
                  <div className="flex justify-between text-keterangan text-teks-pendukung">
                    <span>{formatTanggal(g.titik[0]!.tanggal, { tanpaHari: true })}</span>
                    <span>{formatTanggal(g.titik.at(-1)!.tanggal, { tanpaHari: true })}</span>
                  </div>
                </>
              ) : (
                <p className="m-0 text-teks-pendukung">{t.belumAdaRiwayat}</p>
              )}
            </div>
          );
        })}
      </div>
    </Kartu>
  );

  const aksi = selesai ? (
    <div className="flex flex-col gap-3">
      <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
        <Ikon nama="centang" />
        {hasil ? t.hasilTersimpan : t.tugasSelesai}
      </p>
      {hasil?.tugas_ukur_ulang ? (
        <p className="m-0 text-teks-pendukung">
          {t.ukurUlangBesok(hasil.tugas_ukur_ulang.tanggal)}
        </p>
      ) : null}
      <Link to={jadwalKe} className={kelasTombol('sekunder', true)}>
        {t.kembaliKeJadwal}
      </Link>
    </div>
  ) : (
    <Tombol penuh disabled={catat.isPending} onClick={() => void simpan()}>
      {catat.isPending ? t.menyimpan : t.simpanHasil}
    </Tombol>
  );
  const galatTampil = pesan ? <PesanKolom id="galat-ukur" galat={pesan} /> : null;
  const judulSaran = <h2 className="m-0 text-judul-bagian font-semibold">{t.hasilDanSaran}</h2>;

  if (lebar) {
    return (
      <>
        {kepala}
        <div className="flex items-start gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {isian}
            {cara}
            {galatTampil}
            {aksi}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {judulSaran}
            {saran}
            {grafik}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {kepala}
      {cara}
      {isian}
      {judulSaran}
      {saran}
      {galatTampil}
      {aksi}
      {grafik}
    </>
  );
}
