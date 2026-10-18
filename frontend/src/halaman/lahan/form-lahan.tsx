/**
 * Formulir lahan (T4.36a, PRD P0-21, P0-33, D-06, D-15): nama, jenis, luas dengan satuan lokal (nilai
 * asli dikirim, server mengubahnya ke m² dengan konversi wilayah), kapasitas lubang hidroponik, dan
 * titik lahan yang hanya terlihat pemilik dan admin.
 */
import { useState, type FormEvent } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { useBuatLahan, useKonversiSatuan, useUbahLahan } from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { JenisLahan, Lahan, LahanMasukan } from '../../api/tipe';
import { KolomIsian, PesanKolom } from '../../komponen/kolom-isian';
import { PilihWilayah } from '../../komponen/pilih-wilayah';
import { PilPilihan } from '../../komponen/pilihan';
import { Tombol } from '../../komponen/tombol';
import { formatDesimal } from '../../lib/format';
import { teksBantuanLuas, type KonversiLuas } from '../../lib/konversi-satuan';
import { ambilLokasiPerangkat } from '../../lib/lokasi-perangkat';
import { teksGalat } from '../../teks/galat';
import { teksHitung } from '../../teks/hitung';
import { teksLahan as t } from '../../teks/lahan';
import { angkaIsian } from '../hitung/pilihan';

type Satuan = LahanMasukan['satuan_asli'];
const JENIS: JenisLahan[] = ['kebun', 'pekarangan', 'sawah', 'hidroponik'];

