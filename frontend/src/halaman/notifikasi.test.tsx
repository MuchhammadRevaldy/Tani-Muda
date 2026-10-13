import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { daftarRute } from '../rute';

const KET_DIIZINKAN =
  'Pengingat lewat HP aktif di versi berikutnya. Untuk sekarang, tugas hari ini tampil di Beranda.';

async function buka(
  izin: NotificationPermission,
  requestPermission = vi.fn(async (): Promise<NotificationPermission> => izin),
) {
  vi.stubGlobal('Notification', { permission: izin, requestPermission });
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  await t.kontrol.masukSebagai('petani-arif');
  // Langganan push belum tersedia ([AG-21]): halaman tidak boleh memanggilnya.
  const simpan = vi.spyOn(t.klien.notifikasi, 'simpanLangganan');
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider
        router={createMemoryRouter(daftarRute, { initialEntries: ['/profil/notifikasi'] })}
      />
    </PenyediaKlienApi>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Notifikasi' });
  expect(
    screen.getByRole('heading', { name: 'Izin notifikasi di perangkat ini' }),
  ).toBeInTheDocument();
  return { simpan, requestPermission };
}

afterEach(() => vi.unstubAllGlobals());

describe('pusat notifikasi ([AG-19])', () => {
  it('diblokir: petunjuk menyalakan; daftar siklus menuju pengaturan pengingat', async () => {
    await buka('denied');
    expect(screen.getAllByText('Diblokir').length).toBeGreaterThan(0);
    expect(screen.getByText(/Pilih Izin situs, lalu Notifikasi/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Izinkan notifikasi' })).toBeNull();
    const tautan = await screen.findByRole('link', { name: /Sawi hijau · Rak hidroponik teras/ });
    expect(tautan).toHaveAttribute('href', '/kebun/siklus-arif-hidro/pengingat');
    expect(await screen.findByText('Pagi pukul 06.00 · sore mati')).toBeInTheDocument();
  });
  it('belum ditanya: tombol meminta izin', async () => {
    await buka('default');
    expect(screen.getByText('Belum ditanya')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Izinkan notifikasi' })).toBeEnabled();
  });
  it('diizinkan: keterangan pengingat HP di versi berikutnya, tanpa memanggil langganan ([AG-21])', async () => {
    const { simpan } = await buka('granted');
    expect(screen.getByText('Diizinkan')).toBeInTheDocument();
    expect(screen.getByText(KET_DIIZINKAN)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Izinkan notifikasi' })).toBeNull();
    expect(simpan).not.toHaveBeenCalled();
  });
  it('setelah izin diberikan: keterangan yang sama, tanpa memanggil langganan ([AG-21])', async () => {
    const minta = vi.fn(async (): Promise<NotificationPermission> => 'granted');
    const { simpan } = await buka('default', minta);
    expect(screen.queryByText(KET_DIIZINKAN)).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Izinkan notifikasi' }));
    expect(await screen.findByText(KET_DIIZINKAN)).toBeInTheDocument();
    expect(screen.getByText('Diizinkan')).toBeInTheDocument();
    expect(minta).toHaveBeenCalledOnce();
    expect(simpan).not.toHaveBeenCalled();
  });
});
