/**
 * Simpan rencana dan pilih tanggal tanam (turunan, papan 41, T4.08, PRD P0-04, P0-11, P0-12).
 * Satu permintaan POST /siklus membuat `siklus_tanam` (dengan versi resep) dan `rencana_item`;
 * bila tanggal tanam diisi, server langsung membuat tugas dari resep. "Nanti saja" menyimpan rencana
 * tanpa jadwal. Tanggal lampau boleh untuk siklus pilot.
 */
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import { useBuatSiklus, useLahan } from '../../api/kueri';
import { resepKeDomain } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import { Banner } from '../../komponen/banner';
import { cx } from '../../komponen/gabung-kelas';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilihTanggal } from '../../komponen/pilih-tanggal';
import { GrupRadio, KartuPilihan, PilPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { buatJadwal } from '../../lib/jadwal-buat';
import { keBarisRencana, pakaiSubsidi, SIKLUS_PEMBAGIAN_ALAT } from '../../lib/rencana';
import { tambahHari } from '../../lib/tanggal';
import { teksGalat } from '../../teks/galat';
import { teksHitung as t } from '../../teks/hitung';
import { teksUmum } from '../../teks/umum';
import { angkaJumlah } from './baris-item';
import { KerangkaHitung } from './kerangka-hitung';
import { ringkasPilihan } from './pilih-metode';
import { alamatLangkah, angkaIsian, lahanUntukMetode, usePilihanHitung } from './pilihan';
import { useRencana } from './use-rencana';

type Kapan = 'hari-ini' | 'tanggal' | 'nanti';

export function HalamanPilihTanggalTanam() {
  const [pilihan] = usePilihanHitung();
  const r = useRencana(pilihan);
  const hariIni = useHariIni();
  const lahanQ = useLahan();
  const buat = useBuatSiklus();
  const navigate = useNavigate();
  const lokasi = useLocation();
  const [lahanId, setLahanId] = useState<string | null>(pilihan.lahan);
  const [kapan, setKapan] = useState<Kapan>('hari-ini');
  const [tanggal, setTanggal] = useState(hariIni);
  const [galat, setGalat] = useState<string | null>(null);

  if (!pilihan.komoditas || !pilihan.metode) return <Navigate to="/hitung/tanaman" replace />;
  if (r.memuat || lahanQ.isPending) {
    return (
      <p role="status" className="m-0 text-teks-pendukung">
        {teksUmum.memuat}
      </p>
    );
  }
  if (!r.resepApi || !r.metode || !r.ukuranValid?.ok)
    return <Navigate to={alamatLangkah('metode', pilihan)} replace />;

  const resep = r.resepApi;
  const metode = r.metode;
  const butuh = r.luasM2 ?? r.jumlahUnit ?? 0;
  const satuanKapasitas = metode.dasar_ukuran === 'lubang' ? t.lubang : 'm²';
  const cocok = (lahanQ.data ?? []).filter((l) =>
    lahanUntukMetode(metode.id).includes(l.jenis_lahan),
  );
  const tanggalTanam = kapan === 'nanti' ? null : kapan === 'hari-ini' ? hariIni : tanggal;
  const jadwal = tanggalTanam ? buatJadwal(resepKeDomain(resep).tugas, tanggalTanam) : null;

  async function simpan() {
    setGalat(null);
    if (!lahanId) return setGalat(t.pilihLahanDulu);
    if (kapan === 'tanggal' && !tanggal) return setGalat(t.isiTanggalDulu);
    const baris = keBarisRencana(r.items, r.harga);
    if (!baris.ok) return setGalat(teksGalat[baris.galat]);
    if (r.hargaJual === null) return setGalat(teksGalat.HARGA_JUAL_KOSONG);
    const dasar = metode.dasar_ukuran;
    try {
      const siklus = await buat.mutateAsync({
        resep_id: resep.id,
        lahan_id: lahanId,
        luas_m2: dasar === 'luas' ? r.luasM2 : null,
        jumlah_lubang: dasar === 'lubang' ? r.jumlahUnit : null,
        jumlah_polybag: dasar === 'polybag' ? r.jumlahUnit : null,
        volume_tandon_liter: dasar === 'lubang' ? r.volumeTandon : null,
        sistem_hidroponik: dasar === 'lubang' ? (r.sistem?.id ?? null) : null,
        vertikultur: pilihan.vertikultur,
        satuan_asli: dasar === 'luas' ? pilihan.satuan : dasar,
        nilai_asli: angkaIsian(pilihan.nilai) ?? butuh,
        tanggal_tanam: tanggalTanam,
        dapat_subsidi: pakaiSubsidi(r.harga),
        harga_jual: r.hargaJual,
        bagi_alat: r.bagiAlat,
        jumlah_siklus_pembagian: SIKLUS_PEMBAGIAN_ALAT,
        rencana_item: baris.nilai,
      });
      navigate(tanggalTanam ? `/beranda?siklus=${encodeURIComponent(siklus.id)}` : '/beranda');
    } catch (e) {
      setGalat(
        adalahGalatApi(e) ? (Object.values(e.rincian)[0]?.[0] ?? e.message) : teksUmum.galatIsi,
      );
    }
  }

  const tombol = (
    <Tombol penuh disabled={buat.isPending} onClick={() => void simpan()}>
      {buat.isPending ? t.menyimpan : tanggalTanam ? t.simpanDanJadwal : t.simpanRencana}
    </Tombol>
  );
  const kembaliKeSini = encodeURIComponent(lokasi.pathname + lokasi.search);

  return (
    <KerangkaHitung
      langkah={3}
      kembaliKe={alamatLangkah('modal', pilihan)}
      labelKembali={t.kembaliModal}
      judul={t.judulSimpan}
      sub={t.subSimpan}
      samping={
        <>
          {galat ? <Banner jenis="bahaya">{galat}</Banner> : null}
          {tombol}
        </>
      }
      bilahBawah={
        <>
          {galat ? <PesanKolom id="galat-simpan" galat={galat} /> : null}
          {tombol}
        </>
      }
    >
      <p className="m-0 font-medium">{ringkasPilihan(r)}</p>
      {resep.contoh ? (
        <LabelKecil nada="contoh" className="self-start">
          {teksUmum.labelContoh}
        </LabelKecil>
      ) : null}

      <section aria-labelledby="judul-lahan" className="flex flex-col gap-3">
        <h2 id="judul-lahan" className="m-0 text-judul-bagian font-semibold">
          {t.pilihLahan}
        </h2>
        {cocok.length === 0 ? (
          <p className="m-0 text-teks-pendukung">{t.belumAdaLahan}</p>
        ) : (
          <GrupRadio label={t.pilihLahan} className="grid gap-3 md:grid-cols-2">
            {cocok.map((l) => {
              const cukup = l.kapasitas.sisa >= butuh;
              return (
                <KartuPilihan
                  key={l.id}
                  dipilih={lahanId === l.id}
                  segera={!cukup}
                  onPilih={() => (cukup ? setLahanId(l.id) : undefined)}
                  labelAksesibel={`${l.nama}. ${t.sisaLahan(angkaJumlah(l.kapasitas.sisa), angkaJumlah(l.kapasitas.total), satuanKapasitas)}`}
                >
                  <div className="flex flex-col gap-0.5 p-4">
                    <span className={cx('font-semibold', !cukup && 'text-teks-pendukung')}>
                      {l.nama}
                    </span>
                    <span className="text-keterangan text-teks-pendukung">
                      {t.sisaLahan(
                        angkaJumlah(l.kapasitas.sisa),
                        angkaJumlah(l.kapasitas.total),
                        satuanKapasitas,
                      )}
                    </span>
                    {!cukup ? (
                      <span className="text-keterangan font-medium text-tomat-teks">
                        {t.lahanKurang(angkaJumlah(butuh), satuanKapasitas)}
                      </span>
                    ) : null}
                  </div>
                </KartuPilihan>
              );
            })}
          </GrupRadio>
        )}
        <Link
          to={`/lahan?kembali=${kembaliKeSini}`}
          className={cx(kelasTombol('sekunder'), 'self-start')}
        >
          {t.tambahLahan}
        </Link>
      </section>

      <Kartu judul={t.kapanTanam} tingkatJudul={2}>
        <div className="flex flex-col gap-4">
          <PilPilihan<Kapan>
            gaya="kotak"
            label={t.kapanTanam}
            nilai={kapan}
            onPilih={setKapan}
            opsi={[
              { nilai: 'hari-ini', label: t.hariIni },
              { nilai: 'tanggal', label: t.pilihTanggal },
              { nilai: 'nanti', label: t.nanti },
            ]}
            className="grid-cols-3"
          />
          {kapan === 'tanggal' ? (
            <PilihTanggal
              label={t.tanggalTanam}
              nilai={tanggal}
              onChange={setTanggal}
              bantuan={t.tanggalBantuan}
            />
          ) : null}
          {kapan === 'nanti' ? (
            <p className="m-0 text-teks-pendukung">{t.nantiKet}</p>
          ) : tanggalTanam ? (
            <div className="flex flex-col gap-1 rounded-md bg-tanah-lembut p-3">
              <span className="font-semibold">
                {t.panenPerkiraan(tambahHari(tanggalTanam, resep.umur_panen_hari))}
              </span>
              {jadwal?.ok ? (
                <span className="text-keterangan text-teks-pendukung">
                  {t.jumlahTugas(jadwal.nilai.length)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Kartu>
    </KerangkaHitung>
  );
}
