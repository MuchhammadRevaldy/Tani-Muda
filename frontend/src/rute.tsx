import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import type { MenuPetani } from './komponen/navigasi';
import { KerangkaPembeliSesi, KerangkaPetaniSesi } from './komponen/kerangka-sesi';
import { PenjagaRute, PenjagaTamu, PenjagaTanpaPeran } from './komponen/penjaga-rute';
import { Galat } from './halaman/galat';
import { TidakDitemukan } from './halaman/tidak-ditemukan';
import { PenyediaRencana } from './halaman/hitung/konteks-rencana';
import { Memuat } from './halaman/memuat';
import { judulRute, type KunciRute } from './teks/rute';
import { teksUmum } from './teks/umum';

/**
 * Halaman dimuat per rute (P-22, D-48): JavaScript halaman pertama tetap kecil, halaman lain
 * diunduh saat dibuka. Kerangka petani, pembeli, dan panel tetap tampil selama halaman dimuat.
 */
const HalamanKomponen = lazy(() =>
  import('./halaman/komponen').then((m) => ({ default: m.HalamanKomponen })),
);
const HalamanDaftarPetaniAdmin = lazy(() =>
  import('./halaman/admin/petani').then((m) => ({ default: m.HalamanDaftarPetaniAdmin })),
);
const HalamanPetaniAdmin = lazy(() =>
  import('./halaman/admin/petani').then((m) => ({ default: m.HalamanPetaniAdmin })),
);
const HalamanSengketa = lazy(() =>
  import('./halaman/admin/sengketa').then((m) => ({ default: m.HalamanSengketa })),
);
const HalamanVerifikasiPembeli = lazy(() =>
  import('./halaman/admin/verifikasi-pembeli').then((m) => ({
    default: m.HalamanVerifikasiPembeli,
  })),
);
const HalamanLanding = lazy(() =>
  import('./halaman/landing').then((m) => ({ default: m.HalamanLanding })),
);
const HalamanDaftarResep = lazy(() =>
  import('./halaman/mentor/daftar-resep').then((m) => ({ default: m.HalamanDaftarResep })),
);
const HalamanEditorResep = lazy(() =>
  import('./halaman/mentor/editor-resep').then((m) => ({ default: m.HalamanEditorResep })),
);
const HalamanPermintaanResep = lazy(() =>
  import('./halaman/mentor/permintaan-resep').then((m) => ({ default: m.HalamanPermintaanResep })),
);
const HalamanMasuk = lazy(() =>
  import('./halaman/masuk').then((m) => ({ default: m.HalamanMasuk })),
);
const HalamanProfil = lazy(() =>
  import('./halaman/profil').then((m) => ({ default: m.HalamanProfil })),
);
const HalamanProfilPembeli = lazy(() =>
  import('./halaman/pembeli/profil').then((m) => ({ default: m.HalamanProfilPembeli })),
);
const HalamanNotifikasi = lazy(() =>
  import('./halaman/notifikasi').then((m) => ({ default: m.HalamanNotifikasi })),
);
const HalamanStatis = lazy(() =>
  import('./halaman/statis/halaman-statis').then((m) => ({ default: m.HalamanStatis })),
);
const HalamanUbahProfil = lazy(() =>
  import('./halaman/ubah-profil').then((m) => ({ default: m.HalamanUbahProfil })),
);
const HalamanPilihPeran = lazy(() =>
  import('./halaman/pilih-peran').then((m) => ({ default: m.HalamanPilihPeran })),
);
const HalamanBeranda = lazy(() =>
  import('./halaman/beranda').then((m) => ({ default: m.HalamanBeranda })),
);
const HalamanBelajar = lazy(() =>
  import('./halaman/belajar').then((m) => ({ default: m.HalamanBelajar })),
);
const HalamanModul = lazy(() =>
  import('./halaman/belajar/modul').then((m) => ({ default: m.HalamanModul })),
);
const HalamanKalkulator = lazy(() =>
  import('./halaman/hitung/kalkulator').then((m) => ({ default: m.HalamanKalkulator })),
);
const HalamanPilihMetode = lazy(() =>
  import('./halaman/hitung/pilih-metode').then((m) => ({ default: m.HalamanPilihMetode })),
);
const HalamanPilihTanaman = lazy(() =>
  import('./halaman/hitung/pilih-tanaman').then((m) => ({ default: m.HalamanPilihTanaman })),
);
const HalamanPilihTanggalTanam = lazy(() =>
  import('./halaman/hitung/pilih-tanggal-tanam').then((m) => ({
    default: m.HalamanPilihTanggalTanam,
  })),
);
const HalamanLahanSaya = lazy(() =>
  import('./halaman/lahan-saya').then((m) => ({ default: m.HalamanLahanSaya })),
);
const HalamanAkhirSiklus = lazy(() =>
  import('./halaman/kebun/akhir-siklus').then((m) => ({ default: m.HalamanAkhirSiklus })),
);
const HalamanKebun = lazy(() =>
  import('./halaman/kebun/daftar-siklus').then((m) => ({ default: m.HalamanKebun })),
);
const HalamanDetailTugas = lazy(() =>
  import('./halaman/kebun/detail-tugas').then((m) => ({ default: m.HalamanDetailTugas })),
);
const HalamanJadwal = lazy(() =>
  import('./halaman/kebun/jadwal').then((m) => ({ default: m.HalamanJadwal })),
);
const HalamanJurnal = lazy(() =>
  import('./halaman/kebun/jurnal').then((m) => ({ default: m.HalamanJurnal })),
);
const HalamanModalSiklus = lazy(() =>
  import('./halaman/kebun/modal').then((m) => ({ default: m.HalamanModalSiklus })),
);
const HalamanPengingat = lazy(() =>
  import('./halaman/kebun/pengingat').then((m) => ({ default: m.HalamanPengingat })),
);
const HalamanUbahTanggalTanam = lazy(() =>
  import('./halaman/kebun/ubah-tanggal-tanam').then((m) => ({
    default: m.HalamanUbahTanggalTanam,
  })),
);
const HalamanUkur = lazy(() =>
  import('./halaman/kebun/ukur-ph-ppm').then((m) => ({ default: m.HalamanUkur })),
);
const HalamanDetailPesanan = lazy(() =>
  import('./halaman/pesanan/detail-pesanan').then((m) => ({ default: m.HalamanDetailPesanan })),
);
const HalamanKesepakatan = lazy(() =>
  import('./halaman/pesanan/kesepakatan').then((m) => ({ default: m.HalamanKesepakatan })),
);
const HalamanLaporGagal = lazy(() =>
  import('./halaman/pesanan/lapor-gagal').then((m) => ({ default: m.HalamanLaporGagal })),
);
const HalamanBayar = lazy(() =>
  import('./halaman/pembeli/bayar').then((m) => ({ default: m.HalamanBayar })),
);
const HalamanBuatPesanan = lazy(() =>
  import('./halaman/pembeli/buat-pesanan').then((m) => ({ default: m.HalamanBuatPesanan })),
);
const HalamanDaftarPembeli = lazy(() =>
  import('./halaman/pembeli/daftar-pembeli').then((m) => ({ default: m.HalamanDaftarPembeli })),
);
const HalamanDasborPembeli = lazy(() =>
  import('./halaman/pembeli/dasbor').then((m) => ({ default: m.HalamanDasborPembeli })),
);
const HalamanKonfirmasiKiriman = lazy(() =>
  import('./halaman/pembeli/konfirmasi-kiriman').then((m) => ({
    default: m.HalamanKonfirmasiKiriman,
  })),
);
const HalamanPembayaran = lazy(() =>
  import('./halaman/pembeli/pembayaran').then((m) => ({ default: m.HalamanPembayaran })),
);
const HalamanRiwayat = lazy(() =>
  import('./halaman/pembeli/riwayat').then((m) => ({ default: m.HalamanRiwayat })),
);
const HalamanKirimanSaya = lazy(() =>
  import('./halaman/pesanan/kiriman-saya').then((m) => ({ default: m.HalamanKirimanSaya })),
);
const HalamanPesananSekitar = lazy(() =>
  import('./halaman/pesanan/sekitar').then((m) => ({ default: m.HalamanPesananSekitar })),
);
const HalamanStokPetani = lazy(() =>
  import('./halaman/stok/petani-stok').then((m) => ({ default: m.HalamanStokPetani })),
);
const HalamanStokPembeli = lazy(() =>
  import('./halaman/stok/pembeli-stok').then((m) => ({ default: m.HalamanStokPembeli })),
);
const HalamanPetaPetani = lazy(() =>
  import('./halaman/peta/peta-petani').then((m) => ({ default: m.HalamanPetaPetani })),
);

