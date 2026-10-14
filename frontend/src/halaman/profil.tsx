/**
 * Profil petani (papan 34, T4.35, PRD P0-01, P0-09, P0-28): foto, nama, desa, rating dari pembeli,
 * siklus selesai, kg terjual, kartu Akun, Kebun (desa, ringkasan lahan, komoditas, kelompok tani),
 * catatan admin untuk petani sendiri (D-03), Pengingat per siklus, Bantuan, dan Keluar.
 * Tanpa kata sandi, nama pengguna, dan kartu kelompok tani (D-04, D-06).
 * Desktop: kartu profil di kiri, Akun + Pengingat dan Kebun + Bantuan di dua kolom.
 */
import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  useCatatanSaya,
  useDaftarSiklus,
  useKirimanSaya,
  useKomoditas,
  useLahan,
  usePengingat,
  usePerbaruiLokasi,
  useRingkasanRating,
  useWilayahSatu,
} from '../api/kueri';
import { useKeluarSesi, useSesi } from '../api/sesi';
import type { Pengguna, Wilayah } from '../api/tipe';
import { bulatkanLokasi } from '../lib/jarak';
import { Avatar } from '../komponen/avatar';
import { cx } from '../komponen/gabung-kelas';
import { Ikon } from '../komponen/ikon';
import { Kartu } from '../komponen/kartu';
import { LabelKecil } from '../komponen/label-kecil';
import { KartuLevelLencana, LencanaPeringkatKecil } from '../komponen/level-lencana';
import { kelasTombol } from '../komponen/tombol';
import { useLayarLebar } from '../komponen/use-layar-lebar';
import { formatBulan, formatTanggal } from '../lib/format';
import { kelompokkanSiklus } from '../lib/kelompok-siklus';
import { tampilNomorHp } from '../lib/nomor-hp';
import { ringkasLahan, statistikPetani } from '../lib/profil';
import { teksProfil as t } from '../teks/profil';
import { keKelompok, useNamaSiklus } from './kebun/nama-siklus';
import { namaDesa } from './profil/nama-desa';

/** Baris kartu: label di atas nilai (HP) atau sejajar (desktop); bisa berupa tautan. */
export function Baris({
  label,
  nilai,
  ke,
  akhir,
  bertumpuk,
}: {
  label: ReactNode;
  nilai?: ReactNode;
  ke?: string;
  akhir?: boolean;
  /** Label di atas nilai juga di desktop (label atau nilai panjang). */
  bertumpuk?: boolean;
}) {
  const sejajar = !bertumpuk;
  const isi = (
    <>
      <span
        className={cx(
          'flex min-w-0 flex-1 flex-col gap-0.5',
          sejajar && 'xl:flex-row xl:items-center xl:justify-between xl:gap-3',
        )}
      >
        <span
          className={
            nilai
              ? cx('text-teks-pendukung', sejajar && 'xl:flex-none xl:whitespace-nowrap')
              : 'font-medium'
          }
        >
          {label}
        </span>
        {nilai ? (
          <span className={cx('min-w-0 font-medium', sejajar && 'xl:text-right')}>{nilai}</span>
        ) : null}
      </span>
      {ke ? (
        <Ikon nama="panah-kanan" className="panah-geser flex-none text-teks-pendukung" />
      ) : null}
    </>
  );
  const kelas = cx('flex min-h-16 items-center gap-3 py-3', !akhir && 'border-b border-garis');
  return (
    <li>
      {ke ? (
        <Link to={ke} className={cx(kelas, 'fokus-cincin rounded-sm text-teks no-underline')}>
          {isi}
        </Link>
      ) : (
        <div className={kelas}>{isi}</div>
      )}
    </li>
  );
}

export function KartuDaftar({
  judul,
  keterangan,
  children,
}: {
  judul: string;
  keterangan?: string;
  children: ReactNode;
}) {
  return (
    <Kartu judul={judul} keterangan={keterangan} tingkatJudul={2}>
      <ul className="-mb-2 m-0 list-none p-0">{children}</ul>
    </Kartu>
  );
}

