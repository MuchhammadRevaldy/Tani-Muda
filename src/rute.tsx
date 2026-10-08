import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import type { MenuPetani } from './komponen/navigasi';
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
import { HalamanBelajar } from './halaman/belajar';
import { HalamanModul } from './halaman/belajar/modul';
import { HalamanKalkulator } from './halaman/hitung/kalkulator';
import { HalamanPilihMetode } from './halaman/hitung/pilih-metode';
import { HalamanPilihTanaman } from './halaman/hitung/pilih-tanaman';
import { HalamanPilihTanggalTanam } from './halaman/hitung/pilih-tanggal-tanam';
import { PenyediaRencana } from './halaman/hitung/use-rencana';
import { HalamanLahanSaya } from './halaman/lahan-saya';
import { HalamanAkhirSiklus } from './halaman/kebun/akhir-siklus';
import { HalamanKebun } from './halaman/kebun/daftar-siklus';
import { HalamanDetailTugas } from './halaman/kebun/detail-tugas';
import { HalamanJadwal } from './halaman/kebun/jadwal';
import { HalamanJurnal } from './halaman/kebun/jurnal';
import { HalamanModalSiklus } from './halaman/kebun/modal';
import { HalamanPengingat } from './halaman/kebun/pengingat';
import { HalamanUbahTanggalTanam } from './halaman/kebun/ubah-tanggal-tanam';
import { HalamanUkur } from './halaman/kebun/ukur-ph-ppm';
import { Memuat } from './halaman/memuat';
import { HalamanDetailPesanan } from './halaman/pesanan/detail-pesanan';
import { HalamanKesepakatan } from './halaman/pesanan/kesepakatan';
import { HalamanLaporGagal } from './halaman/pesanan/lapor-gagal';
import { HalamanBayar } from './halaman/pembeli/bayar';
import { HalamanBuatPesanan } from './halaman/pembeli/buat-pesanan';
import { HalamanDaftarPembeli } from './halaman/pembeli/daftar-pembeli';
import { HalamanDasborPembeli } from './halaman/pembeli/dasbor';
import { HalamanKonfirmasiKiriman } from './halaman/pembeli/konfirmasi-kiriman';
import { HalamanPembayaran } from './halaman/pembeli/pembayaran';
import { HalamanRiwayat } from './halaman/pembeli/riwayat';
import { HalamanKirimanSaya } from './halaman/pesanan/kiriman-saya';
import { HalamanPesananSekitar } from './halaman/pesanan/sekitar';
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
  opsi: { tanpaNav?: boolean; menuAktif?: MenuPetani } = {},
): ReactNode => (
  <PenjagaRute peran={['petani']}>
    <KerangkaPetaniSesi tanpaNav={opsi.tanpaNav} menuAktif={opsi.menuAktif}>
      <JudulDokumen kunci={kunci} />
      {isi}
    </KerangkaPetaniSesi>
  </PenjagaRute>
);
const petani = (kunci: KunciRute, opsi: { tanpaNav?: boolean } = {}): ReactNode =>
  halamanPetani(kunci, <Sementara kunci={kunci} />, opsi);

const hitung = (kunci: KunciRute, isi: ReactNode): ReactNode =>
  halamanPetani(kunci, isi, { tanpaNav: true, menuAktif: 'kebun' });