/**
 * Pemilih akun demo hanya ada di mode pengembangan dan build demo (D-36, D-48). Di build produksi
 * cabang ini dibuang Vite, sehingga modulnya tidak ikut dibundel (dicek scripts/cek-build.mjs).
 */
const HalamanPilihAkunDemo =
  import.meta.env.DEV || import.meta.env.MODE === 'demo'
    ? lazy(() => import('./halaman/pilih-akun-demo'))
    : null;

function JudulDokumen({ kunci }: { kunci: KunciRute }) {
  useEffect(() => {
    const judul = judulRute[kunci];
    document.title = kunci === 'landing' ? judul : `${judul} · ${teksUmum.namaAplikasi}`;
  }, [kunci]);
  return null;
}

const halamanPetani = (
  kunci: KunciRute,
  isi: ReactNode,
  opsi: { tanpaNav?: boolean; menuAktif?: MenuPetani } = {},
): ReactNode => (
  <PenjagaRute peran={['petani']}>
    <KerangkaPetaniSesi tanpaNav={opsi.tanpaNav} menuAktif={opsi.menuAktif}>
      <JudulDokumen kunci={kunci} />
      <Suspense fallback={<Memuat />}>{isi}</Suspense>
    </KerangkaPetaniSesi>
  </PenjagaRute>
);
const hitung = (kunci: KunciRute, isi: ReactNode): ReactNode =>
  halamanPetani(kunci, isi, { tanpaNav: true, menuAktif: 'kebun' });

