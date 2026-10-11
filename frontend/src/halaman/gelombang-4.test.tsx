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
    // Kiriman 26 Oktober belum terkejar bayam 25 hari; bahasa petani (D-40).
    expect(
      screen.getByText(/^Kamu bisa ikut mulai kiriman tanggal 2 November, jadi 7 kiriman\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText('CONTOH, belum divalidasi penyuluh').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Saran tanam bertahap' })).toBeInTheDocument();
    // Satu petak per kiriman, bedengan dipakai bergilir; 5 petak pertama tampil dulu.
    expect(screen.getByText(/^Satu petak untuk setiap kiriman, jadi 7 petak/)).toBeInTheDocument();
    expect(screen.getByText('Petak panen 2 Nov')).toBeInTheDocument();
    expect(screen.getByText('Tanam 8 Okt · bedengan 1')).toBeInTheDocument();
    expect(screen.getByText('Tanam 5 Nov · bedengan 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua (7 petak)' }));
    expect(screen.getByText('Petak panen 14 Des')).toBeInTheDocument();

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
          // Kebun 180 m² sisa 44,98 → tinggal 5 m², cukup untuk 1,5 kg bayam per minggu.
          luas_m2: 39.98,
          satuan_asli: 'm2',
          nilai_asli: 39.98,
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

describe('tanggapan D-39 (D-40)', () => {
  it('Beranda: petak satu pesanan menjadi satu pil dan satu kelompok tugas berlabel petak', async () => {
    await buka('/beranda');
    const pil = await screen.findByRole('group', { name: 'Pilih siklus' });
    const label = within(pil)
      .getAllByRole('button')
      .map((b) => b.textContent);
    expect(label.filter((x) => x?.includes('untuk Katering Bu Ratna'))).toEqual([
      'Sawi hijau untuk Katering Bu Ratna',
    ]);
    expect(label.filter((x) => x?.includes('untuk Warung Nasi Bu Imas'))).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Sawi hijau untuk Katering Bu Ratna' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^Petak panen 20 Okt · /).length).toBeGreaterThan(0);
    await userEvent.click(within(pil).getByRole('button', { name: /Katering Bu Ratna/ }));
    expect(
      await screen.findByText('Sawi hijau untuk Katering Bu Ratna · Petak panen 20 Okt'),
    ).toBeInTheDocument();
  });

  it('Kebun: kelompok petak bisa dibuka; tautan #kelompok membukanya', async () => {
    await buka('/kebun?daftar#kelompok-alokasi-ratna-arif');
    const kelompok = await screen.findByText('Sawi hijau untuk Katering Bu Ratna');
    const details = kelompok.closest('details') as HTMLDetailsElement;
    expect(details.open).toBe(true);
    expect(
      within(details).getByText(/^12 petak · 2 sedang tumbuh · tanam berikutnya/),
    ).toBeInTheDocument();
    expect(within(details).getAllByRole('link', { name: /^Petak panen/ })).toHaveLength(12);
    const imas = screen.getByText('Bayam untuk Warung Nasi Bu Imas').closest('details');
    expect(imas?.open).toBe(false);
    expect(within(imas as HTMLElement).getByText(/2 sudah dipanen/)).toBeInTheDocument();
  });

  it('kesepakatan: jumlah bisa diubah sebelum setuju', async () => {
    await buka('/pesanan/pesanan-kafe-bayam/kesepakatan', 'petani-arif', {
      siapkan: async (t) => {
        await t.klien.pesanan.ambilPesanan('pesanan-kafe-bayam', {
          kunci_idempoten: 'uji-ambil',
          jumlah_kg: 4,
          lahan_id: 'lahan-arif-kebun',
        });
      },
    });
    expect(await screen.findByText('Bayam 4 kg per minggu')).toBeInTheDocument();
    expect(screen.getByText(/^Setiap Senin sebelum pukul 08\.00, 7 kali\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ubah jumlah' }));
    const dialog = await screen.findByRole('dialog', { name: 'Ubah jumlah sebelum setuju' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Kurangi jumlah' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Kurangi jumlah' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan 2 kg per minggu' }));
    expect(await screen.findByText('Bayam 2 kg per minggu')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Saya sanggup mengirim 2 kg bayam/ }),
    ).toBeInTheDocument();
  });

  it('detail: jam antar dari pesanan', async () => {
    await buka('/pesanan/pesanan-kafe-bayam');
    expect(await screen.findByText('Tiap Senin, sebelum 08.00')).toBeInTheDocument();
  });

  it('kiriman: foto hasil panen wajib, foto timbangan opsional, jam antar tampil', async () => {
    // Jam pagi: kiriman ke-3 (batas periksa 13.00) masih menunggu konfirmasi di hari ini.
    await buka('/pesanan/kiriman', 'petani-arif', {
      jam: pagi(),
      siapkan: async (t) => {
        const k4 = t.konteks.db.pesanan.pengiriman.find((x) => x.id === 'kiriman-imas-arif-4')!;
        k4.tanggal_jadwal = hariIni();
        k4.foto_kualitas = '/contoh/foto/bayam-kiriman-3.svg';
        t.konteks.simpan();
      },
    });
    expect(await screen.findAllByText(/antar sebelum pukul 09\.00/)).not.toHaveLength(0);
    // Kiriman ke-3 (sudah dikirim) dan ke-4 (hari ini) sama-sama menampilkan foto hasil panen.
    expect(screen.getAllByText('Foto hasil panen')).toHaveLength(2);
    expect(screen.getByText('Foto di timbangan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ambil foto di timbangan/ })).toBeInTheDocument();
    // Foto timbangan boleh dilewati: tombol kirim aktif hanya dengan foto hasil panen.
    expect(screen.getByRole('button', { name: 'Tandai sudah dikirim' })).toBeEnabled();
  });
});
