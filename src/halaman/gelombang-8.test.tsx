/**
 * Tes halaman gelombang 8 (T4.29, T4.38, T4.39, D-46): panel admin (verifikasi pembeli, sengketa,
 * catatan dan status petani) dan panel mentor (daftar resep, permintaan, editor dengan versi baru
 * dan validasi), termasuk penjaga peran.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { daftarRute } from '../rute';

async function buka(alamat: string, pengguna: string) {
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

describe('panel admin (T4.29)', () => {
  it('hanya admin: petani diarahkan ke berandanya', async () => {
    const { router } = await buka('/admin/sengketa', 'petani-arif');
    await waitFor(() => expect(router.state.location.pathname).toBe('/beranda'));
  });

  it('verifikasi pembeli: tolak wajib alasan, setujui mengosongkan antrean', async () => {
    const { t } = await buka('/admin', 'admin-tani');
    expect(await screen.findByText('Kedai Sayur Pagi')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tolak Kedai Sayur Pagi' }));
    const dialog = await screen.findByRole('dialog', { name: 'Tolak Kedai Sayur Pagi?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Tolak pembeli' }));
    expect(await within(dialog).findByText('Isi alasan penolakan')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Tutup' }));

    await userEvent.click(screen.getByRole('button', { name: 'Setujui Kedai Sayur Pagi' }));
    expect(await screen.findByText('Kedai Sayur Pagi sudah terverifikasi.')).toBeInTheDocument();
    expect(
      await screen.findByText('Tidak ada pembeli yang menunggu verifikasi.'),
    ).toBeInTheDocument();
    expect(await t.klien.admin.pembeliMenunggu()).toEqual([]);
  });

  it('sengketa: cairkan ke petani dengan catatan, lalu pindah ke Diputuskan', async () => {
    const { t } = await buka('/admin/sengketa', 'admin-tani');
    expect(await screen.findByText('Arif Setiawan → Warung Nasi Bu Imas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cairkan ke petani' }));
    const dialog = await screen.findByRole('dialog', { name: 'Cairkan ke petani?' });
    await userEvent.type(
      within(dialog).getByLabelText('Catatan keputusan (tidak wajib)'),
      'Foto menunjukkan daun masih segar',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan keputusan' }));
    expect(await screen.findByText('Keputusan tersimpan.')).toBeInTheDocument();
    expect(await screen.findByText('Tidak ada sengketa dengan status ini.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Diputuskan' }));
    expect(await screen.findByText('Dicairkan ke petani')).toBeInTheDocument();
    expect(screen.getByText('Foto menunjukkan daun masih segar')).toBeInTheDocument();
    const [s] = await t.klien.admin.sengketa({ status: 'diputuskan' });
    expect(s?.keputusan).toBe('cairkan_ke_petani');
  });

  it('petani: daftar, catatan baru, dan aktifkan kembali (D-03, D-13)', async () => {
    const { t } = await buka('/admin/petani', 'admin-tani');
    const tabel = await screen.findByRole('region', { name: 'Petani' });
    const baris = within(tabel).getByRole('link', { name: 'Lihat Budi Santoso' }).closest('tr')!;
    expect(within(baris).getByText('Dinonaktifkan sementara')).toBeInTheDocument();
    await userEvent.click(within(tabel).getByRole('link', { name: 'Lihat Budi Santoso' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Budi Santoso' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Simpan catatan' }));
    expect(await screen.findByText('Isi catatan dulu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Lainnya' }));
    await userEvent.type(screen.getByLabelText('Isi catatan'), 'Sudah dihubungi lewat telepon.');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan catatan' }));
    expect(await screen.findByText('Sudah dihubungi lewat telepon.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Aktifkan kembali' }));
    expect(await screen.findByText('Status akun sekarang: Aktif.')).toBeInTheDocument();
    const p = await t.klien.admin.petani('petani-budi');
    expect(p.pengguna.status_akun).toBe('aktif');
    expect(p.catatan).toHaveLength(2);
  });
});

describe('panel mentor (T4.38, T4.39)', () => {
  it('daftar resep per tanaman dan cara tanam; permintaan terbanyak di atas', async () => {
    await buka('/mentor', 'mentor-rahmat');
    const tabel = await screen.findByRole('region', { name: 'Resep tanam' });
    await waitFor(() => expect(within(tabel).getAllByRole('row')).toHaveLength(6));
    expect(within(tabel).getByText('Sawi hijau · Bedengan')).toBeInTheDocument();
    // Resep contoh tidak bisa langsung divalidasi.
    expect(within(tabel).queryByRole('button', { name: /^Tandai resep/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Permintaan resep' }));
    const p = await screen.findByRole('region', { name: 'Permintaan resep' });
    const jumlah = within(p)
      .getAllByRole('row')
      .slice(1)
      .map((r) => Number(r.lastElementChild?.textContent));
    expect(jumlah).toEqual([...jumlah].sort((a, b) => b - a));
    expect(within(p).getAllByRole('row')[1]).toHaveTextContent('Cabai rawit');
  });

  it('ubah resep menjadi versi baru draf; siklus berjalan tetap versi lama; lalu divalidasi', async () => {
    const { t } = await buka('/mentor/resep/resep-sawi-bedengan', 'mentor-rahmat');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Ubah Sawi hijau · Bedengan (dari versi 1)',
      }),
    ).toBeInTheDocument();
    const hasil = screen.getByLabelText('Hasil panen per m² (kg)');
    expect(hasil).toHaveValue('1,5');
    await userEvent.clear(hasil);
    await userEvent.type(hasil, '1,6');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan sebagai versi baru' }));
    expect(
      await screen.findByText('Sawi hijau · Bedengan: Tersimpan sebagai versi 2 (draf).'),
    ).toBeInTheDocument();

    const baru = (await t.klien.mentor.daftarResep()).find(
      (r) => r.komoditas_id === 'sawi' && r.metode_id === 'bedengan' && r.versi === 2,
    )!;
    expect(baru).toMatchObject({ status: 'draf', hasil_per_satuan: 1.6, contoh: false });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Tandai resep Sawi hijau · Bedengan divalidasi' }),
    );
    expect(
      await screen.findByText('Sawi hijau · Bedengan versi 2 sudah divalidasi.'),
    ).toBeInTheDocument();

    await t.kontrol.masukSebagai('petani-arif');
    expect((await t.klien.kebun.ambilSiklus('siklus-arif-sawi')).resep_versi).toBe(1);
    expect(
      (await t.klien.resep.daftar({ komoditas_id: 'sawi', metode_id: 'bedengan' }))[0]?.id,
    ).toBe(baru.id);
  });

  it('editor menolak angka yang tidak masuk akal dan tidak menyimpan', async () => {
    const { t } = await buka('/mentor/resep/resep-sawi-bedengan', 'mentor-rahmat');
    await screen.findByRole('heading', { level: 1, name: /^Ubah Sawi hijau/ });
    const hst = screen.getAllByLabelText('HST mulai');
    // Tugas ketiga = Pupuk 1 (sekali, hari ke-7).
    await userEvent.clear(hst[2]!);
    await userEvent.type(hst[2]!, '40');
    await userEvent.clear(screen.getByLabelText('Umur panen (hari)'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan sebagai versi baru' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Periksa isian yang ditandai.');
    expect(alert).toHaveTextContent('Tanaman dan hasil: Umur panen minimal 1 hari');
    // Pesan juga tampil di bawah isiannya.
    expect(screen.getByText('Umur panen minimal 1 hari')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Umur panen (hari)'), '28');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan sebagai versi baru' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Tugas dan jadwal, 3: Hari di resep tidak masuk akal',
    );
    expect((await t.klien.mentor.daftarResep()).length).toBe(5);
  });

  it('resep baru: tanaman dan cara tanam wajib dipilih', async () => {
    await buka('/mentor/resep/baru', 'mentor-rahmat');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Resep baru' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan sebagai versi baru' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Periksa isian yang ditandai.');
  });
});
