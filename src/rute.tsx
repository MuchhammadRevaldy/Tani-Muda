import { useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import { HeaderHalaman } from './komponen/navigasi';
import { KerangkaPanel, KerangkaPembeli, KerangkaPetani } from './komponen/kerangka';
import { Galat } from './halaman/galat';
import { TidakDitemukan } from './halaman/tidak-ditemukan';
import { HalamanKomponen } from './halaman/komponen';
import { judulRute, type KunciRute } from './teks/rute';
import { teksUmum } from './teks/umum';

/** Akun sementara sampai sesi tersedia (T4.01). Nama fiktif, sama dengan contoh desain. */
const AKUN_SEMENTARA = { nama: 'Arif Setiawan', keterangan: 'Petani · Lembang' };
const USAHA_SEMENTARA = 'Katering Bu Ratna';

function JudulDokumen({ kunci }: { kunci: KunciRute }) {
  useEffect(() => {
    const judul = judulRute[kunci];
    document.title = kunci === 'landing' ? judul : `${judul} · ${teksUmum.namaAplikasi}`;
  }, [kunci]);
  return null;
}

/** Isi sementara untuk halaman yang belum dibangun (Tahap 4). */
function Sementara({ kunci }: { kunci: KunciRute }) {
  return (
    <>
      <JudulDokumen kunci={kunci} />
      <HeaderHalaman judul={judulRute[kunci]} keterangan={teksUmum.segeraDibangun} />
    </>
  );
}

const petani = (kunci: KunciRute, opsi: { tanpaNav?: boolean } = {}): ReactNode => (
  <KerangkaPetani akun={AKUN_SEMENTARA} tanpaNav={opsi.tanpaNav}>
    <Sementara kunci={kunci} />
  </KerangkaPetani>
);

const pembeli = (kunci: KunciRute): ReactNode => (
  <KerangkaPembeli namaUsaha={USAHA_SEMENTARA}>
    <Sementara kunci={kunci} />
  </KerangkaPembeli>
);

const polos = (kunci: KunciRute): ReactNode => (
  <main className="mx-auto flex max-w-dialog flex-col gap-4 p-4">
    <Sementara kunci={kunci} />
  </main>
);

const panel = (kunci: KunciRute): ReactNode => (
  <KerangkaPanel judul={judulRute[kunci]}>
    <JudulDokumen kunci={kunci} />
    <p className="m-0 text-teks-pendukung">{teksUmum.segeraDibangun}</p>
  </KerangkaPanel>
);

/** Daftar rute. Rute sama dengan tabel di docs/ringkasan-desain.md bagian 3. */
export const daftarRute: RouteObject[] = [
  {
    element: <Outlet />,
    errorElement: <Galat />,
    children: [
      { path: '/', element: polos('landing') },
      { path: '/masuk', element: polos('masuk') },
      {
        path: '/komponen',
        element: (
          <>
            <JudulDokumen kunci="komponen" />
            <HalamanKomponen />
          </>
        ),
      },
      { path: '/beranda', element: petani('beranda') },
      { path: '/hitung/tanaman', element: petani('pilihTanaman', { tanpaNav: true }) },
      { path: '/hitung/metode', element: petani('pilihMetode', { tanpaNav: true }) },
      { path: '/hitung/modal', element: petani('hitungModal', { tanpaNav: true }) },
      { path: '/kebun', element: petani('kebun') },
      { path: '/kebun/:id/jadwal', element: petani('jadwal') },
      { path: '/kebun/:id/modal', element: petani('modal') },
      { path: '/kebun/:id/jurnal', element: petani('jurnal') },
      { path: '/kebun/:id/pengingat', element: petani('pengingat') },
      { path: '/tugas/:id', element: petani('detailTugas') },
      { path: '/tugas/:id/ukur', element: petani('ukur') },
      { path: '/belajar', element: petani('belajar') },
      { path: '/belajar/:id', element: petani('modul') },
      { path: '/pesanan', element: petani('pesanan') },
      { path: '/pesanan/kiriman', element: petani('kirimanSaya') },
      { path: '/pesanan/:id', element: petani('detailPesanan') },
      { path: '/pesanan/:id/kesepakatan', element: petani('kesepakatan') },
      { path: '/profil', element: petani('profil') },
      { path: '/profil/ubah', element: petani('ubahProfil') },
      { path: '/profil/notifikasi', element: petani('pengingat') },
      { path: '/lahan', element: petani('lahan') },
      { path: '/pembeli', element: pembeli('dasborPembeli') },
      { path: '/pembeli/riwayat', element: pembeli('riwayat') },
      { path: '/pembeli/pembayaran', element: pembeli('pembayaran') },
      { path: '/pembeli/pesanan/baru', element: pembeli('buatPesanan') },
      { path: '/pembeli/kiriman/:id', element: pembeli('konfirmasiKiriman') },
      { path: '/admin', element: panel('admin') },
      { path: '/mentor', element: panel('mentor') },
      { path: '*', element: <TidakDitemukan /> },
    ],
  },
];

export const router = createBrowserRouter(daftarRute);