function KartuDiri({ p, wilayah }: { p: Pengguna; wilayah: Wilayah | null }) {
  const ratingQ = useRingkasanRating(p.id);
  const siklusQ = useDaftarSiklus();
  const kirimanQ = useKirimanSaya();
  const stat = statistikPetani(
    siklusQ.data ?? [],
    (kirimanQ.data ?? []).map((k) => ({
      status: k.status,
      jumlahKg: k.jumlah_kg,
      ditolakKg: k.jumlah_ditolak_kg,
    })),
  );
  const r = ratingQ.data;
  return (
    <section className="flex flex-col items-center gap-4 rounded-lg border border-garis bg-putih p-4 text-center lg:p-5">
      <Link
        to="/profil/ubah"
        aria-label={t.gantiFoto}
        className="fokus-cincin relative rounded-full no-underline"
      >
        <Avatar nama={p.nama ?? ''} foto={p.foto_profil} ukuran={96} />
        <span className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full border-2 border-putih bg-daun-tua text-putih">
          <Ikon nama="kamera" ukuran={20} />
        </span>
      </Link>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <p className="m-0 text-judul-halaman font-semibold">{p.nama}</p>
          <LencanaPeringkatKecil />
        </div>
        <p className="m-0 text-teks-pendukung">
          {t.petaniDi(namaDesa(wilayah))} ·{' '}
          {t.bergabung(formatBulan(p.dibuat_pada.slice(0, 7), { denganTahun: true }))}
        </p>
        <p className="m-0 flex items-center justify-center gap-1.5">
          {r && r.rata_rata !== null ? (
            <>
              <Ikon nama="bintang" ukuran={20} className="fill-matahari text-matahari" />
              <span className="font-semibold">{t.rating(r.rata_rata, r.jumlah).angka}</span>
              <span className="text-teks-pendukung">{t.rating(r.rata_rata, r.jumlah).ket}</span>
            </>
          ) : (
            <span className="text-teks-pendukung">{t.belumAdaUlasan}</span>
          )}
        </p>
      </div>
      <dl className="m-0 grid w-full grid-cols-2 border-y border-garis">
        <div className="flex flex-col-reverse py-3">
          <dt className="text-teks-pendukung">{t.siklusSelesai}</dt>
          <dd className="m-0 text-uang font-semibold tabular-nums">{stat.siklusSelesai}</dd>
        </div>
        <div className="flex flex-col-reverse border-l border-garis py-3">
          <dt className="text-teks-pendukung">{t.panenTerjual}</dt>
          <dd className="m-0 text-uang font-semibold tabular-nums text-tanah">
            {t.kg(stat.kgTerjual)}
          </dd>
        </div>
      </dl>
      <Link to="/profil/ubah" className={kelasTombol('sekunder', true)}>
        {t.ubahProfil}
      </Link>
    </section>
  );
}

function KartuAkun({ p }: { p: Pengguna }) {
  return (
    <KartuDaftar judul={t.akun}>
      <Baris label={t.nama} nilai={p.nama} ke="/profil/ubah" />
      <Baris
        label={t.nomorHp}
        nilai={<span className="tabular-nums">{tampilNomorHp(p.nomor_hp)}</span>}
        ke="/profil/ubah"
        akhir
      />
    </KartuDaftar>
  );
}

