/**
 * Ubah tanggal tanam (turunan, T4.13, PRD P0-17), juga untuk memulai rencana yang belum dijadwalkan
 * (D-38). Pratinjau memakai `ubahTanggalTanam`: tugas belum selesai bergeser, tugas selesai tetap.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import { useUbahTanggalTanam } from '../../api/kueri';
import { resepKeDomain, tugasKeDomain } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilihTanggal } from '../../komponen/pilih-tanggal';
import { Tombol } from '../../komponen/tombol';
import { buatJadwal } from '../../lib/jadwal-buat';
import { ubahTanggalTanam } from '../../lib/jadwal-ubah';
import { selisihHari, tambahHari } from '../../lib/tanggal';
import { teksHitung } from '../../teks/hitung';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { KerangkaSiklus, type DataSiklus } from './kerangka-siklus';

const TANGGAL_SAH = /^\d{4}-\d{2}-\d{2}$/;

function Isi({ d }: { d: DataSiklus }) {
  const hariIni = useHariIni();
  const navigate = useNavigate();
  const ubah = useUbahTanggalTanam();
  const s = d.siklus;
  const [tanggal, setTanggal] = useState(s.tanggal_tanam ?? hariIni);
  const [pesan, setPesan] = useState<string | null>(null);
  const sah = TANGGAL_SAH.test(tanggal);
  const rencana = s.status === 'rencana' || !s.tanggal_tanam;

  const domain = d.tugas.map(tugasKeDomain);
  const geser = !rencana && sah ? selisihHari(s.tanggal_tanam as string, tanggal) : 0;
  const baru = !rencana && sah ? ubahTanggalTanam(domain, s.tanggal_tanam as string, tanggal) : [];
  const belum = domain.filter((x) => x.status === 'belum');
  const contoh = belum
    .filter((x) => x.tipe === 'sekali')
    .slice(0, 3)
    .map((x) => ({ x, ke: baru.find((b) => b.id === x.id)?.tanggal ?? x.tanggal }));
  const jadwalBaru =
    rencana && sah && d.resep ? buatJadwal(resepKeDomain(d.resep).tugas, tanggal) : null;

  async function simpan() {
    setPesan(null);
    if (!sah) return setPesan(teksHitung.isiTanggalDulu);
    try {
      await ubah.mutateAsync({ id: s.id, tanggal });
      navigate(`/kebun/${encodeURIComponent(s.id)}/jadwal`);
    } catch (e) {
      setPesan(
        adalahGalatApi(e) ? (Object.values(e.rincian)[0]?.[0] ?? e.message) : teksUmum.galatIsi,
      );
    }
  }

  return (
    <Kartu
      judul={rencana ? t.judulPilihTanggal : t.judulUbahTanggal}
      keterangan={t.ubahTanggalKet}
      tingkatJudul={2}
    >
      <div className="flex flex-col gap-4">
        {s.resep_contoh ? (
          <LabelKecil nada="contoh" className="self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
        {s.tanggal_tanam ? <p className="m-0">{t.tanggalSekarang(s.tanggal_tanam)}</p> : null}
        <PilihTanggal
          label={t.tanggalBaru}
          nilai={tanggal}
          onChange={setTanggal}
          bantuan={t.tanggalBantuan}
        />
        <div className="flex flex-col gap-2 rounded-md bg-embun-pagi p-3">
          <span className="font-semibold">{t.perubahan}</span>
          {rencana ? (
            jadwalBaru?.ok ? (
              <span>{teksHitung.jumlahTugas(jadwalBaru.nilai.length)}</span>
            ) : null
          ) : geser === 0 ? (
            <span>{t.tidakBerubah}</span>
          ) : (
            <>
              <span>{geser > 0 ? t.geserMaju(geser) : t.geserMundur(-geser)}</span>
              <span className="text-teks-pendukung">
                {t.jumlahBergeser(belum.length, domain.length - belum.length)}
              </span>
              <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
                {contoh.map(({ x, ke }) => (
                  <li key={x.id}>{t.contohGeser(x.judul, x.tanggal, ke)}</li>
                ))}
              </ul>
            </>
          )}
          {sah && d.hariPanen ? (
            <span className="font-medium">{t.panenBaru(tambahHari(tanggal, d.hariPanen))}</span>
          ) : null}
        </div>
        {pesan ? <PesanKolom id="galat-tanggal" galat={pesan} /> : null}
        <Tombol
          penuh
          disabled={ubah.isPending || (!rencana && geser === 0)}
          onClick={() => void simpan()}
        >
          {ubah.isPending ? t.menyimpan : rencana ? t.simpanTanggalRencana : t.simpanTanggal}
        </Tombol>
      </div>
    </Kartu>
  );
}

export function HalamanUbahTanggalTanam() {
  return <KerangkaSiklus>{(d) => <Isi d={d} />}</KerangkaSiklus>;
}