const pembeli = (kunci: KunciRute, isi: ReactNode = <Sementara kunci={kunci} />): ReactNode => (
  <PenjagaRute peran={['pembeli']}>
    <KerangkaPembeliSesi>
      <JudulDokumen kunci={kunci} />
      {isi}
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
      {
        // Alur Hitung: suntingan rencana bertahan saat pindah langkah (T4.05–T4.08).
        path: '/hitung',
        element: (
          <PenyediaRencana>
            <Outlet />
          </PenyediaRencana>
        ),
        children: [
          { path: 'tanaman', element: hitung('pilihTanaman', <HalamanPilihTanaman />) },
          { path: 'metode', element: hitung('pilihMetode', <HalamanPilihMetode />) },
          { path: 'modal', element: hitung('hitungModal', <HalamanKalkulator />) },
          { path: 'simpan', element: hitung('simpanRencana', <HalamanPilihTanggalTanam />) },
        ],
      },
      { path: '/kebun', element: halamanPetani('kebun', <HalamanKebun />) },
      { path: '/kebun/:id/jadwal', element: halamanPetani('jadwal', <HalamanJadwal />) },
      { path: '/kebun/:id/modal', element: halamanPetani('modal', <HalamanModalSiklus />) },
      { path: '/kebun/:id/jurnal', element: halamanPetani('jurnal', <HalamanJurnal />) },
      { path: '/kebun/:id/pengingat', element: halamanPetani('pengingat', <HalamanPengingat />) },
      {
        path: '/kebun/:id/tanggal-tanam',
        element: halamanPetani('ubahTanggalTanam', <HalamanUbahTanggalTanam />),
      },
      { path: '/kebun/:id/akhir', element: halamanPetani('akhirSiklus', <HalamanAkhirSiklus />) },
      {
        path: '/tugas/:id',
        element: halamanPetani('detailTugas', <HalamanDetailTugas />, { menuAktif: 'kebun' }),
      },
      {
        path: '/tugas/:id/ukur',
        element: halamanPetani('ukur', <HalamanUkur />, { menuAktif: 'kebun' }),
      },
      { path: '/belajar', element: halamanPetani('belajar', <HalamanBelajar />) },
      {
        path: '/belajar/:id',
        element: halamanPetani('modul', <HalamanModul />, { menuAktif: 'belajar' }),
      },
      { path: '/pesanan', element: halamanPetani('pesanan', <HalamanPesananSekitar />) },
      {
        path: '/pesanan/kiriman',
        element: halamanPetani('kirimanSaya', <HalamanKirimanSaya />),
      },
      {
        path: '/pesanan/kiriman/:id/gagal',
        element: halamanPetani('laporGagal', <HalamanLaporGagal />, { menuAktif: 'pesanan' }),
      },
      {
        path: '/pesanan/:id',
        element: halamanPetani('detailPesanan', <HalamanDetailPesanan />, { menuAktif: 'pesanan' }),
      },
      {
        path: '/pesanan/:id/kesepakatan',
        element: halamanPetani('kesepakatan', <HalamanKesepakatan />, { menuAktif: 'pesanan' }),
      },
      { path: '/profil', element: petani('profil') },
      { path: '/profil/ubah', element: petani('ubahProfil') },
      { path: '/profil/notifikasi', element: petani('pengingat') },
      { path: '/lahan', element: halamanPetani('lahan', <HalamanLahanSaya />) },
      { path: '/pembeli', element: pembeli('dasborPembeli', <HalamanDasborPembeli />) },
      { path: '/pembeli/daftar', element: pembeli('daftarPembeli', <HalamanDaftarPembeli />) },
      { path: '/pembeli/riwayat', element: pembeli('riwayat', <HalamanRiwayat />) },
      { path: '/pembeli/pembayaran', element: pembeli('pembayaran', <HalamanPembayaran />) },
      { path: '/pembeli/pesanan/baru', element: pembeli('buatPesanan', <HalamanBuatPesanan />) },
      { path: '/pembeli/pesanan/:id/bayar', element: pembeli('bayarUangMuka', <HalamanBayar />) },
      {
        path: '/pembeli/kiriman/:id',
        element: pembeli('konfirmasiKiriman', <HalamanKonfirmasiKiriman />),
      },
      { path: '/admin', element: panel('admin', 'admin') },
      { path: '/mentor', element: panel('mentor', 'mentor') },
      { path: '*', element: <TidakDitemukan /> },
    ],
  },
];

export const router = createBrowserRouter(daftarRute);
