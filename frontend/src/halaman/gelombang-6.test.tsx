/**
 * Tes halaman gelombang 6 (T4.30, T4.31, D-43): daftar modul belajar, kemajuan, keadaan baris
 * (selesai, sedang ditonton dari posisi di perangkat), pemutar dengan kontrol berteks Indonesia,
 * tandai selesai, modul berikutnya, dan tautan modul tahap berjalan di Beranda (P0-06).
 * jsdom tidak memutar video dan tidak punya Cache Storage, jadi tombol unduh tidak tampil.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { daftarRute } from '../rute';

async function buka(alamat: string, pengguna = 'petani-arif') {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  await t.kontrol.masukSebagai(pengguna);
  const router = createMemoryRouter(daftarRute, { initialEntries: [alamat] });
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={router} />
    </PenyediaKlienApi>,
  );
  return { t, router };
}

describe('daftar modul (T4.30)', () => {
  it('bawaan dari siklus aktif, kemajuan dan baris selesai/sedang', async () => {
    localStorage.setItem(
      'tani-muda:posisi-modul:petani-arif',
      JSON.stringify({ 'modul-sawi-bedengan-4': { detik: 150, durasi: 240 } }),
    );
    await buka('/belajar');
    expect(
      await screen.findByRole('heading', { name: 'Modul bedengan untuk sawi hijau' }),
    ).toBeInTheDocument();
    expect((await screen.findAllByText('3 dari 6 modul selesai')).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Lanjutkan: Perawatan' }).length).toBeGreaterThan(0);
    const daftar = screen.getByRole('list');
    expect(within(daftar).getByText('Modul 1 · 3 menit · selesai')).toBeInTheDocument();
    expect(within(daftar).getByText('Modul 4 · 4 menit · sisa 2 menit')).toBeInTheDocument();
    expect(within(daftar).getByText('Modul 5 · 3 menit · video menyusul')).toBeInTheDocument();
    expect(within(daftar).queryByRole('button', { name: /^Unduh/ })).not.toBeInTheDocument();
  });

  it('hidroponik hanya untuk sawi (D-05); ganti tanaman lewat pilihan', async () => {
    const { router } = await buka('/belajar?komoditas=sawi&metode=hidroponik');
    expect(
      await screen.findByRole('heading', { name: 'Modul hidroponik untuk sawi hijau' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Bayam' }));
    expect(router.state.location.search).toBe('?komoditas=bayam');
    const cara = await screen.findByRole('group', { name: 'Cara tanam' });
    await waitFor(() =>
      expect(
        within(cara)
          .getAllByRole('button')
          .map((b) => b.textContent),
      ).toEqual(['Bedengan']),
    );
    expect(
      await screen.findByRole('heading', { name: 'Modul bedengan untuk bayam' }),
    ).toBeInTheDocument();
  });
});

describe('pemutar modul (T4.31)', () => {
  it('kontrol berteks Indonesia, tandai selesai, lalu modul berikutnya', async () => {
    const { t } = await buka('/belajar/modul-sawi-bedengan-2');
    expect(await screen.findByRole('heading', { level: 1, name: 'Semai' })).toBeInTheDocument();
    expect(screen.getByText('Modul 2 dari 6 · 4 menit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Putar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mundur 10 detik' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Posisi video' })).toBeInTheDocument();
    expect(screen.getByText('Kualitas rendah (360p), hemat kuota')).toBeInTheDocument();
    // Modul 2 sudah selesai di data contoh.
    expect(screen.getByText('Modul ini sudah selesai')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Modul berikutnya: Tanam' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Modul berikutnya: Tanam' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Tanam' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Modul berikutnya: Perawatan' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Perawatan' })).toBeInTheDocument();
    expect(
      screen.getByText('Video modul ini sedang disiapkan bersama penyuluh.'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tandai selesai' }));
    expect(await screen.findByText('Modul ini sudah selesai')).toBeInTheDocument();
    const modul = await t.klien.belajar.ambilModul('modul-sawi-bedengan-4');
    expect(modul.selesai).toBe(true);
  });
});

describe('Beranda: modul tahap berjalan (P0-06)', () => {
  it('siklus sawi hari ke-13 menautkan modul Perawatan', async () => {
    await buka('/beranda?siklus=siklus-arif-sawi');
    const tautan = await screen.findByRole('link', { name: /^Tahap sekarang/ });
    expect(tautan).toHaveTextContent('Perawatan · tonton 4 menit');
    expect(tautan).toHaveAttribute('href', '/belajar/modul-sawi-bedengan-4');
  });
});
