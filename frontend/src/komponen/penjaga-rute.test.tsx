import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { PenjagaRute, PenjagaTamu, PenjagaTanpaPeran } from './penjaga-rute';

const rute = [
  { path: '/masuk', element: <PenjagaTamu>halaman masuk</PenjagaTamu> },
  { path: '/pilih-peran', element: <PenjagaTanpaPeran>halaman pilih peran</PenjagaTanpaPeran> },
  { path: '/beranda', element: <PenjagaRute peran={['petani']}>halaman petani</PenjagaRute> },
  { path: '/pembeli', element: <PenjagaRute peran={['pembeli']}>halaman pembeli</PenjagaRute> },
  {
    path: '/mentor',
    element: <PenjagaRute peran={['mentor', 'admin']}>halaman mentor</PenjagaRute>,
  },
  { path: '/admin', element: <PenjagaRute peran={['admin']}>halaman admin</PenjagaRute> },
];

async function buka(
  alamat: string,
  masuk?: string | ((t: ReturnType<typeof buatKlienTiruan>) => Promise<void>),
) {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  if (typeof masuk === 'string') await t.kontrol.masukSebagai(masuk);
  else if (masuk) await masuk(t);
  const router = createMemoryRouter(rute, { initialEntries: [alamat] });
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={router} />
    </PenyediaKlienApi>,
  );
  return router;
}

describe('PenjagaRute (T4.01)', () => {
  it('tanpa sesi diarahkan ke /masuk dan halaman asal diingat', async () => {
    const router = await buka('/beranda');
    expect(await screen.findByText('halaman masuk')).toBeInTheDocument();
    expect(router.state.location.state).toEqual({ dari: '/beranda' });
  });

  it('rute petani menolak pembeli: pembeli diarahkan ke halaman pembeli', async () => {
    await buka('/beranda', 'pembeli-ratna');
    expect(await screen.findByText('halaman pembeli')).toBeInTheDocument();
    expect(screen.queryByText('halaman petani')).not.toBeInTheDocument();
  });

  it('rute pembeli menolak petani: petani diarahkan ke beranda', async () => {
    await buka('/pembeli', 'petani-arif');
    expect(await screen.findByText('halaman petani')).toBeInTheDocument();
  });

  it('admin boleh membuka panel mentor; mentor tidak boleh membuka admin', async () => {
    await buka('/mentor', 'admin-tani');
    expect(await screen.findByText('halaman mentor')).toBeInTheDocument();
  });

  it('mentor yang membuka /admin kembali ke panel mentor', async () => {
    await buka('/admin', 'mentor-rahmat');
    expect(await screen.findByText('halaman mentor')).toBeInTheDocument();
  });

  it('pengguna baru tanpa peran diarahkan ke pilih peran; yang sudah berperan tidak bisa membukanya', async () => {
    await buka('/beranda', async (t) => {
      await t.klien.akun.kirimOtp({ nomor_hp: '085700000009' });
      await t.klien.akun.verifikasiOtp({
        nomor_hp: '085700000009',
        kode: t.kontrol.kodeUji('+6285700000009') as string,
        setuju_privasi: true,
      });
    });
    expect(await screen.findByText('halaman pilih peran')).toBeInTheDocument();
  });

  it('pengguna yang sudah masuk tidak melihat halaman masuk', async () => {
    await buka('/pilih-peran', 'petani-arif');
    expect(await screen.findByText('halaman petani')).toBeInTheDocument();
  });
});
