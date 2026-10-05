import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import { HeaderHalaman } from './komponen/navigasi';
import { KerangkaPanel } from './komponen/kerangka';
import { KerangkaPembeliSesi, KerangkaPetaniSesi } from './komponen/kerangka-sesi';
import { PenjagaRute, PenjagaTamu, PenjagaTanpaPeran } from './komponen/penjaga-rute';
import { Galat } from './halaman/galat';
import { TidakDitemukan } from './halaman/tidak-ditemukan';
import { HalamanKomponen } from './halaman/komponen';
import { HalamanMasuk } from './halaman/masuk';
import { HalamanPilihPeran } from './halaman/pilih-peran';
import { HalamanBeranda } from './halaman/beranda';
import { Memuat } from './halaman/memuat';
import { judulRute, type KunciRute } from './teks/rute';
import { teksUmum } from './teks/umum';

/**
 * Pemilih akun demo hanya ada di mode pengembangan (D-36). Di build produksi cabang ini dibuang
 * Vite, sehingga modulnya tidak ikut dibundel (dicek scripts/cek-build.mjs).
 */
const HalamanPilihAkunDemo = import.meta.env.DEV
  ? lazy(() => import('./halaman/pilih-akun-demo'))
  : null;

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

const halamanPetani = (
  kunci: KunciRute,
  isi: ReactNode = <Sementara kunci={kunci} />,
  opsi: { tanpaNav?: boolean } = {},
): ReactNode => (
  <PenjagaRute peran={['petani']}>
    <KerangkaPetaniSesi tanpaNav={opsi.tanpaNav}>
      <JudulDokumen kunci={kunci} />
      {isi}
    </KerangkaPetaniSesi>
  </PenjagaRute>
);
const petani = (kunci: KunciRute, opsi: { tanpaNav?: boolean } = {}): ReactNode =>
  halamanPetani(kunci, <Sementara kunci={kunci} />, opsi);

const pembeli = (kunci: KunciRute): ReactNode => (
  <PenjagaRute peran={['pembeli']}>
    <KerangkaPembeliSesi>
      <Sementara kunci={kunci} />
    </KerangkaPembeliSesi>
  </PenjagaRute>
);

const polos = (kunci: KunciRute): ReactNode => (
  <main className="mx-auto flex max-w-dialog flex-col gap-4 p-4">
    <Sementara kunci={kunci} />
  </main>
);

const panel = (kunci: KunciRute, peran: 'admin' | 'mentor'): ReactNode => (
  <PenjagaRute peran={peran === 'mentor' ? ['mentor', 'admin'] : ['admin']}>
    <KerangkaPanel judul={judulRute[kunci]}>
      <JudulDokumen kunci={kunci} />
      <p className="m-0 text-teks-pendukung">{teksUmum.segeraDibangun}</p>
    </KerangkaPanel>
  </PenjagaRute>
);

/** Daftar rute. Rute sama dengan tabel di docs/ringkasan-desain.md bagian 3. */
export const daftarRute: RouteObject[] = [
  {
    element: <Outlet />,
    errorElement: <Galat />,
    children: [
      { path: '/', element: polos('landing') },
      {
        path: '/masuk',
        element: (
          <PenjagaTamu>
            <JudulDokumen kunci="masuk" />
            <HalamanMasuk />
          </PenjagaTamu>
        ),
      },
      {
        path: '/pilih-peran',
        element: (
          <PenjagaTanpaPeran>
            <JudulDokumen kunci="pilihPeran" />
            <HalamanPilihPeran />
          </PenjagaTanpaPeran>
        ),
      },
      ...(HalamanPilihAkunDemo
        ? [
            {
              path: '/akun-demo',
              element: (
                <Suspense fallback={<Memuat />}>
                  <JudulDokumen kunci="akunDemo" />
                  <HalamanPilihAkunDemo />
                </Suspense>
              ),
            },
          ]
        : []),
      { path: '/aturan-pakai', element: polos('aturanPakai') },
      {
        path: '/komponen',
        element: (
          <>
            <JudulDokumen kunci="komponen" />
            <HalamanKomponen />
          </>
        ),
      },
      { path: '/beranda', element: halamanPetani('beranda', <HalamanBeranda />) },
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
      { path: '/admin', element: panel('admin', 'admin') },
      { path: '/mentor', element: panel('mentor', 'mentor') },
      { path: '*', element: <TidakDitemukan /> },
    ],
  },
];

export const router = createBrowserRouter(daftarRute);
