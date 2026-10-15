import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { animasiMati } from '../lib/gerak';
import { daftarRute } from '../rute';
import { Memuat } from './memuat';

/* Menu akun dan profil pembeli ([AG-23]); sakelar animasi. */

async function buka(url: string) {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  await t.kontrol.masukSebagai('pembeli-ratna');
  const router = createMemoryRouter(daftarRute, { initialEntries: [url] });
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={router} />
    </PenyediaKlienApi>,
  );
  return { t, router };
}

afterEach(() => document.documentElement.classList.remove('tanpa-animasi'));

describe('menu akun pembeli', () => {
  it('Profil, Riwayat, Keluar; Esc menutup dan fokus kembali ke tombol', async () => {
    await buka('/pembeli');
    const tombol = await screen.findByRole('button', { name: 'Menu akun Katering Bu Ratna' });
    expect(tombol).toHaveAttribute('aria-haspopup', 'menu');
    expect(tombol).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(tombol);
    const menu = screen.getByRole('menu', { name: 'Menu akun' });
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((m) => m.textContent),
    ).toEqual(['Profil', 'Pembayaran', 'Riwayat', 'Keluar']);
    expect(within(menu).getByRole('menuitem', { name: 'Profil' })).toHaveAttribute(
      'href',
      '/pembeli/profil',
    );
    expect(within(menu).getByRole('menuitem', { name: 'Pembayaran' })).toHaveAttribute(
      'href',
      '/pembeli/pembayaran',
    );
    expect(within(menu).getByRole('menuitem', { name: 'Riwayat' })).toHaveAttribute(
      'href',
      '/pembeli/riwayat',
    );
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(tombol).toHaveFocus();
  });
  it('Keluar mengakhiri sesi lalu ke /masuk', async () => {
    const { t, router } = await buka('/pembeli');
    await userEvent.click(await screen.findByRole('button', { name: /^Menu akun/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Keluar' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/masuk'));
    // Sesi berakhir: tidak ada akun yang masuk lagi.
    expect(await t.klien.akun.ambil()).toBeNull();
  });
});

describe('profil pembeli', () => {
  it('kartu Akun dengan nomor tersamar, Data usaha dengan status, dan tautan ubah', async () => {
    await buka('/pembeli/profil');
    expect(await screen.findByRole('heading', { level: 1, name: 'Profil' })).toBeInTheDocument();
    expect(screen.getByText('Atur akun dan data usaha Anda.')).toBeInTheDocument();
    expect(screen.getByText(/^08\d\d••••\d{4}$/)).toBeInTheDocument();
    expect(await screen.findByText('Terverifikasi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ubah profil' })).toHaveAttribute(
      'href',
      '/pembeli/profil/ubah',
    );
    expect(screen.getByRole('link', { name: 'Ubah data usaha' })).toHaveAttribute(
      'href',
      '/pembeli/daftar',
    );
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
  });
  it('ubah profil pembeli tanpa desa dan kelompok tani; simpan nama kembali ke profil', async () => {
    const { router } = await buka('/pembeli/profil/ubah');
    const nama = await screen.findByLabelText('Nama lengkap');
    expect(screen.queryByText('Desa atau kelurahan')).toBeNull();
    expect(screen.queryByText('Saya terdaftar di kelompok tani')).toBeNull();
    await userEvent.clear(nama);
    await userEvent.type(nama, 'Ratna Kusuma Uji');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/pembeli/profil'));
    expect(await screen.findByText('Ratna Kusuma Uji')).toBeInTheDocument();
  });
});

describe('sakelar animasi', () => {
  it('kelas tanpa-animasi: Memuat memakai teks biasa, bukan tunas beranimasi', () => {
    expect(animasiMati()).toBe(false);
    document.documentElement.classList.add('tanpa-animasi');
    expect(animasiMati()).toBe(true);
    render(<Memuat />);
    expect(screen.getByRole('status')).toHaveTextContent('Sedang memuat');
    expect(screen.getByRole('status').querySelector('img')).toBeNull();
  });
});
