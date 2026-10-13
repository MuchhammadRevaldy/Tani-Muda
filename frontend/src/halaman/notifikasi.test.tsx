import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { daftarRute } from '../rute';

async function buka(izin: NotificationPermission) {
  vi.stubGlobal('Notification', { permission: izin, requestPermission: vi.fn() });
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  await t.kontrol.masukSebagai('petani-arif');
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider
        router={createMemoryRouter(daftarRute, { initialEntries: ['/profil/notifikasi'] })}
      />
    </PenyediaKlienApi>,
  );
  await screen.findByRole('heading', { level: 1, name: 'Notifikasi' });
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
  it('diizinkan', async () => {
    await buka('granted');
    expect(screen.getByText('Diizinkan')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Izinkan notifikasi' })).toBeNull();
  });
});
