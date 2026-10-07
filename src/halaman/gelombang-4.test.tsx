/**
 * Tes halaman gelombang 4 (T4.18–T4.21, D-13, D-37, D-39): Pesanan di sekitar, lencana menu
 * Pesanan, detail dan ambil sebagian, kesepakatan, Kiriman saya. Terhadap rute aplikasi dan klien
 * tiruan sungguhan. jsdom tanpa matchMedia → tata letak HP.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { tanggalLokal, utcDariLokal, ZONA_BAWAAN } from '../lib/zona-waktu';
import { daftarRute } from '../rute';

type Tiruan = ReturnType<typeof buatKlienTiruan>;
const hariIni = () => tanggalLokal(Date.now());
/** Pagi hari ini: kiriman ke-3 Imas (dikirim 07.00, batas periksa 13.00) masih menunggu konfirmasi. */
const pagi = () => Date.parse(utcDariLokal(hariIni(), 8, 30, ZONA_BAWAAN));

async function buka(
  alamat: string,
  pengguna = 'petani-arif',
  opsi: { siapkan?: (t: Tiruan) => Promise<void>; resepContoh?: boolean; jam?: number } = {},
) {
  const t = buatKlienTiruan({
    tampilkanResepContoh: opsi.resepContoh ?? true,
    kv: null,
    ...(opsi.jam ? { jam: () => opsi.jam as number } : {}),
  });
  await t.kontrol.masukSebagai(pengguna);
  await opsi.siapkan?.(t);
  const router = createMemoryRouter(daftarRute, { initialEntries: [alamat] });
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={router} />
    </PenyediaKlienApi>,
  );
  return { t, router };
}

beforeEach(() => {
  localStorage.clear();
});

