/**
 * Detail tugas (papan 22, T4.11, PRD P0-14, P0-15, P0-16): chip waktu, saran terlambat dari resep,
 * cara mengerjakan, foto bukti (dikecilkan lalu diunggah; masuk jurnal saat tugas selesai), tunda
 * 1–3 hari dengan tanggal baru (`tundaTugas`), konfirmasi bila melewati panen, "Tandai selesai".
 */
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  kunciIdempotenBaru,
  useSelesaikanTugas,
  useTundaTugas,
  useUnggahBerkas,
} from '../../api/kueri';
import { siklusDariIdTugas, tugasKeDomain } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import { AmbilFoto, type FotoKecil } from '../../komponen/ambil-foto';
import { Banner } from '../../komponen/banner';
import { ChipStatus } from '../../komponen/chip-status';
import { Dialog } from '../../komponen/dialog';
import { Ikon, IkonTipeTugas } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { DaftarLangkah } from '../../komponen/pelengkap';
import { GrupRadio, KartuPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { ModalDeteksiTanaman } from '../../komponen/modal-deteksi-tanaman';
import { formatTanggal } from '../../lib/format';
import { BATAS_TUNDA, statusTugas, tundaTugas } from '../../lib/jadwal-ubah';
import { teksFrekuensi, teksStatusWaktu } from '../../teks/jadwal';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { useDataSiklus } from './kerangka-siklus';

const PILIHAN_TUNDA = Array.from(
  { length: BATAS_TUNDA.maks - BATAS_TUNDA.min + 1 },
  (_, i) => BATAS_TUNDA.min + i,
);

export function HalamanDetailTugas() {
  const { id = '' } = useParams();
  const siklusId = siklusDariIdTugas(id);
  const { data: d, memuat, galat } = useDataSiklus(siklusId);
  const hariIni = useHariIni();
  const lebar = useLayarLebar();
  const navigate = useNavigate();
  const unggah = useUnggahBerkas();
  const selesaikan = useSelesaikanTugas();
  const tunda = useTundaTugas();
  const [foto, setFoto] = useState<FotoKecil | null>(null);
  const [hariTunda, setHariTunda] = useState<number>(BATAS_TUNDA.min);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [modalDeteksi, setModalDeteksi] = useState(false);

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
  if (!tugas) {
    return (
      <div className="flex flex-col gap-4">
        <p className="m-0">{t.tugasTidakDitemukan}</p>
        <Link to={jadwalKe} className={kelasTombol('sekunder') + ' self-start'}>
          {t.kembaliKeJadwal}
        </Link>
      </div>
    );
  }
  const resepTugas = d.resep?.tugas.find((rt) => rt.id === tugas.resep_tugas_id) ?? null;
  const st = statusTugas(tugas, hariIni);
  const selesai = tugas.status === 'selesai';
  const panen = d.siklus.perkiraan_tanggal_panen ?? hariIni;
  const domain = d.tugas.map(tugasKeDomain);
  const tanggalBaru = (n: number) => {
    const r = tundaTugas(domain, tugas.id, n, panen, hariIni);
    return r.ok ? (r.nilai.jadwal.find((x) => x.id === tugas.id)?.tanggal ?? null) : null;
  };

  async function tandaiSelesai() {
    if (!tugas) return;
    setPesan(null);
    try {
      const url = foto
        ? (await unggah.mutateAsync({ nama: foto.nama, jenis: foto.jenis, isi: foto.dataUrl })).url
        : null;
      await selesaikan.mutateAsync({
        id: tugas.id,
        foto: url,
        kunci_idempoten: kunciIdempotenBaru(),
      });
      navigate(jadwalKe);
    } catch (e) {
      setPesan(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  async function terapkanTunda(dengan: boolean) {
    if (!tugas) return;
    setPesan(null);
    try {
      const r = await tunda.mutateAsync({
        id: tugas.id,
        hari: hariTunda,
        ...(dengan ? { konfirmasi: true } : {}),
      });
      if (!r.diterapkan && r.perlu_konfirmasi) return setKonfirmasi(true);
      setKonfirmasi(false);
      navigate(jadwalKe);
    } catch (e) {
      setPesan(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const contoh = d.siklus.resep_contoh ? (
    <LabelKecil nada="contoh" className="self-start">
      {teksUmum.labelContoh}
    </LabelKecil>
  ) : null;

  const kepala = (
    <div className="flex flex-col gap-3">
      <Link
        to={jadwalKe}
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembaliJadwal}</span>
      </Link>
      <div className="self-start">
        {selesai ? (
          <ChipStatus status="selesai" />
        ) : st.jenis === 'terlambat' || st.jenis === 'hari-ini' || st.jenis === 'besok' ? (
          <ChipStatus status={st.jenis}>
            {st.jenis === 'terlambat' ? teksStatusWaktu(st) : undefined}
          </ChipStatus>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-judul-halaman font-semibold">{tugas.judul}</h1>
        <p className="m-0 flex items-start gap-1.5 text-keterangan text-teks-pendukung">
          <IkonTipeTugas tipe={tugas.tipe} ukuran={18} className="mt-0.5 flex-none" />
          <span>
            {tugas.tipe !== 'sekali' ? `${teksFrekuensi(tugas.interval ?? 1)} · ` : ''}
            {st.jenis === 'terlambat'
              ? t.seharusnya(d.nama, tugas.tanggal, tugas.hst)
              : t.jadwalTugas(d.nama, tugas.tanggal, tugas.hst)}
          </span>
        </p>
      </div>
      {!selesai && st.jenis === 'terlambat' && resepTugas?.saran_terlambat ? (
        <Banner jenis="bahaya" judul={t.sebaiknyaHariIni}>
          {resepTugas.saran_terlambat}
        </Banner>
      ) : null}
    </div>
  );

  const cara = (
    <Kartu judul={tugas.tipe === 'ukur' ? t.caraMengukur : t.caraMengerjakan} tingkatJudul={2}>
      <div className="flex flex-col gap-3">
        {contoh}
        {resepTugas?.cara_mengerjakan?.length ? (
          <DaftarLangkah butir={resepTugas.cara_mengerjakan} />
        ) : (
          <p className="m-0 text-teks-pendukung">{t.caraKosong}</p>
        )}
      </div>
    </Kartu>
  );

  const kartuFoto =
    tugas.tipe === 'ukur' ? null : (
      <Kartu judul={t.fotoBukti} keterangan={t.fotoBuktiKet} tingkatJudul={2}>
        <div className="grid grid-cols-2 gap-3">
          {tugas.foto ? (
            <figure className="m-0 flex flex-col gap-1">
              <img
                src={tugas.foto}
                alt={tugas.judul}
                className="aspect-foto w-full rounded-md border border-garis object-cover"
              />
              <figcaption className="text-keterangan text-teks-pendukung">
                {t.fotoTersimpan(formatTanggal(tugas.tanggal, { tanpaHari: true }))}
              </figcaption>
            </figure>
          ) : null}
          {foto ? (
            <figure className="m-0 flex flex-col gap-1">
              <img
                src={foto.dataUrl}
                alt={t.fotoTerpilih}
                className="aspect-foto w-full rounded-md border border-garis object-cover"
              />
              <button
                type="button"
                onClick={() => setFoto(null)}
                className="fokus-cincin -ml-2 inline-flex min-h-sentuh cursor-pointer items-center self-start rounded-md border-0 bg-transparent px-2 font-semibold text-tomat-teks"
              >
                {t.hapusFoto}
              </button>
            </figure>
          ) : null}
          {!selesai ? (
            <AmbilFoto
              label={foto ? t.gantiFoto : t.tambahFoto}
              labelMemuat={t.mengecilkan}
              onFoto={setFoto}
              onGagal={() => setPesan(t.fotoGagal)}
              className="aspect-foto"
            />
          ) : null}
        </div>
        <div className="mt-3 border-t border-garis/60 pt-3">
          <Tombol
            varian="sekunder"
            ikon="peringatan"
            penuh
            onClick={() => setModalDeteksi(true)}
          >
            Deteksi Gejala Tanaman (AI)
          </Tombol>
        </div>
      </Kartu>
    );

  const kartuTunda =
    selesai || tugas.tipe === 'ukur' ? null : !tugas.boleh_digeser ? (
      <p className="m-0 text-keterangan text-teks-pendukung">{t.tidakBolehDitunda}</p>
    ) : (
      <Kartu judul={t.belumBisa} keterangan={t.belumBisaKet} tingkatJudul={2}>
        <div className="flex flex-col gap-3">
          <GrupRadio label={t.belumBisa} className="flex flex-col gap-2">
            {PILIHAN_TUNDA.map((n) => {
              const baru = tanggalBaru(n);
              return (
                <KartuPilihan
                  key={n}
                  dipilih={hariTunda === n}
                  onPilih={() => setHariTunda(n)}
                  labelAksesibel={`${t.tundaHari(n)}${baru ? `, ${formatTanggal(baru)}` : ''}`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="font-semibold">{t.tundaHari(n)}</span>
                    {baru ? (
                      <span className="text-teks-pendukung">{formatTanggal(baru)}</span>
                    ) : null}
                  </div>
                </KartuPilihan>
              );
            })}
          </GrupRadio>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.tundaKet}</p>
          <Tombol
            varian="sekunder"
            penuh
            disabled={tunda.isPending}
            onClick={() => void terapkanTunda(false)}
          >
            {t.tunda(hariTunda)}
          </Tombol>
        </div>
      </Kartu>
    );

  const aksi = selesai ? (
    <p className="m-0 flex items-center gap-2 font-medium text-daun-tua">
      <Ikon nama="centang" />
      {t.tugasSelesai}
    </p>
  ) : tugas.tipe === 'ukur' ? (
    <Link to={`/tugas/${encodeURIComponent(tugas.id)}/ukur`} className={kelasTombol('utama', true)}>
      {t.isiAngka}
    </Link>
  ) : (
    <Tombol
      ikon="centang"
      penuh
      disabled={selesaikan.isPending || unggah.isPending}
      onClick={() => void tandaiSelesai()}
    >
      {selesaikan.isPending || unggah.isPending ? t.menyimpan : t.tandaiSelesai}
    </Tombol>
  );

  const galatTampil = pesan ? <PesanKolom id="galat-tugas" galat={pesan} /> : null;

  return (
    <>
      {lebar ? (
        <div className="flex items-start gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {kepala}
            {cara}
            {kartuFoto}
          </div>
          <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4 pt-14">
            {kartuTunda}
            {galatTampil}
            {aksi}
          </aside>
        </div>
      ) : (
        <>
          {kepala}
          {cara}
          {kartuFoto}
          {kartuTunda}
          {galatTampil}
          {aksi}
        </>
      )}
      <Dialog terbuka={konfirmasi} onTutup={() => setKonfirmasi(false)} judul={t.tundaLewatPanen}>
        <div className="flex flex-col gap-3">
          <p className="m-0">{t.tundaLewatPanenIsi}</p>
          <Tombol penuh onClick={() => void terapkanTunda(true)}>
            {t.tetapTunda}
          </Tombol>
          <Tombol varian="sekunder" penuh onClick={() => setKonfirmasi(false)}>
            {t.batal}
          </Tombol>
        </div>
      </Dialog>
      <ModalDeteksiTanaman
        terbuka={modalDeteksi}
        onTutup={() => setModalDeteksi(false)}
        siklusId={siklusId}
        tugasId={tugas.id}
      />
    </>
  );
}
