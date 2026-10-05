/**
 * Tes halaman gelombang 2 (T4.02–T4.08, T4.36a) terhadap rute aplikasi dan klien tiruan sungguhan.
 * jsdom tidak punya matchMedia, jadi halaman memakai tata letak HP.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { resepKeDomain } from '../api/peta';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { buatJadwal } from '../lib/jadwal-buat';
import { daftarRute } from '../rute';

type Tiruan = ReturnType<typeof buatKlienTiruan>;

async function buka(alamat: string, siapkan?: (t: Tiruan) => Promise<void>) {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  await t.kontrol.masukSebagai('petani-arif');
  await siapkan?.(t);
  const router = createMemoryRouter(daftarRute, { initialEntries: [alamat] });
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={router} />
    </PenyediaKlienApi>,
  );
  return { t, router };
}

describe('Hitung langkah 1 (T4.02, T4.03)', () => {
  it('filter Sawah hanya menampilkan tanaman yang cocok; pencarian kosong menawarkan minta tanaman baru', async () => {
    await buka('/hitung/tanaman');
    await screen.findByRole('radio', { name: 'Pilih Sawi hijau' });
    await userEvent.click(screen.getByRole('button', { name: 'Sawah' }));
    expect(screen.getByRole('radio', { name: 'Pilih Padi sawah' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Pilih Sawi hijau' })).not.toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Cari tanaman'), 'selada');
    expect(screen.getByText('Tanaman ini belum ada di daftar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minta tanaman baru' })).toBeInTheDocument();
  });

  it('komoditas tanpa resep membuka Segera hadir; minta resep tercatat sekali', async () => {
    const { t } = await buka('/hitung/tanaman');
    // Cabai sudah pernah diminta Arif di data contoh: langsung tampil tercatat.
    await userEvent.click(await screen.findByRole('button', { name: 'Cabai rawit, segera hadir' }));
    expect(await screen.findByText('Permintaanmu tercatat.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Pilih tanaman lain' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tomat, segera hadir' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Minta resep ini' }));
    expect(await within(dialog).findByText('Permintaanmu tercatat.')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Pilih tanaman lain' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tomat, segera hadir' }));
    expect(await screen.findByText('Permintaanmu tercatat.')).toBeInTheDocument();
    const minta = await t.klien.resep.permintaanSaya();
    expect(minta.filter((p) => p.komoditas_id === 'tomat')).toHaveLength(1);
  });

  it('memilih sawi mengaktifkan tombol lanjut ke langkah 2', async () => {
    await buka('/hitung/tanaman');
    await userEvent.click(await screen.findByRole('radio', { name: 'Pilih Sawi hijau' }));
    expect(screen.getByRole('link', { name: 'Lanjut pilih metode' })).toHaveAttribute(
      'href',
      '/hitung/metode?komoditas=sawi',
    );
  });
});

describe('Hitung langkah 2 (T4.04)', () => {
  it('bedengan 100 m²: bantuan konversi ru dan perkiraan panen dengan label contoh', async () => {
    await buka('/hitung/metode?komoditas=sawi&metode=bedengan&nilai=100');
    expect(await screen.findByText('Kira-kira saja. 100 m² ≈ 7 ru.')).toBeInTheDocument();
    expect(screen.getByText('Perkiraan panen sekitar 150 kg')).toBeInTheDocument();
    expect(screen.getAllByText('CONTOH, belum divalidasi penyuluh').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Lanjut hitung modal' })).toBeInTheDocument();
  });

  it('ukuran nol ditolak dan tombol lanjut nonaktif', async () => {
    await buka('/hitung/metode?komoditas=sawi&metode=bedengan&nilai=0');
    expect(await screen.findByText('Isi luas lahan dulu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lanjut hitung modal' })).toBeDisabled();
  });

  it('bayam hidroponik tampil Segera hadir (D-05)', async () => {
    await buka('/hitung/metode?komoditas=bayam&metode=bedengan&nilai=20');
    expect(
      await screen.findByRole('radio', { name: 'Hidroponik, segera hadir' }),
    ).toBeInTheDocument();
  });
});

describe('Hitung langkah 3 (T4.05–T4.07)', () => {
  it('mengubah jumlah memperbarui subtotal item', async () => {
    await buka('/hitung/modal?komoditas=sawi&metode=bedengan&nilai=100');
    const baris = (await screen.findByText('Dolomit · 20 kg')).closest(
      'div.flex.flex-col',
    ) as HTMLElement;
    await within(baris).findByText(/Rata-rata di sekitarmu/);
    const subtotalAwal = within(baris).getByText(/^Rp/).textContent as string;
    const awal = Number(subtotalAwal.replace(/\D/g, ''));
    await userEvent.click(within(baris).getByRole('button', { name: 'Ubah jumlah' }));
    const jumlah = within(baris).getByLabelText('Jumlah');
    await userEvent.clear(jumlah);
    await userEvent.type(jumlah, '40');
    await waitFor(() =>
      expect(
        Number((within(baris).getAllByText(/^Rp/)[0]?.textContent ?? '').replace(/\D/g, '')),
      ).toBe(awal * 2),
    );
    expect(
      screen.getByText(
        'Semua harga di halaman ini adalah contoh. Ubah sesuai harga di kios dan upah di desamu.',
      ),
    ).toBeInTheDocument();
  });

  it('item tambahan tanpa nama menahan simpan dan menandai total belum lengkap', async () => {
    await buka('/hitung/modal?komoditas=sawi&metode=bedengan&nilai=100');
    await userEvent.click(await screen.findByRole('button', { name: 'Tambah item' }));
    expect((await screen.findAllByText(/item belum ada harganya/)).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan rencana' }));
    expect(await screen.findByText('Isi nama item dulu')).toBeInTheDocument();
  });

  it('hidroponik menampilkan alat sekali beli dengan saklar pembagian', async () => {
    await buka('/hitung/modal?komoditas=sawi&metode=hidroponik&sistem=nft&nilai=200&tandon=100');
    expect(await screen.findByRole('heading', { name: 'Alat sekali beli' })).toBeInTheDocument();
    const saklar = screen.getByRole('switch', { name: 'Bagi biaya alat ke 10 siklus' });
    expect(saklar).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(saklar);
    expect(screen.getByText('Seluruh harga alat masuk ke modal siklus ini.')).toBeInTheDocument();
  });
});

describe('Simpan rencana dan tanggal tanam (T4.08)', () => {
  it('membuat siklus aktif dengan jumlah tugas sesuai buatJadwal', async () => {
    const { t, router } = await buka('/hitung/simpan?komoditas=sawi&metode=bedengan&nilai=20');
    await userEvent.click(await screen.findByRole('radio', { name: /^Kebun belakang rumah/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan dan buat jadwal' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/beranda'));
    const id = new URLSearchParams(router.state.location.search).get('siklus') as string;
    const siklus = await t.klien.kebun.ambilSiklus(id);
    expect(siklus).toMatchObject({ status: 'aktif', luas_m2: 20, lahan_id: 'lahan-arif-kebun' });
    const resep = await t.klien.resep.ambil(siklus.resep_id);
    const jadwal = buatJadwal(resepKeDomain(resep).tugas, siklus.tanggal_tanam as string);
    expect((await t.klien.kebun.daftarTugas(id)).length).toBe(jadwal.ok ? jadwal.nilai.length : -1);
    expect(siklus.rencana_item.length).toBeGreaterThan(0);
  });

  it('lahan yang tidak cukup tidak bisa dipilih', async () => {
    await buka('/hitung/simpan?komoditas=sawi&metode=hidroponik&sistem=nft&nilai=200&tandon=100');
    expect(await screen.findByText('Tidak cukup untuk 200 lubang')).toBeInTheDocument();
  });
});

describe('Lahan saya (T4.36a)', () => {
  it('menambah lahan dengan satuan ru: luas tersimpan dalam m² dan nilai asli', async () => {
    const { t } = await buka('/lahan');
    await userEvent.click(await screen.findByRole('button', { name: 'Tambah lahan' }));
    await userEvent.type(screen.getByLabelText('Nama lahan'), 'Pekarangan depan');
    await userEvent.click(screen.getByRole('button', { name: 'Pekarangan/polybag' }));
    await userEvent.click(screen.getByRole('button', { name: 'ru/bata' }));
    await userEvent.type(screen.getByLabelText('Luas lahan'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan lahan' }));
    expect(await screen.findByText('Dipakai 0 dari 28 m²')).toBeInTheDocument();
    const lahan = (await t.klien.lahan.daftar()).find((l) => l.nama === 'Pekarangan depan');
    expect(lahan).toMatchObject({ luas_m2: 28, satuan_asli: 'ru', nilai_asli: 2 });
  });
});