export function FormLahan({
  lahan,
  onSelesai,
  onBatal,
}: {
  /** Kosong = tambah lahan baru. */
  lahan: Lahan | null;
  onSelesai: (lahan: Lahan) => void;
  onBatal?: () => void;
}) {
  const { akun } = useSesi();
  const [wilayahId, setWilayahId] = useState(lahan?.wilayah_id ?? akun?.pengguna.wilayah_id ?? '');
  const konversiQ = useKonversiSatuan(wilayahId || null);
  const konversi: KonversiLuas = Object.fromEntries(
    (konversiQ.data ?? []).map((k) => [k.satuan, k.nilai_m2]),
  );
  const buat = useBuatLahan();
  const ubah = useUbahLahan();
  const [nama, setNama] = useState(lahan?.nama ?? '');
  const [jenis, setJenis] = useState<JenisLahan>(lahan?.jenis_lahan ?? 'kebun');
  const [satuan, setSatuan] = useState<Satuan>((lahan?.satuan_asli as Satuan) ?? 'm2');
  const [nilai, setNilai] = useState(lahan ? formatDesimal(lahan.nilai_asli, 2) : '');
  const [kapasitas, setKapasitas] = useState(
    lahan?.kapasitas_lubang ? String(lahan.kapasitas_lubang) : '',
  );
  const [lintang, setLintang] = useState(
    lahan?.lintang !== null && lahan?.lintang !== undefined ? String(lahan.lintang) : '',
  );
  const [bujur, setBujur] = useState(
    lahan?.bujur !== null && lahan?.bujur !== undefined ? String(lahan.bujur) : '',
  );
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [mencari, setMencari] = useState(false);

  const angka = angkaIsian(nilai);
  const bantuan = teksBantuanLuas(angka, satuan, konversi, 'ru');
  const sedang = buat.isPending || ubah.isPending;

  async function pakaiLokasi() {
    setMencari(true);
    setGalat((g) => {
      const salin = { ...g };
      delete salin.titik;
      return salin;
    });
    try {
      const pos = await ambilLokasiPerangkat({ mode: 'otomatis' });
      setLintang(pos.lintang.toFixed(5));
      setBujur(pos.bujur.toFixed(5));
    } catch {
      setGalat((g) => ({ ...g, titik: t.lokasiGagal }));
    } finally {
      setMencari(false);
    }
  }

  async function kirim(e: FormEvent) {
    e.preventDefault();
    const g: Record<string, string> = {};
    if (!nama.trim()) g.nama = t.isiNama;
    if (angka === null || angka <= 0) g.luas = teksGalat.LUAS_KOSONG;
    const kap = angkaIsian(kapasitas);
    if (jenis === 'hidroponik' && (kap === null || kap <= 0)) g.kapasitas = t.isiKapasitas;
    setGalat(g);
    if (Object.keys(g).length) return;
    const masukan: LahanMasukan = {
      nama: nama.trim(),
      jenis_lahan: jenis,
      satuan_asli: satuan,
      nilai_asli: angka as number,
      wilayah_id: wilayahId,
      lintang: angkaIsian(lintang),
      bujur: angkaIsian(bujur),
      kapasitas_lubang: jenis === 'hidroponik' ? kap : null,
    };
    try {
      const hasil = lahan
        ? await ubah.mutateAsync({ id: lahan.id, ubah: masukan })
        : await buat.mutateAsync(masukan);
      onSelesai(hasil);
    } catch (err) {
      if (adalahGalatApi(err)) {
        setGalat({
          nama: err.rincian.nama?.[0] ?? '',
          luas: err.rincian.nilai_asli?.[0] ?? err.rincian.luas_m2?.[0] ?? '',
          kapasitas: err.rincian.kapasitas_lubang?.[0] ?? '',
          umum: Object.keys(err.rincian).length ? '' : err.message,
        });
      }
    }
  }

  return (
    <form onSubmit={kirim} noValidate className="flex flex-col gap-4">
      <KolomIsian
        label={t.nama}
        placeholder={t.namaContoh}
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        galat={galat.nama || undefined}
      />
      <div className="flex flex-col gap-2">
        <span className="font-medium">{t.jenis}</span>
        <PilPilihan<JenisLahan>
          label={t.jenis}
          nilai={jenis}
          onPilih={setJenis}
          opsi={JENIS.map((j) => ({ nilai: j, label: teksHitung.namaJenisLahan[j] }))}
          className="flex-wrap"
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-medium">{teksHitung.satuanLuas}</span>
        <PilPilihan<Satuan>
          gaya="segmen"
          label={teksHitung.satuanLuas}
          nilai={satuan}
          onPilih={setSatuan}
          opsi={[
            { nilai: 'm2', label: teksHitung.namaSatuan.m2 },
            ...(konversi.ru ? [{ nilai: 'ru' as const, label: teksHitung.namaSatuan.ru }] : []),
            { nilai: 'hektare', label: teksHitung.namaSatuan.hektare },
          ]}
        />
      </div>
      <KolomIsian
        label={t.luas}
        inputMode="decimal"
        value={nilai}
        onChange={(e) => setNilai(e.target.value)}
        akhiran={teksHitung.akhiranSatuan[satuan === 'bata' ? 'ru' : satuan]}
        galat={galat.luas || undefined}
        bantuan={bantuan ? teksHitung.kiraKira(bantuan) : undefined}
      />
      {jenis === 'hidroponik' ? (
        <KolomIsian
          label={t.kapasitas}
          inputMode="numeric"
          value={kapasitas}
          onChange={(e) => setKapasitas(e.target.value)}
          akhiran={teksHitung.lubang}
          bantuan={t.kapasitasBantuan}
          galat={galat.kapasitas || undefined}
        />
      ) : null}
      <PilihWilayah
        id="lahan-wilayah"
        nilai={wilayahId || null}
        onChange={(id, d) => {
          setWilayahId(id);
          if (d && d.lintang !== null && d.bujur !== null && !lintang && !bujur) {
            setLintang(String(d.lintang));
            setBujur(String(d.bujur));
          }
        }}
        bantuan={t.desaKet}
        galat={galat.wilayah}
      />
      <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
        <legend className="mb-1 p-0 font-medium">{t.titik}</legend>
        <p className="m-0 text-keterangan text-teks-pendukung">{t.titikKet}</p>
        <div className="grid grid-cols-2 gap-3">
          <KolomIsian
            label={t.lintang}
            inputMode="decimal"
            value={lintang}
            onChange={(e) => setLintang(e.target.value)}
          />
          <KolomIsian
            label={t.bujur}
            inputMode="decimal"
            value={bujur}
            onChange={(e) => setBujur(e.target.value)}
          />
        </div>
        <Tombol varian="sekunder" onClick={pakaiLokasi} disabled={mencari} className="self-start">
          {mencari ? t.mencariLokasi : t.pakaiLokasi}
        </Tombol>
        {galat.titik ? <PesanKolom id="titik" galat={galat.titik} /> : null}
      </fieldset>
      {galat.umum ? <PesanKolom id="umum-lahan" galat={galat.umum} /> : null}
      <div className="flex flex-col gap-3 md:flex-row">
        <Tombol type="submit" disabled={sedang} penuh>
          {sedang ? t.menyimpan : t.simpan}
        </Tombol>
        {onBatal ? (
          <Tombol varian="sekunder" onClick={onBatal} penuh>
            {t.batal}
          </Tombol>
        ) : null}
      </div>
    </form>
  );
}
