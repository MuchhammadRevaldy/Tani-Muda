/**
 * Tes halaman gelombang 1 (T4.01, T4.09, T4.33, T4.34) terhadap rute aplikasi dan klien tiruan
 * sungguhan dengan penyimpanan memori.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { daftarRute } from '../rute';

type Tiruan = ReturnType<typeof buatKlienTiruan>;

async function buka(alamat: string, siapkan?: (t: Tiruan) => Promise<void>) {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  await siapkan?.(t);
  const router = createMemoryRouter(daftarRute, { initialEntries: [alamat] });
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={router} />
    </PenyediaKlienApi>,
  );
  return { t, router };
}

async function isiKode(t: Tiruan, nomorNormal: string) {
  const kode = t.kontrol.kodeUji(nomorNormal) as string;
  await userEvent.click(screen.getByLabelText('Angka ke-1'));
  await userEvent.paste(kode);
}

describe('Masuk (T4.33)', () => {
  it('nomor tidak valid ditolak dengan pesan', async () => {
    await buka('/masuk');
    await userEvent.type(await screen.findByLabelText('Nomor HP'), '12345');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim kode' }));
    expect(await screen.findByText(/Nomor HP belum benar/)).toBeInTheDocument();
  });

  it('kode salah ditolak; kode benar masuk ke beranda petani yang lama', async () => {
    const { t, router } = await buka('/masuk');
    await userEvent.type(await screen.findByLabelText('Nomor HP'), '0812 0000 0001');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim kode' }));
    expect(
      await screen.findByText('Kode sudah dikirim lewat SMS ke nomor ini.'),
    ).toBeInTheDocument();

    const benar = t.kontrol.kodeUji('+6281200000001') as string;
    const salah = benar === '000000' ? '111111' : '000000';
    await userEvent.click(screen.getByLabelText('Angka ke-1'));
    await userEvent.paste(salah);
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kode salah');

    await userEvent.click(screen.getByLabelText('Angka ke-1'));
    await userEvent.paste(benar);
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(
      await screen.findByRole('heading', { name: /^Selamat (pagi|siang|sore|malam), Arif$/ }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/beranda');
  });

  // Alur pendaftaran dipecah dua tes supaya tiap tes pendek (D-43): masuk dan persetujuan privasi,
  // lalu pilih peran dan desa mulai dari pengguna baru yang sudah terverifikasi.
  it('pengguna baru wajib setuju privasi sebelum masuk ke Lengkapi akun', async () => {
    const { t, router } = await buka('/masuk');
    await userEvent.type(await screen.findByLabelText('Nomor HP'), '0857 1234 5678');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim kode' }));
    await screen.findByText('Kode sudah dikirim lewat SMS ke nomor ini.');
    await isiKode(t, '+6285712345678');

    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Nomor ini belum punya akun')).toBeInTheDocument();
    // Tanpa centang tetap ditolak.
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(
      await screen.findByText('Centang persetujuan kebijakan privasi dulu'),
    ).toBeInTheDocument();

    // Teks draf bisa dibaca dan ditandai draf.
    await userEvent.click(screen.getByRole('button', { name: 'Baca kebijakan privasi (draf)' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Draf: menunggu tinjauan/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getByLabelText('Saya setuju dengan kebijakan privasi Tani Muda'));
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByRole('heading', { name: 'Lengkapi akun' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/pilih-peran');
    expect((await t.klien.akun.ambil())?.pengguna.setuju_privasi_pada).not.toBeNull();
  });

  it('pengguna baru memilih peran petani dengan desa (T4.34)', async () => {
    const { t, router } = await buka('/pilih-peran', async (x) => {
      await x.klien.akun.kirimOtp({ nomor_hp: '0857 1234 5678' });
      await x.klien.akun.verifikasiOtp({
        nomor_hp: '+6285712345678',
        kode: x.kontrol.kodeUji('+6285712345678') as string,
        setuju_privasi: true,
      });
    });
    expect(await screen.findByRole('heading', { name: 'Lengkapi akun' })).toBeInTheDocument();
    // Admin tidak bisa dipilih sendiri.
    expect(screen.queryByRole('radio', { name: /^Admin/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: /^Petani/ }));
    await userEvent.type(screen.getByLabelText('Nama lengkap'), 'Rina Agustina');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan dan lanjut' }));
    expect(await screen.findByText('Isi desa lahanmu dulu')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Desa lokasi lahan'), 'Sukajaya');
    await userEvent.click(await screen.findByRole('radio', { name: /^Sukajaya,/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan dan lanjut' }));
    expect(await screen.findByText('Mulai siklus tanam pertamamu')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/beranda');
    const akun = await t.klien.akun.ambil();
    expect(akun?.pengguna).toMatchObject({ peran: 'petani', nama: 'Rina Agustina' });
  });
});

describe('Pemilih akun demo (T4.01)', () => {
  it('masuk sebagai pembeli lalu diarahkan ke halaman pembeli', async () => {
    const { router } = await buka('/akun-demo');
    await userEvent.click(await screen.findByRole('button', { name: 'Masuk sebagai Ratna' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/pembeli'));
  });

  it('tanpa kontrol pengembangan (bukan data tiruan) hanya menampilkan penjelasan', async () => {
    const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
    const router = createMemoryRouter(daftarRute, { initialEntries: ['/akun-demo'] });
    render(
      <PenyediaKlienApi klien={t.klien} kontrol={null} queryClient={buatQueryClient()}>
        <RouterProvider router={router} />
      </PenyediaKlienApi>,
    );
    expect(await screen.findByText(/hanya ada saat memakai data tiruan/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Masuk sebagai/ })).not.toBeInTheDocument();
  });
});

describe('Beranda petani (T4.09)', () => {
  it('menampilkan siklus, label contoh, tugas terlambat, dan tawaran pesanan', async () => {
    await buka('/beranda', (t) => t.kontrol.masukSebagai('petani-arif'));
    expect(
      await screen.findByRole('heading', { name: /^Selamat (pagi|siang|sore|malam), Arif$/ }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Sawi hijau · Kebun belakang rumah', level: 2 }),
    ).toBeInTheDocument();
    expect(
      (await screen.findAllByText('CONTOH, belum divalidasi penyuluh')).length,
    ).toBeGreaterThan(0);
    expect(await screen.findByText('Terlambat 2 hari')).toBeInTheDocument();
    expect(screen.getByText('1 terlambat')).toBeInTheDocument();
    expect(await screen.findByText('Besok: Pupuk 2')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Katering Bu Ratna' })).toBeInTheDocument();
  });

  it('centang tugas menandai selesai lewat klien API', async () => {
    const { t } = await buka('/beranda', (x) => x.kontrol.masukSebagai('petani-arif'));
    // Siram ada di beberapa siklus (sawi dan petak-petak pesanan); centang yang pertama saja.
    const centang = await screen.findAllByRole('checkbox', {
      name: 'Tandai selesai: Siram pagi dan sore',
    });
    await userEvent.click(centang[0]!);
    // Tugas hari ini tetap tampil tercentang sampai besok.
    const sudah = await screen.findAllByRole('checkbox', {
      name: 'Batalkan selesai: Siram pagi dan sore',
    });
    expect(sudah).toHaveLength(1);
    expect(sudah[0]).toHaveAttribute('aria-checked', 'true');
    const tugas = await t.klien.kebun.tugasHariIni();
    expect(
      tugas.filter((x) => x.judul === 'Siram pagi dan sore' && x.status === 'selesai'),
    ).toHaveLength(1);
  });

  it('memilih siklus hidroponik menampilkan pil hasil ukur dan tombol Isi angka', async () => {
    await buka('/beranda?siklus=siklus-arif-hidro', (t) => t.kontrol.masukSebagai('petani-arif'));
    expect(
      await screen.findByRole('heading', { name: 'Sawi hijau · Rak hidroponik teras', level: 2 }),
    ).toBeInTheDocument();
    expect(await screen.findByText('pH 6,3 · normal')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Isi angka' }).length).toBeGreaterThan(0);
  });

  it('petani tanpa siklus melihat ajakan mulai siklus (papan 05)', async () => {
    await buka('/beranda', (t) => t.kontrol.masukSebagai('petani-sari'));
    expect(await screen.findByText('Mulai siklus tanam pertamamu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mulai siklus tanam' })).toHaveAttribute(
      'href',
      '/hitung/tanaman',
    );
  });
});
