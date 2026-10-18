/**
 * Data usaha pembeli (halaman turunan 48; T4.28, PRD P0-02, US-21): nama usaha, jenis usaha, alamat,
 * desa, dan foto tempat usaha. Setelah dikirim statusnya "Menunggu verifikasi"; pembeli bisa melihat
 * aplikasi tetapi belum bisa memasang pesanan sampai admin memverifikasi (server menolak
 * `403 BELUM_TERVERIFIKASI`). Pembeli yang ditolak memperbaiki datanya di sini.
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  useSimpanProfilPembeli,
  useUnggahBerkas,
  useWilayahSatu,
} from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { JenisUsaha, Wilayah } from '../../api/tipe';
import { AmbilFoto, type FotoKecil } from '../../komponen/ambil-foto';
import { Kartu } from '../../komponen/kartu';
import { KolomIsian, PesanKolom } from '../../komponen/kolom-isian';
import { HeaderHalaman } from '../../komponen/navigasi';
import { PilihWilayah } from '../../komponen/pilih-wilayah';
import { PilPilihan } from '../../komponen/pilihan';
import { Tombol } from '../../komponen/tombol';
import { teksPembeli as t } from '../../teks/pembeli';
import { teksUmum } from '../../teks/umum';
import { StatusVerifikasi } from './status-verifikasi';

const JENIS: JenisUsaha[] = [
  'katering',
  'restoran',
  'warung',
  'koperasi',
  'penggilingan',
  'lainnya',
];

type Galat = Partial<Record<'nama' | 'alamat' | 'desa' | 'umum', string>>;

export function HalamanDaftarPembeli() {
  const navigate = useNavigate();
  const { akun } = useSesi();
  const profil = akun?.profil_pembeli ?? null;
  const simpan = useSimpanProfilPembeli();
  const unggah = useUnggahBerkas();
  const desaAwalQ = useWilayahSatu(profil?.wilayah_id ?? null);
  const [nama, setNama] = useState(profil?.nama_usaha ?? '');
  const [jenis, setJenis] = useState<JenisUsaha>(profil?.jenis_usaha ?? 'katering');
  const [alamat, setAlamat] = useState(profil?.alamat ?? '');
  const [desa, setDesa] = useState<Wilayah | null>(null);
  const [foto, setFoto] = useState<FotoKecil | null>(null);
  const [galat, setGalat] = useState<Galat>({});
  const desaPilih = desa ?? desaAwalQ.data ?? null;

  async function kirim(e: FormEvent) {
    e.preventDefault();
    const g: Galat = {};
    if (!nama.trim()) g.nama = t.isiNamaUsaha;
    if (!alamat.trim()) g.alamat = t.isiAlamat;
    if (!desaPilih) g.desa = t.pilihDesa;
    setGalat(g);
    if (Object.keys(g).length || !desaPilih) return;
    try {
      const fotoUrl = foto
        ? (await unggah.mutateAsync({ nama: foto.nama, jenis: foto.jenis, isi: foto.dataUrl })).url
        : (profil?.foto_tempat_usaha ?? null);
      await simpan.mutateAsync({
        nama_usaha: nama.trim(),
        jenis_usaha: jenis,
        alamat: alamat.trim(),
        wilayah_id: desaPilih.id,
        foto_tempat_usaha: fotoUrl,
      });
      navigate('/pembeli', { replace: true });
    } catch (err) {
      setGalat({ umum: adalahGalatApi(err) ? err.message : teksUmum.galatIsi });
    }
  }

  const fotoTampil = foto?.dataUrl ?? profil?.foto_tempat_usaha ?? null;
  return (
    <>
      <HeaderHalaman judul={t.daftarJudul} keterangan={t.daftarKet} />
      {profil ? <StatusVerifikasi profil={profil} selalu /> : null}
      <form
        onSubmit={(e) => void kirim(e)}
        noValidate
        className="flex flex-col gap-6 lg:max-w-teks"
      >
        <Kartu>
          <div className="flex flex-col gap-4">
            <KolomIsian
              label={t.namaUsaha}
              placeholder={t.namaUsahaContoh}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              galat={galat.nama}
            />
            <div className="flex flex-col gap-2">
              <p className="m-0 font-medium">{t.jenisUsahaLabel}</p>
              <PilPilihan<JenisUsaha>
                label={t.jenisUsahaLabel}
                className="flex-wrap"
                nilai={jenis}
                onPilih={setJenis}
                opsi={JENIS.map((j) => ({ nilai: j, label: t.jenisUsaha(j) }))}
              />
            </div>
            <KolomIsian
              label={t.alamatUsaha}
              placeholder={t.alamatContoh}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              galat={galat.alamat}
            />
            <PilihWilayah
              id="pembeli-wilayah"
              labelDesa={t.desaUsaha}
              nilai={desaPilih?.id ?? null}
              onChange={(_id, w) => {
                setDesa(w ?? null);
                setGalat((g) => ({ ...g, desa: undefined }));
              }}
              galat={galat.desa}
            />
            <div className="flex flex-col gap-2">
              <p className="m-0 flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{t.fotoUsaha}</span>
                <span className="text-keterangan text-teks-pendukung">{t.fotoUsahaKet}</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {fotoTampil ? (
                  <img
                    src={fotoTampil}
                    alt={t.fotoUsahaAlt}
                    className="aspect-foto w-full rounded-md border border-garis object-cover"
                  />
                ) : null}
                <AmbilFoto
                  label={fotoTampil ? t.gantiFoto : t.ambilFotoUsaha}
                  labelMemuat={t.memprosesFoto}
                  onFoto={setFoto}
                  onGagal={() => setGalat((g) => ({ ...g, umum: t.fotoGagal }))}
                  className="aspect-foto"
                />
              </div>
            </div>
          </div>
        </Kartu>
        {galat.umum ? <PesanKolom id="galat-daftar" galat={galat.umum} /> : null}
        <Tombol type="submit" penuh disabled={simpan.isPending || unggah.isPending}>
          {simpan.isPending ? t.mengirim : t.kirimData}
        </Tombol>
      </form>
    </>
  );
}
