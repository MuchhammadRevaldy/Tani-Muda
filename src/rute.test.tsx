import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { daftarRute } from './rute';

const jalur = [
  ['/', 'Tani Muda'],
  ['/masuk', 'Masuk'],
  ['/beranda', 'Beranda'],
  ['/hitung/tanaman', 'Mau tanam apa?'],
  ['/kebun/1/jadwal', 'Jadwal'],
  ['/tugas/1/ukur', 'Cek pH dan PPM'],
  ['/pesanan/1/kesepakatan', 'Periksa kesepakatan'],
  ['/lahan', 'Lahan saya'],
  ['/pembeli', 'Pesanan aktif'],
  ['/pembeli/riwayat', 'Riwayat'],
  ['/admin', 'Admin'],
] as const;

function buka(url: string) {
  render(<RouterProvider router={createMemoryRouter(daftarRute, { initialEntries: [url] })} />);
}

describe('rute', () => {
  it.each(jalur)('%s menampilkan judul', (url, judul) => {
    buka(url);
    expect(screen.getByRole('heading', { level: 1, name: judul })).toBeInTheDocument();
  });
  it('rute tak dikenal menampilkan halaman tidak ditemukan', () => {
    buka('/tidak-ada');
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke beranda' })).toHaveAttribute(
      'href',
      '/beranda',
    );
  });
  it('halaman petani di HP punya navigasi bawah dan sidebar', () => {
    buka('/beranda');
    expect(screen.getAllByRole('navigation', { name: 'Navigasi utama' })).toHaveLength(2);
  });
  it('halaman komponen terbuka', () => {
    buka('/komponen');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sistem desain: kebun di pagi hari' }),
    ).toBeInTheDocument();
  });
});
