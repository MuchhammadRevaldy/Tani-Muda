import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from './api/penyedia-klien';
import { buatKlienTiruan } from './api/tiruan/klien-tiruan';
import { daftarRute } from './rute';

/** [alamat, judul h1, pengguna uji yang masuk (null = belum masuk)] */
const jalur = [
  ['/', 'Tani Muda', null],
  ['/masuk', 'Masuk dengan nomor HP', null],
  ['/beranda', /^Selamat (pagi|siang|sore|malam), Arif$/, 'petani-arif'],
  ['/hitung/tanaman', 'Mau tanam apa?', 'petani-arif'],
  ['/kebun/1/jadwal', 'Jadwal', 'petani-arif'],
  ['/tugas/1/ukur', 'Cek pH dan PPM', 'petani-arif'],
  ['/pesanan/1/kesepakatan', 'Periksa kesepakatan', 'petani-arif'],
  ['/lahan', 'Lahan saya', 'petani-arif'],
  ['/pembeli', 'Pesanan aktif', 'pembeli-ratna'],
  ['/pembeli/riwayat', 'Riwayat', 'pembeli-ratna'],
  ['/admin', 'Admin', 'admin-tani'],
] as const;

async function buka(url: string, pengguna: string | null = null) {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  if (pengguna) await t.kontrol.masukSebagai(pengguna);
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={createMemoryRouter(daftarRute, { initialEntries: [url] })} />
    </PenyediaKlienApi>,
  );
}

describe('rute', () => {
  it.each(jalur)('%s menampilkan judul', async (url, judul, pengguna) => {
    await buka(url, pengguna);
    expect(await screen.findByRole('heading', { level: 1, name: judul })).toBeInTheDocument();
  });
  it('rute tak dikenal menampilkan halaman tidak ditemukan', async () => {
    await buka('/tidak-ada');
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke beranda' })).toHaveAttribute(
      'href',
      '/beranda',
    );
  });
  it('halaman petani di HP punya navigasi bawah dan sidebar', async () => {
    await buka('/beranda', 'petani-arif');
    expect(await screen.findAllByRole('navigation', { name: 'Navigasi utama' })).toHaveLength(2);
  });
  it('halaman komponen terbuka', async () => {
    await buka('/komponen');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sistem desain: kebun di pagi hari' }),
    ).toBeInTheDocument();
  });
});
