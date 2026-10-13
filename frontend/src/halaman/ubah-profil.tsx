/**
 * Ubah profil (papan 35, T4.36, PRD P0-01): foto profil yang dikecilkan otomatis, nama, desa, isian
 * "Saya terdaftar di kelompok tani" (bawaan pilihan subsidi di kalkulator, D-38), dan ganti nomor
 * HP dengan kode SMS ke nomor baru. Tanpa kata sandi dan nama pengguna (D-04).
 * Mengganti desa memperbarui jarak pesanan di sekitar (cache pesanan dan referensi dibatalkan).
 * Desktop: formulir di kiri, pratinjau untuk pembeli serta Simpan dan Batal di kanan.
 */
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adalahGalatApi } from '../api/galat';
import {
  useDaftarSiklus,
  useKomoditas,
  useRingkasanRating,
  useUbahProfil,
  useUnggahBerkas,
  useWilayah,
  useWilayahSatu,
} from '../api/kueri';
import { useSesi } from '../api/sesi';
import type { Pengguna, UbahProfilMasukan, Wilayah } from '../api/tipe';
import { AmbilFoto, type FotoKecil } from '../komponen/ambil-foto';
import { Avatar } from '../komponen/avatar';
import { Ikon } from '../komponen/ikon';
import { Kartu } from '../komponen/kartu';
import { KolomIsian, PesanKolom } from '../komponen/kolom-isian';
import { LabelKecil } from '../komponen/label-kecil';
import { GrupRadio, KartuPilihan } from '../komponen/pilihan';
import { Tombol, kelasTombol } from '../komponen/tombol';
import { useLayarLebar } from '../komponen/use-layar-lebar';
import { formatDesimal } from '../lib/format';
import { tampilNomorHp } from '../lib/nomor-hp';
import { statistikPetani } from '../lib/profil';
import { teksPilihPeran } from '../teks/sesi';
import { teksUbahProfil as t, teksUbahProfilPembeli } from '../teks/profil';
import { DialogGantiNomor } from './profil/ganti-nomor';
import { namaDesa } from './profil/nama-desa';

interface Galat {
  nama?: string;
  desa?: string;
  foto?: string;
  umum?: string;
}

/** Foto: tetap, diganti foto baru (belum diunggah), atau dihapus. */
type UbahFoto = { jenis: 'tetap' } | { jenis: 'baru'; foto: FotoKecil } | { jenis: 'hapus' };

function PilihDesa({
  desa,
  onPilih,
  galat,
  wajibTersedia,
}: {
  desa: Wilayah | null;
  onPilih: (w: Wilayah) => void;
  galat?: string;
  /** Petani hanya boleh memilih desa yang tersedia di pilot (D-56). */
  wajibTersedia: boolean;
}) {
  const [cari, setCari] = useState('');
  const kata = cari.trim();
  const wilayah = useWilayah({ cari: kata, per_halaman: 5 });
  return (
    <div className="flex flex-col gap-3">
      <KolomIsian
        label={t.desa}
        type="search"
        placeholder={namaDesa(desa) ?? t.cariDesa}
        value={cari}
        onChange={(e) => setCari(e.target.value)}
        galat={galat}
        bantuan={t.desaKet}
      />
      {desa ? (
        <p role="status" className="m-0 font-medium text-daun-tua">
          {t.desaTerpilih(namaDesa(desa) ?? '')}
        </p>
      ) : null}
      {kata && wilayah.data?.data.length === 0 ? (
        <p className="m-0 text-teks-pendukung">{t.tidakAdaDesa}</p>
      ) : null}
      {kata && wilayah.data?.data.length ? (
        <GrupRadio label={teksPilihPeran.pilihanDesa} className="flex flex-col gap-2">
          {wilayah.data.data.map((w) => (
            <KartuPilihan
              key={w.id}
              dipilih={desa?.id === w.id}
              nonaktif={wajibTersedia && !w.tersedia_pilot}
              onPilih={() => {
                onPilih(w);
                setCari('');
              }}
              labelAksesibel={`${w.desa}, ${teksPilihPeran.lokasiDesa(w.kecamatan, w.kabupaten)}${w.tersedia_pilot ? '' : `, ${teksPilihPeran.belumTersediaPilot}`}`}
            >
              <div className="flex flex-col px-4 py-3">
                <span className="font-semibold">{w.desa}</span>
                <span className="text-keterangan text-teks-pendukung">
                  {teksPilihPeran.lokasiDesa(w.kecamatan, w.kabupaten)}
                </span>
                {w.tersedia_pilot ? null : (
                  <span className="text-keterangan text-teks-pendukung">
                    {teksPilihPeran.belumTersediaPilot}
                  </span>
                )}
              </div>
            </KartuPilihan>
          ))}
        </GrupRadio>
      ) : null}
    </div>
  );
}

