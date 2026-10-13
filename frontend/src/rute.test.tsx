import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from './api/penyedia-klien';
import { buatKlienTiruan } from './api/tiruan/klien-tiruan';
import type { RouteObject } from 'react-router-dom';
import { daftarRute } from './rute';

/** [alamat, judul h1, pengguna uji yang masuk (null = belum masuk)] */
const jalur = [
  ['/', 'Bertani itu bisa untung, asal direncanakan.', null],
  ['/aturan-pakai', 'Aturan pakai', null],
  ['/masuk', 'Masuk dengan nomor HP', null],
  ['/beranda', /^Selamat (pagi|siang|sore|malam), Arif$/, 'petani-arif'],
  ['/hitung/tanaman', 'Mau tanam apa?', 'petani-arif'],
  ['/kebun/siklus-arif-sawi/jadwal', 'Sawi hijau · Kebun belakang rumah', 'petani-arif'],
  [
    `/tugas/${encodeURIComponent('siklus-arif-hidro:ukur-ph-ppm@20')}/ukur`,
    'Cek pH dan PPM',
    'petani-arif',
  ],
  ['/pesanan/1/kesepakatan', 'Periksa kesepakatan', 'petani-arif'],
  ['/lahan', 'Lahan saya', 'petani-arif'],
  ['/profil', 'Profil', 'petani-arif'],
  ['/profil/ubah', 'Ubah profil', 'petani-arif'],
  ['/profil/notifikasi', 'Notifikasi', 'petani-arif'],
  ['/pembeli', 'Pesanan aktif', 'pembeli-ratna'],
  ['/pembeli/riwayat', 'Riwayat', 'pembeli-ratna'],
  ['/pembeli/profil', 'Profil', 'pembeli-ratna'],
  ['/pembeli/profil/ubah', 'Ubah profil', 'pembeli-ratna'],
  ['/admin', 'Verifikasi pembeli', 'admin-tani'],
  ['/mentor', 'Resep tanam', 'mentor-rahmat'],
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
    // Halaman dimuat per rute (D-48), jadi ditunggu.
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sistem desain: kebun di pagi hari' }),
    ).toBeInTheDocument();
  });
  it('tidak ada rute yang menampilkan "Halaman ini sedang dibangun" ([AG-19])', async () => {
    const semua: string[] = [];
    const kumpul = (rute: RouteObject[]) => {
      for (const r of rute) {
        if (r.path && r.path !== '*') semua.push(r.path);
        if (r.children) kumpul(r.children);
      }
    };
    kumpul(daftarRute);
    expect(semua.length).toBeGreaterThan(40);
    const peran = (p: string) =>
      p.startsWith('/pembeli')
        ? 'pembeli-ratna'
        : p.startsWith('/admin')
          ? 'admin-tani'
          : p.startsWith('/mentor')
            ? 'mentor-rahmat'
            : 'petani-arif';
    for (const p of semua) {
      const url = p.replace(/:id/g, 'siklus-arif-sawi');
      await buka(url.startsWith('/') ? url : `/${url}`, peran(url));
      await screen.findAllByRole('heading', { level: 1 }, { timeout: 3000 }).catch(() => []);
      expect(screen.queryByText(/sedang dibangun/i), url).toBeNull();
      cleanup();
    }
  }, 60_000);
});