const pembeli = (kunci: KunciRute, isi: ReactNode): ReactNode => (
  <PenjagaRute peran={['pembeli']}>
    <KerangkaPembeliSesi>
      <JudulDokumen kunci={kunci} />
      <Suspense fallback={<Memuat />}>{isi}</Suspense>
    </KerangkaPembeliSesi>
  </PenjagaRute>
);

/** Halaman statis terbuka tanpa masuk (T4.37). */
const statis = (kunci: 'aturanPakai' | 'privasi' | 'tentang' | 'kontak' | 'bantuan'): ReactNode => (
  <>
    <JudulDokumen kunci={kunci} />
    <HalamanStatis jenis={kunci} />
  </>
);

/** Panel admin dan mentor (T4.29, T4.38, T4.39): desktop saja, admin juga boleh membuka panel mentor. */
const panel = (kunci: KunciRute, peran: 'admin' | 'mentor', isi: ReactNode): ReactNode => (
  <PenjagaRute peran={peran === 'mentor' ? ['mentor', 'admin'] : ['admin']}>
    <JudulDokumen kunci={kunci} />
    {isi}
  </PenjagaRute>
);

/** Daftar rute. Rute sama dengan tabel di docs/ringkasan-desain.md bagian 3. */
export const daftarRute: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<Memuat />}>
        <Outlet />
      </Suspense>
    ),
    errorElement: <Galat />,
    children: [
      {
        path: '/',
        element: (
          <>
            <JudulDokumen kunci="landing" />
            <HalamanLanding />
          </>
        ),
      },
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
      { path: '/aturan-pakai', element: statis('aturanPakai') },
      { path: '/privasi', element: statis('privasi') },
      { path: '/tentang', element: statis('tentang') },
      { path: '/kontak', element: statis('kontak') },
      { path: '/bantuan', element: statis('bantuan') },
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
      { path: '/stok', element: halamanPetani('stokSaya', <HalamanStokPetani />, { menuAktif: 'pesanan' }) },
      { path: '/pesanan/stok', element: halamanPetani('stokSaya', <HalamanStokPetani />, { menuAktif: 'pesanan' }) },
      { path: '/profil', element: halamanPetani('profil', <HalamanProfil />) },
      { path: '/profil/ubah', element: halamanPetani('ubahProfil', <HalamanUbahProfil />) },
      { path: '/profil/notifikasi', element: halamanPetani('notifikasi', <HalamanNotifikasi />) },
      { path: '/lahan', element: halamanPetani('lahan', <HalamanLahanSaya />) },
      { path: '/pembeli', element: pembeli('dasborPembeli', <HalamanDasborPembeli />) },
      { path: '/pembeli/stok', element: pembeli('stokSekitar', <HalamanStokPembeli />) },
      { path: '/pembeli/peta', element: pembeli('petaPetani', <HalamanPetaPetani />) },
      { path: '/pembeli/daftar', element: pembeli('daftarPembeli', <HalamanDaftarPembeli />) },
      { path: '/pembeli/riwayat', element: pembeli('riwayat', <HalamanRiwayat />) },
      { path: '/pembeli/pembayaran', element: pembeli('pembayaran', <HalamanPembayaran />) },
      { path: '/pembeli/profil', element: pembeli('profilPembeli', <HalamanProfilPembeli />) },
      {
        path: '/pembeli/profil/ubah',
        element: pembeli('ubahProfilPembeli', <HalamanUbahProfil varian="pembeli" />),
      },
      { path: '/pembeli/pesanan/baru', element: pembeli('buatPesanan', <HalamanBuatPesanan />) },
      { path: '/pembeli/pesanan/:id/bayar', element: pembeli('bayarUangMuka', <HalamanBayar />) },
      {
        path: '/pembeli/kiriman/:id',
        element: pembeli('konfirmasiKiriman', <HalamanKonfirmasiKiriman />),
      },
      { path: '/admin', element: panel('admin', 'admin', <HalamanVerifikasiPembeli />) },
      { path: '/admin/sengketa', element: panel('sengketa', 'admin', <HalamanSengketa />) },
      {
        path: '/admin/petani',
        element: panel('petaniAdmin', 'admin', <HalamanDaftarPetaniAdmin />),
      },
      { path: '/admin/petani/:id', element: panel('petaniAdmin', 'admin', <HalamanPetaniAdmin />) },
      { path: '/mentor', element: panel('mentor', 'mentor', <HalamanDaftarResep />) },
      {
        path: '/mentor/permintaan',
        element: panel('permintaanResep', 'mentor', <HalamanPermintaanResep />),
      },
      {
        path: '/mentor/resep/:id',
        element: panel('editorResep', 'mentor', <HalamanEditorResep />),
      },
      { path: '*', element: <TidakDitemukan /> },
    ],
  },
];

export const router = createBrowserRouter(daftarRute);