function Pratinjau({
  p,
  nama,
  foto,
  desa,
}: {
  p: Pengguna;
  nama: string;
  foto: string | null;
  desa: Wilayah | null;
}) {
  const ratingQ = useRingkasanRating(p.id);
  const siklusQ = useDaftarSiklus();
  const komoditasQ = useKomoditas();
  const stat = statistikPetani(siklusQ.data ?? [], []);
  const idKomoditas = [...new Set((siklusQ.data ?? []).map((s) => s.komoditas_id))];
  const r = ratingQ.data;
  return (
    <div className="flex flex-col gap-2">
      <h2 className="m-0 text-isi font-medium">{t.pratinjau}</h2>
      <div className="flex flex-col gap-3 rounded-lg border border-garis bg-putih p-4">
        <div className="flex items-start gap-3">
          <Avatar nama={nama} foto={foto} ukuran={64} />
          <div className="min-w-0">
            <p className="m-0 font-semibold">{nama || '–'}</p>
            <p className="m-0 text-teks-pendukung">{namaDesa(desa)}</p>
          </div>
        </div>
        <p className="m-0 flex items-center gap-1.5">
          {r?.rata_rata != null ? (
            <>
              <Ikon nama="bintang" ukuran={20} className="fill-matahari text-matahari" />
              <span className="font-semibold">{formatDesimal(r.rata_rata, 1, true)}</span>
              <span className="text-teks-pendukung">·</span>
            </>
          ) : null}
          <span className="text-teks-pendukung">{t.siklusSelesai(stat.siklusSelesai)}</span>
        </p>
        {idKomoditas.length ? (
          <span className="flex flex-wrap gap-2">
            {idKomoditas.map((id) => (
              <LabelKecil key={id} nada="garis">
                {komoditasQ.data?.find((k) => k.id === id)?.nama ?? id}
              </LabelKecil>
            ))}
          </span>
        ) : null}
      </div>
      <p className="m-0 text-keterangan text-teks-pendukung">{t.pratinjauKet}</p>
    </div>
  );
}

/** Petani: desa, kelompok tani, pratinjau untuk pembeli. Pembeli: nama, foto, nomor HP saja ([AG-23]). */
type Varian = 'petani' | 'pembeli';

const VARIAN = {
  petani: { t, kembali: '/profil' },
  pembeli: { t: teksUbahProfilPembeli, kembali: '/pembeli/profil' },
} as const;