function KartuPetaPetani({ p }: { p: Pengguna }) {
  const mutasi = usePerbaruiLokasi();
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [sedangMinta, setSedangMinta] = useState(false);

  const aktif = Boolean(p.tampil_di_peta);

  const tanganiUbahSakelar = async (aktifBaru: boolean) => {
    setPesanGalat(null);
    if (!aktifBaru) {
      try {
        await mutasi.mutateAsync({ tampil_di_peta: false });
      } catch {
        setPesanGalat('Gagal menyimpan pengaturan.');
      }
      return;
    }

    if (!navigator.geolocation) {
      setPesanGalat('Peramban tidak mendukung fitur lokasi GPS.');
      return;
    }

    setSedangMinta(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lintang = bulatkanLokasi(pos.coords.latitude);
          const bujur = bulatkanLokasi(pos.coords.longitude);
          await mutasi.mutateAsync({
            tampil_di_peta: true,
            lintang,
            bujur,
          });
        } catch {
          setPesanGalat('Gagal menyimpan lokasi ke server.');
        } finally {
          setSedangMinta(false);
        }
      },
      (err) => {
        setSedangMinta(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPesanGalat('Izin lokasi ditolak di peramban.');
        } else {
          setPesanGalat('Gagal membaca sinyal GPS.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  };

  return (
    <Kartu
      judul="Peta pembeli"
      keterangan="Izinkan pembeli terverifikasi di sekitar melihat perkiraan lokasi kebunmu (~1 km) dan stok siap jualmu."
      tingkatJudul={2}
    >
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={aktif}
            disabled={sedangMinta || mutasi.isPending}
            onChange={(e) => tanganiUbahSakelar(e.target.checked)}
            className="h-5 w-5 rounded border-garis text-daun"
          />
          <div className="flex flex-col">
            <span className="font-medium text-teks">Tampilkan saya di peta pembeli</span>
            <span className="text-keterangan text-teks-pendukung">
              Bawaan mati. Titik persis dan nomor HP tidak pernah dibagikan ke peta.
            </span>
          </div>
        </label>
        {sedangMinta ? (
          <p className="m-0 text-keterangan text-tanah">Membaca lokasi GPS perangkat...</p>
        ) : null}
        {pesanGalat ? (
          <p className="m-0 text-keterangan text-tomat">{pesanGalat}</p>
        ) : null}
        {aktif && p.lokasi_kira_lintang != null ? (
          <p className="m-0 text-keterangan text-daun">
            Perkiraan lokasi aktif ({p.lokasi_kira_lintang}, {p.lokasi_kira_bujur}).
          </p>
        ) : null}
      </div>
    </Kartu>
  );
}

function KartuKebun({ p, wilayah }: { p: Pengguna; wilayah: Wilayah | null }) {
  const lahanQ = useLahan();
  const siklusQ = useDaftarSiklus();
  const komoditasQ = useKomoditas();
  const lahan = ringkasLahan(
    (lahanQ.data ?? []).map((l) => ({
      jenis: l.jenis_lahan,
      luasM2: l.luas_m2,
      lubang: l.kapasitas_lubang,
    })),
  );
  const idKomoditas = [...new Set((siklusQ.data ?? []).map((s) => s.komoditas_id))];
  const namaKomoditas = idKomoditas.map(
    (id) => komoditasQ.data?.find((k) => k.id === id)?.nama ?? id,
  );
  return (
    <KartuDaftar judul={t.kebun}>
      <Baris
        label={t.desa}
        nilai={wilayah ? `${wilayah.desa}, Kec. ${wilayah.kecamatan}, ${wilayah.kabupaten}` : '–'}
        bertumpuk
      />
      <Baris
        label={t.luasLahan}
        nilai={
          lahan.jumlah ? t.ringkasLahan(lahan.luasM2, lahan.lubang, lahan.jumlah) : t.belumAdaLahan
        }
        ke="/lahan"
      />
      <Baris
        label={t.komoditas}
        nilai={
          namaKomoditas.length ? (
            <span className="flex flex-wrap gap-2 xl:justify-end">
              {namaKomoditas.map((n) => (
                <LabelKecil key={n} nada="garis">
                  {n}
                </LabelKecil>
              ))}
            </span>
          ) : (
            t.belumMenanam
          )
        }
      />
      <Baris
        label={t.pupukSubsidi}
        nilai={
          p.terdaftar_kelompok_tani ? (
            <LabelKecil nada="hijau" ikon="centang">
              {t.terdaftar}
            </LabelKecil>
          ) : (
            t.belumTerdaftar
          )
        }
        ke="/profil/ubah"
        akhir
      />
    </KartuDaftar>
  );
}

function KartuCatatan() {
  const catatanQ = useCatatanSaya();
  const daftar = catatanQ.data ?? [];
  if (!daftar.length) return null;
  return (
    <Kartu judul={t.catatan} keterangan={t.catatanKet} tingkatJudul={2}>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {daftar.map((c) => (
          <li key={c.id} className="rounded-md bg-matahari-lembut p-3">
            <p className="m-0">{c.isi}</p>
            <p className="m-0 text-keterangan text-teks-pendukung">
              {formatTanggal(c.dibuat_pada.slice(0, 10))}
            </p>
          </li>
        ))}
      </ul>
    </Kartu>
  );
}

function BarisPengingat({ id, nama, akhir }: { id: string; nama: string; akhir: boolean }) {
  const q = usePengingat(id);
  return (
    <Baris
      label={nama}
      nilai={q.data ? t.jadwalPengingat(q.data.jam_pagi, q.data.pengingat_sore) : null}
      bertumpuk
      ke={`/kebun/${encodeURIComponent(id)}/pengingat`}
      akhir={akhir}
    />
  );
}

/** Daftar siklus atau kelompok petak aktif dengan jadwal pengingatnya (Profil dan /profil/notifikasi). */
export function KartuPengingat() {
  const aktifQ = useDaftarSiklus({ status: 'aktif' });
  const nama = useNamaSiklus();
  const unit = kelompokkanSiklus((aktifQ.data ?? []).map(keKelompok));
  return (
    <KartuDaftar judul={t.pengingat} keterangan={t.pengingatKet}>
      {unit.length ? (
        unit.map((u, i) => (
          <BarisPengingat
            key={u.id}
            id={(u.anggota[0] as { id: string }).id}
            nama={nama.unit(u)}
            akhir={i === unit.length - 1}
          />
        ))
      ) : (
        <li className="py-3 text-teks-pendukung">{t.tanpaSiklusAktif}</li>
      )}
    </KartuDaftar>
  );
}

function KartuBantuan() {
  return (
    <KartuDaftar judul={t.bantuan}>
      <Baris label={t.pusatBantuan} ke="/bantuan" />
      <Baris label={t.hubungi} ke="/kontak" />
      <Baris label={t.aturanPrivasi} ke="/aturan-pakai" akhir />
    </KartuDaftar>
  );
}

/** Keluar: POST /auth/keluar, cache kueri dikosongkan, lalu ke /masuk (petani dan pembeli). */
export function TombolKeluar() {
  const { keluar, sedang } = useKeluarSesi();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      disabled={sedang}
      onClick={() => void keluar().then(() => navigate('/masuk', { replace: true }))}
      className="fokus-cincin inline-flex min-h-sentuh cursor-pointer items-center justify-center self-center rounded-md border-0 bg-transparent px-4 font-semibold text-tomat-teks lg:self-start"
    >
      {sedang ? t.mengeluarkan : t.keluar}
    </button>
  );
}

export function HalamanProfil() {
  const { akun } = useSesi();
  const lebar = useLayarLebar();
  const lokasi = useLocation();
  const info = (lokasi.state as { info?: string } | null)?.info ?? null;
  const p = akun?.pengguna;
  const wilayahQ = useWilayahSatu(p?.wilayah_id ?? null);
  if (!p) return null;
  const wilayah = wilayahQ.data ?? null;
  const pesan = info ? (
    <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
      <Ikon nama="centang" ukuran={20} />
      {info}
    </p>
  ) : null;

  const kepala = lebar ? (
    <div className="flex flex-col gap-1">
      <h1 className="m-0 text-judul-halaman font-semibold">{t.judul}</h1>
      <p className="m-0 text-teks-pendukung">{t.sub}</p>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      <Link
        to="/beranda"
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembali}</span>
      </Link>
      <h1 className="m-0 text-judul-halaman font-semibold">{t.judul}</h1>
    </div>
  );

  if (!lebar)
    return (
      <>
        {kepala}
        {pesan}
        <KartuLevelLencana />
        <KartuDiri p={p} wilayah={wilayah} />
        <KartuCatatan />
        <KartuAkun p={p} />
        <KartuPetaPetani p={p} />
        <KartuKebun p={p} wilayah={wilayah} />
        <KartuPengingat />
        <KartuBantuan />
        <TombolKeluar />
      </>
    );
  return (
    <>
      {kepala}
      {pesan}
      <KartuLevelLencana />
      <div className="grid grid-cols-3 items-start gap-6">
        <KartuDiri p={p} wilayah={wilayah} />
        <div className="flex flex-col gap-6">
          <KartuAkun p={p} />
          <KartuPetaPetani p={p} />
          <KartuPengingat />
          <TombolKeluar />
        </div>
        <div className="flex flex-col gap-6">
          <KartuKebun p={p} wilayah={wilayah} />
          <KartuCatatan />
          <KartuBantuan />
        </div>
      </div>
    </>
  );
}