describe('Pesanan di sekitar (T4.18)', () => {
  it('terdekat dulu, penanda jenis, sudah diambil, dan filter Sekali panen', async () => {
    const { router } = await buka('/pesanan');
    const daftar = await screen.findByRole('list');
    const kartu = within(daftar).getAllByRole('link');
    expect(kartu.map((a) => a.textContent)).toEqual([
      expect.stringContaining('Katering Bu Ratna'),
      expect.stringContaining('Koperasi'),
      expect.stringContaining('Kafe'),
    ]);
    expect(kartu[0]).toHaveTextContent('Kamu sudah mengambil 10 kg per minggu');
    expect(kartu[1]).toHaveTextContent('Sekali panen');
    expect(kartu[2]).toHaveTextContent('Boleh ambil sebagian');
    expect(screen.getByText(/^3 pesanan dari pembeli dalam 10 km/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sekali panen' }));
    expect(router.state.location.search).toBe('?jenis=sekali_panen');
    expect(within(screen.getByRole('list')).getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText(/^1 pesanan sekali panen/)).toBeInTheDocument();
  });

  it('kosong: ajakan cari sampai radius maksimal dari konfigurasi', async () => {
    const { router } = await buka('/pesanan', 'petani-arif', { resepContoh: false });
    expect(
      await screen.findByRole('heading', { name: 'Belum ada pesanan di sekitar' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cari sampai 25 km' }));
    expect(router.state.location.search).toBe('?radius=25');
    expect(await screen.findByText(/dalam 25 km/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cari sampai/ })).not.toBeInTheDocument();
  });

  it('petani nonaktif tetap melihat daftar (D-13)', async () => {
    await buka('/pesanan', 'petani-budi');
    expect(await screen.findAllByRole('link', { name: /Kafe Daun Pagi/ })).not.toHaveLength(0);
  });
});

describe('lencana menu Pesanan (D-37)', () => {
  it('menghitung pesanan baru yang belum diambil dan hilang setelah menu dibuka', async () => {
    await buka('/beranda');
    const nav = await screen.findAllByRole('navigation', { name: 'Navigasi utama' });
    await waitFor(() =>
      expect(within(nav[0]!).getByRole('link', { name: /Pesanan,? 2 baru/ })).toBeInTheDocument(),
    );
    await userEvent.click(within(nav[0]!).getByRole('link', { name: /Pesanan/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Pesanan' })).toBeInTheDocument();
    await waitFor(() =>
      expect(within(nav[0]!).queryByRole('link', { name: /baru/ })).not.toBeInTheDocument(),
    );
  });
});

describe('detail pesanan dan kesepakatan (T4.19, T4.20)', () => {
  it('cek lahan, jadwal yang terkejar, ambil, lalu setujui kesepakatan', async () => {
    const { router } = await buka('/pesanan/pesanan-kafe-bayam');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Bayam 4 kg per minggu' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Uang muka ditahan')).toBeInTheDocument();
    expect(await screen.findByText('Lahanmu cukup untuk 4 kg per minggu')).toBeInTheDocument();
    expect(screen.getByText(/Bagianmu mulai kiriman ke-2/)).toBeInTheDocument();
    expect(screen.getAllByText('CONTOH, belum divalidasi penyuluh').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Saran tanam bertahap' })).toBeInTheDocument();
    expect(screen.getByText('Bedengan 4')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ambil 4 kg per minggu' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/pesanan/pesanan-kafe-bayam/kesepakatan'),
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Periksa kesepakatan' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Kabari paling lambat 3 hari sebelum jadwal kirim.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ditawarkan ke petani lain; kalau tidak ada pengganti/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Rp25\.000|dipotong|berturut-turut/)).not.toBeInTheDocument();
    expect(screen.getByText(/7 kali\./)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Setuju' }));
    expect(screen.getByText('Centang pernyataan di atas dulu')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Saya sanggup mengirim 4 kg bayam/ }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Setuju' }));
    expect(await screen.findByText(/^Kesepakatan disetujui/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat jadwal tanam' })).toBeInTheDocument();
  });

  it('lahan tidak cukup: peringatan dengan jumlah maksimal dan tombol Ambil nonaktif', async () => {
    await buka('/pesanan/pesanan-kafe-bayam', 'petani-arif', {
      siapkan: async (t) => {
        const resep = (await t.klien.resep.daftar({ komoditas_id: 'kangkung' }))[0]!;
        await t.klien.kebun.buatSiklus({
          resep_id: resep.id,
          lahan_id: 'lahan-arif-kebun',
          luas_m2: 15,
          satuan_asli: 'm2',
          nilai_asli: 15,
          tanggal_tanam: hariIni(),
          dapat_subsidi: false,
          harga_jual: 5000,
          bagi_alat: true,
          jumlah_siklus_pembagian: 10,
          rencana_item: [],
        });
      },
    });
    expect(await screen.findByText('Lahanmu cukup untuk 1,5 kg per minggu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tambah jumlah' }));
    expect(screen.getByText('Lahanmu hanya cukup untuk 1,5 kg per minggu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ambil 2,5 kg per minggu' })).toBeDisabled();
  });

  it('petani nonaktif: tombol Ambil diganti penjelasan dan kontak admin (D-13)', async () => {
    await buka('/pesanan/pesanan-kafe-bayam', 'petani-budi');
    expect(
      await screen.findByText(/Akunmu sedang dinonaktifkan sementara.*\+62 812-0000-0099/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Ambil/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hubungi admin lewat WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/6281200000099',
    );
  });

  it('pesanan yang sudah diambil tidak bisa diambil lagi', async () => {
    await buka('/pesanan/pesanan-ratna-sawi');
    expect(await screen.findByText('Kamu sudah mengambil 10 kg per minggu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Ambil/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buka Kiriman saya' })).toBeInTheDocument();
  });

  it('kesepakatan tanpa alokasi mengarahkan ke detail', async () => {
    await buka('/pesanan/pesanan-kafe-bayam/kesepakatan');
    expect(await screen.findByText(/Kamu belum mengambil pesanan ini/)).toBeInTheDocument();
  });
});

describe('Kiriman saya (T4.21)', () => {
  it('hari ini menunggu konfirmasi, berikutnya, dan sebelumnya dengan bagian ditolak', async () => {
    await buka('/pesanan/kiriman', 'petani-arif', { jam: pagi() });
    const hari = await screen.findByRole('region', { name: /^Hari ini · / });
    expect(within(hari).getByRole('heading', { name: 'Bayam 5 kg' })).toBeInTheDocument();
    expect(
      within(hari).getByText('Menunggu konfirmasi').closest('[aria-current="step"]'),
    ).not.toBeNull();
    const sebelum = screen.getByRole('region', { name: 'Sebelumnya' });
    expect(within(sebelum).getByText(/kg ditolak: /)).toBeInTheDocument();
    expect(within(sebelum).getAllByText('Dana cair').length).toBeGreaterThan(0);
    const berikut = screen.getByRole('region', { name: 'Berikutnya' });
    expect(within(berikut).getAllByText('Uang muka ditahan').length).toBeGreaterThan(0);
    expect(within(berikut).getByText(/kiriman pertama/)).toBeInTheDocument();
  });

  it('tidak bisa menandai dikirim tanpa foto kualitas', async () => {
    await buka('/pesanan/kiriman', 'petani-arif', {
      siapkan: async (t) => {
        const k4 = t.konteks.db.pesanan.pengiriman.find((x) => x.id === 'kiriman-imas-arif-4')!;
        k4.tanggal_jadwal = hariIni();
        t.konteks.simpan();
      },
    });
    expect(
      await screen.findByRole('heading', { name: 'Sebelum kirim, unggah foto kualitas' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tandai sudah dikirim' })).toBeDisabled();
    expect(
      screen.getByText('Unggah foto kualitas dulu sebelum menandai dikirim.'),
    ).toBeInTheDocument();
  });

  it('kosong untuk petani tanpa kiriman', async () => {
    await buka('/pesanan/kiriman', 'petani-budi');
    expect(await screen.findByRole('heading', { name: 'Belum ada kiriman' })).toBeInTheDocument();
  });
});