function Formulir({
  p,
  desaAwal,
  varian,
}: {
  p: Pengguna;
  desaAwal: Wilayah | null;
  varian: Varian;
}) {
  const { t, kembali } = VARIAN[varian];
  const petani = varian === 'petani';
  const lebar = useLayarLebar();
  const navigate = useNavigate();
  const ubah = useUbahProfil();
  const unggah = useUnggahBerkas();
  const [nama, setNama] = useState(p.nama ?? '');
  const [desa, setDesa] = useState<Wilayah | null>(desaAwal);
  const [kelompok, setKelompok] = useState(p.terdaftar_kelompok_tani);
  const [foto, setFoto] = useState<UbahFoto>({ jenis: 'tetap' });
  const [galat, setGalat] = useState<Galat>({});
  const [dialogNomor, setDialogNomor] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const fotoTampil =
    foto.jenis === 'baru' ? foto.foto.dataUrl : foto.jenis === 'hapus' ? null : p.foto_profil;
  const sedang = ubah.isPending || unggah.isPending;

  async function simpan() {
    setGalat({});
    setInfo(null);
    if (!nama.trim()) return setGalat({ nama: t.isiNama });
    const m: UbahProfilMasukan = {};
    if (nama.trim() !== p.nama) m.nama = nama.trim();
    if (petani && desa && desa.id !== p.wilayah_id) m.wilayah_id = desa.id;
    if (petani && kelompok !== p.terdaftar_kelompok_tani) m.terdaftar_kelompok_tani = kelompok;
    try {
      if (foto.jenis === 'hapus') m.foto_profil = null;
      if (foto.jenis === 'baru') {
        const f = foto.foto;
        m.foto_profil = (
          await unggah.mutateAsync({ nama: f.nama, jenis: f.jenis, isi: f.dataUrl })
        ).url;
      }
    } catch {
      return setGalat({ foto: t.gagalFoto });
    }
    if (!Object.keys(m).length) return navigate(kembali);
    try {
      await ubah.mutateAsync(m);
      navigate(kembali, { state: { info: t.tersimpan } });
    } catch (e) {
      if (adalahGalatApi(e))
        setGalat({
          nama: e.rincian.nama?.[0],
          desa: e.rincian.wilayah_id?.[0],
          umum: Object.keys(e.rincian).length ? undefined : e.message,
        });
      else setGalat({ umum: t.gagalFoto });
    }
  }

  const bagianFoto = (
    <div className="flex flex-col items-center gap-3 lg:w-40 lg:flex-none">
      <Avatar nama={nama} foto={fotoTampil} ukuran={96} />
      <AmbilFoto
        label={t.gantiFoto}
        labelMemuat={t.mengunggah}
        onFoto={(f) => {
          setFoto({ jenis: 'baru', foto: f });
          setGalat((g) => ({ ...g, foto: undefined }));
        }}
        onGagal={() => setGalat((g) => ({ ...g, foto: t.gagalFoto }))}
        className="w-full"
      />
      {fotoTampil ? (
        <button
          type="button"
          onClick={() => setFoto({ jenis: 'hapus' })}
          className="fokus-cincin inline-flex min-h-sentuh cursor-pointer items-center rounded-md border-0 bg-transparent px-3 font-semibold text-tomat-teks"
        >
          {t.hapusFoto}
        </button>
      ) : null}
      {galat.foto ? <PesanKolom id="galat-foto" galat={galat.foto} /> : null}
    </div>
  );

  const bagianData = (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <KolomIsian
        label={t.namaLengkap}
        autoComplete="name"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        galat={galat.nama}
      />
      {petani ? <PilihDesa desa={desa} onPilih={setDesa} galat={galat.desa} wajibTersedia /> : null}
      {petani ? (
        <label className="flex min-h-sentuh cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={kelompok}
            onChange={(e) => setKelompok(e.target.checked)}
            className="fokus-cincin mt-0.5 h-6 w-6 flex-none cursor-pointer accent-daun-tua"
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-medium">{t.kelompokTani}</span>
            <span className="text-keterangan text-teks-pendukung">{t.kelompokTaniKet}</span>
          </span>
        </label>
      ) : null}
    </div>
  );

  const kartuNomor = (
    <Kartu judul={t.nomorHp} tingkatJudul={2}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-judul-bagian font-semibold tabular-nums">
            {tampilNomorHp(p.nomor_hp)}
          </span>
          <Tombol varian="sekunder" onClick={() => setDialogNomor(true)}>
            {t.gantiNomor}
          </Tombol>
        </div>
        <p className="m-0 text-keterangan text-teks-pendukung">{t.nomorKet}</p>
        {info ? (
          <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
            <Ikon nama="centang" ukuran={20} />
            {info}
          </p>
        ) : null}
      </div>
    </Kartu>
  );

  const tindakan = (
    <div className="flex flex-col gap-3">
      {galat.umum ? <PesanKolom id="galat-umum" galat={galat.umum} /> : null}
      <Tombol penuh disabled={sedang} onClick={() => void simpan()}>
        {sedang ? t.menyimpan : t.simpan}
      </Tombol>
      {lebar ? (
        <Link to={kembali} className={kelasTombol('sekunder', true)}>
          {t.batal}
        </Link>
      ) : null}
    </div>
  );

  const dialog = (
    <DialogGantiNomor
      terbuka={dialogNomor}
      onTutup={() => setDialogNomor(false)}
      onBerhasil={() => setInfo(t.nomorTersimpan)}
    />
  );

  if (!lebar)
    return (
      <>
        <Kartu judul={t.fotoProfil} tingkatJudul={2}>
          <div className="flex flex-col gap-3">
            {bagianFoto}
            <p className="m-0 text-center text-keterangan text-teks-pendukung">{t.fotoKet}</p>
          </div>
        </Kartu>
        <Kartu judul={t.dataDiri} tingkatJudul={2}>
          {bagianData}
        </Kartu>
        {kartuNomor}
        {tindakan}
        {dialog}
      </>
    );
  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Kartu judul={t.fotoDanData} tingkatJudul={2}>
          <div className="flex gap-6">
            {bagianFoto}
            {bagianData}
          </div>
        </Kartu>
        {kartuNomor}
      </div>
      <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4">
        {petani ? <Pratinjau p={p} nama={nama} foto={fotoTampil} desa={desa} /> : null}
        {tindakan}
      </aside>
      {dialog}
    </div>
  );
}

function Kepala({ varian, children }: { varian: Varian; children?: ReactNode }) {
  const { t, kembali } = VARIAN[varian];
  return (
    <div className="flex flex-col gap-3">
      <Link
        to={kembali}
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembali}</span>
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-judul-halaman font-semibold">{t.judul}</h1>
        <p className="m-0 text-teks-pendukung">{t.sub}</p>
      </div>
      {children}
    </div>
  );
}

export function HalamanUbahProfil({ varian = 'petani' }: { varian?: Varian }) {
  const { akun } = useSesi();
  const p = akun?.pengguna;
  // Desa pembeli diatur di Data usaha, jadi tidak perlu dimuat di sini.
  const wilayahQ = useWilayahSatu(varian === 'petani' ? (p?.wilayah_id ?? null) : null);
  if (!p) return null;
  const siapDesa = varian === 'pembeli' || !p.wilayah_id || wilayahQ.data || wilayahQ.isError;
  return (
    <>
      <Kepala varian={varian} />
      {siapDesa ? (
        <Formulir key={p.id} p={p} desaAwal={wilayahQ.data ?? null} varian={varian} />
      ) : null}
    </>
  );
}
