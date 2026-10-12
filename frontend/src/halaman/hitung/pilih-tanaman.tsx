/**
 * Hitung langkah 1: Mau tanam apa? (papan 10, T4.02, PRD P0-30, US-22, US-23). Jenis lahan, cari,
 * daftar per kategori; komoditas tanpa resep tetap bisa diketuk dan membuka "Segera hadir" (T4.03).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useDaftarResep,
  useKomoditas,
  useKonfigurasi,
  useMetode,
  usePesananSekitar,
} from '../../api/kueri';
import type { JenisLahan, KategoriKomoditas, Komoditas } from '../../api/tipe';
import { Dialog } from '../../komponen/dialog';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { kelasInput } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { GrupRadio, PilPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { angkaJarak } from '../../lib/jarak';
import { teksHitung as t } from '../../teks/hitung';
import { teksUmum } from '../../teks/umum';
import { GambarKomoditas } from './gambar';
import { KerangkaHitung } from './kerangka-hitung';
import { alamatLangkah, metodeUntuk, usePilihanHitung } from './pilihan';
import { SegeraHadir } from './segera-hadir';

type FilterLahan = 'semua' | Exclude<JenisLahan, 'hidroponik'>;
const URUTAN_KATEGORI: KategoriKomoditas[] = ['sayuran_daun', 'sayuran_buah', 'tanaman_pangan'];

function BarisKomoditas({
  k,
  dipilih,
  onPilih,
}: {
  k: Komoditas;
  dipilih: boolean;
  onPilih: () => void;
}) {
  const segera = k.status_resep === 'segera_hadir';
  return (
    <div
      className={cx(
        'relative flex min-h-baris-tugas items-center gap-3 rounded-lg border p-4',
        dipilih ? 'border-daun-tua bg-daun-lembut' : 'border-garis bg-putih',
      )}
    >
      <GambarKomoditas id={k.id} segera={segera} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cx(segera ? 'font-medium text-teks-pendukung' : 'font-semibold')}>
          {k.nama}
        </span>
        <span className="text-keterangan text-teks-pendukung">
          {t.panenSekitar(k.umur_panen_hari)} · {t.pesananSekitar(k.jumlah_pesanan_sekitar)}
        </span>
        {k.jumlah_pesanan_sekitar || segera ? (
          <span className="flex flex-wrap gap-2">
            {k.jumlah_pesanan_sekitar ? (
              <LabelKecil nada="hijau" ikon="pesanan">
                {t.adaPesanan}
              </LabelKecil>
            ) : null}
            {segera ? <LabelKecil nada="segera">{t.segeraHadir}</LabelKecil> : null}
          </span>
        ) : null}
      </div>
      {segera ? (
        <Ikon nama="panah-kanan" className="flex-none text-teks-pendukung" />
      ) : (
        <span
          aria-hidden="true"
          className={cx(
            'grid h-6 w-6 flex-none place-items-center rounded-full border-2',
            dipilih ? 'border-daun-tua' : 'border-garis-kuat',
          )}
        >
          {dipilih ? <span className="h-3 w-3 rounded-full bg-daun-tua" /> : null}
        </span>
      )}
      <button
        type="button"
        role={segera ? undefined : 'radio'}
        aria-checked={segera ? undefined : dipilih}
        aria-label={segera ? t.tanamanSegera(k.nama) : t.pilihTanaman(k.nama)}
        onClick={onPilih}
        className="fokus-cincin absolute inset-0 m-0 h-full w-full cursor-pointer rounded-lg border-0 bg-transparent p-0"
      />
      {dipilih ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-lg border-2 border-daun-tua"
        />
      ) : null}
    </div>
  );
}

export function HalamanPilihTanaman() {
  const [pilihan, ubahPilihan] = usePilihanHitung();
  const [lahan, setLahan] = useState<FilterLahan>('semua');
  const [cari, setCari] = useState('');
  const [segera, setSegera] = useState<Komoditas | null>(null);
  const [mintaBaru, setMintaBaru] = useState(false);
  const komoditasQ = useKomoditas();
  const metodeQ = useMetode();
  const resepQ = useDaftarResep(pilihan.komoditas ? { komoditas_id: pilihan.komoditas } : {});
  const pesananQ = usePesananSekitar({});
  const konfigurasiQ = useKonfigurasi();

  const semua = komoditasQ.data ?? [];
  const kata = cari.trim().toLowerCase();
  const tampil = semua.filter(
    (k) =>
      (lahan === 'semua' || k.jenis_lahan_cocok.includes(lahan)) &&
      (!kata || k.nama.toLowerCase().includes(kata)),
  );
  const dipilih =
    semua.find((k) => k.id === pilihan.komoditas && k.status_resep === 'tersedia') ?? null;
  const pesananDipilih = (pesananQ.data?.data ?? []).filter((p) => p.komoditas_id === dipilih?.id);
  const resepDipilih = (resepQ.data ?? []).filter((r) => r.komoditas_id === dipilih?.id);
  const lanjut = dipilih
    ? alamatLangkah('metode', { ...pilihan, komoditas: dipilih.id, metode: null })
    : null;

  const tombolLanjut = lanjut ? (
    <Link to={lanjut} className={kelasTombol('utama', true)}>
      {t.lanjutMetode}
    </Link>
  ) : (
    <Tombol penuh disabled>
      {t.lanjutMetode}
    </Tombol>
  );

  const panel = dipilih ? (
    <Kartu
      judul={dipilih.nama}
      keterangan={t.namaKategori[dipilih.kategori]}
      kanan={
        dipilih.jumlah_pesanan_sekitar ? (
          <LabelKecil nada="hijau" ikon="pesanan">
            {t.adaPesanan}
          </LabelKecil>
        ) : null
      }
    >
      <dl className="m-0 flex flex-col gap-3">
        <div className="flex justify-between gap-3 border-b border-garis pb-3">
          <dt className="text-teks-pendukung">{t.umurPanen}</dt>
          <dd className="m-0">{t.sekitarHari(dipilih.umur_panen_hari)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-garis pb-3">
          <dt className="text-teks-pendukung">{t.cocokUntuk}</dt>
          <dd className="m-0 flex flex-wrap justify-end gap-1.5">
            {dipilih.jenis_lahan_cocok.map((j) => (
              <LabelKecil key={j} nada="garis">
                {t.namaJenisLahan[j]}
              </LabelKecil>
            ))}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-garis pb-3">
          <div className="flex justify-between gap-3">
            <dt className="text-teks-pendukung">{t.pesananDiSekitar}</dt>
            <dd className="m-0">{t.nPesanan(dipilih.jumlah_pesanan_sekitar)}</dd>
          </div>
          {pesananDipilih[0] ? (
            <dd className="m-0 text-right text-teks-pendukung">
              {t.terdekat(pesananDipilih[0].nama_pembeli, angkaJarak(pesananDipilih[0].jarak_km))}
            </dd>
          ) : null}
        </div>
      </dl>
      <p className="mb-2 mt-4 font-medium">{t.caraTersedia}</p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {metodeUntuk(dipilih, metodeQ.data ?? []).map((m) => (
          <li key={m.id} className="flex min-h-sentuh items-center justify-between gap-3">
            <span>{m.nama}</span>
            {resepDipilih.some((r) => r.metode_id === m.id) ? (
              <LabelKecil nada="polos" ikon="centang">
                {t.resepTersedia}
              </LabelKecil>
            ) : (
              <LabelKecil nada="segera">{t.segeraHadir}</LabelKecil>
            )}
          </li>
        ))}
      </ul>
      <p className="mb-0 mt-3 text-keterangan text-teks-pendukung">{t.catatanPanel}</p>
    </Kartu>
  ) : null;

  return (
    <KerangkaHitung
      langkah={1}
      kembaliKe="/beranda"
      labelKembali={t.batal}
      judul={t.judulTanaman}
      samping={
        <>
          {panel}
          {tombolLanjut}
        </>
      }
      bilahBawah={
        <>
          <p className="m-0 text-center text-keterangan text-teks-pendukung">
            {dipilih ? t.ringkasTanaman(dipilih.nama, dipilih.umur_panen_hari) : t.pilihTanamanDulu}
          </p>
          {tombolLanjut}
        </>
      }
    >
      <label className="flex min-h-kontrol items-center gap-1 rounded-md border-1.5 border-garis-kuat bg-putih pl-4 focus-within:border-daun-tua focus-within:shadow-fokus lg:max-w-dialog">
        <Ikon nama="cari" ukuran={20} className="flex-none text-teks-pendukung" />
        <span className="sr-saja">{t.cariTanaman}</span>
        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder={t.cariTanaman}
          className={cx(kelasInput, 'pl-2')}
        />
      </label>
      <PilPilihan<FilterLahan>
        label={t.jenisLahan}
        nilai={lahan}
        onPilih={setLahan}
        opsi={[
          { nilai: 'semua', label: t.semua },
          { nilai: 'sawah', label: t.namaJenisLahan.sawah },
          { nilai: 'kebun', label: t.namaJenisLahan.kebun },
          { nilai: 'pekarangan', label: t.namaJenisLahan.pekarangan },
        ]}
        className="-mx-4 px-4 lg:mx-0 lg:flex-wrap lg:px-0"
      />

      {komoditasQ.isPending ? (
        <p role="status" className="m-0 text-teks-pendukung">
          {teksUmum.memuat}
        </p>
      ) : komoditasQ.isError ? (
        <p role="alert" className="m-0 text-tomat-teks">
          {komoditasQ.error.message}
        </p>
      ) : tampil.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-garis bg-putih p-4">
          <p className="m-0 font-semibold">{t.kosongCari}</p>
          <p className="m-0 text-teks-pendukung">{t.kosongCariIsi}</p>
          <Tombol varian="sekunder" onClick={() => setMintaBaru(true)}>
            {t.mintaTanamanBaru}
          </Tombol>
        </div>
      ) : (
        URUTAN_KATEGORI.map((kat) => {
          const isi = tampil.filter((k) => k.kategori === kat);
          if (!isi.length) return null;
          return (
            <section key={kat} className="flex flex-col gap-3" aria-labelledby={`kategori-${kat}`}>
              <div className="flex items-baseline justify-between gap-3 lg:justify-start">
                <h2 id={`kategori-${kat}`} className="m-0 text-judul-bagian font-semibold">
                  {t.namaKategori[kat]}
                </h2>
                <span className="text-teks-pendukung">{t.jumlahTanaman(isi.length)}</span>
              </div>
              <GrupRadio label={t.namaKategori[kat]} className="grid gap-3 md:grid-cols-2">
                {isi.map((k) => (
                  <BarisKomoditas
                    key={k.id}
                    k={k}
                    dipilih={dipilih?.id === k.id}
                    onPilih={() =>
                      k.status_resep === 'tersedia'
                        ? ubahPilihan({ komoditas: k.id, metode: null })
                        : setSegera(k)
                    }
                  />
                ))}
              </GrupRadio>
            </section>
          );
        })
      )}

      {segera ? (
        <SegeraHadir
          key={segera.id}
          terbuka
          onTutup={() => setSegera(null)}
          judul={segera.nama}
          keterangan={t.keteranganKomoditas(
            t.namaKategori[segera.kategori],
            segera.umur_panen_hari,
          )}
          ilustrasi={<GambarKomoditas id={segera.id} />}
          komoditasId={segera.id}
        />
      ) : null}
      <Dialog terbuka={mintaBaru} onTutup={() => setMintaBaru(false)} judul={t.mintaTanamanJudul}>
        <div className="flex flex-col gap-4">
          <p className="m-0">
            {konfigurasiQ.data
              ? t.mintaTanamanIsi(
                  konfigurasiQ.data.kontak_admin.whatsapp,
                  konfigurasiQ.data.kontak_admin.jam_layanan,
                )
              : teksUmum.memuat}
          </p>
          <Tombol penuh onClick={() => setMintaBaru(false)}>
            {teksUmum.tutup}
          </Tombol>
        </div>
      </Dialog>
    </KerangkaHitung>
  );
}
