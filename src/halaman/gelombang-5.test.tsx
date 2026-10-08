/**
 * Tes halaman gelombang 5 (T4.22–T4.28, T4.41, D-41): dasbor pembeli, buat pesanan rutin dan sekali
 * panen, bayar uang muka mode uji coba, konfirmasi kiriman dengan penolakan sebagian, rating dua
 * arah, gagal panen, dan data usaha pembeli. Jam dikunci ke 5 Oktober 2026 08.00 WIB
 * (src/uji/persiapan.ts); tes yang memeriksa kiriman Imas ke-3 memakai jam pagi klien tiruan.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { tanggalLokal, utcDariLokal, ZONA_BAWAAN } from '../lib/zona-waktu';
import { daftarRute } from '../rute';

type Tiruan = ReturnType<typeof buatKlienTiruan>;
const pagi = () => Date.parse(utcDariLokal(tanggalLokal(Date.now()), 8, 30, ZONA_BAWAAN));

async function buka(
  alamat: string,
  pengguna: string,
  opsi: { siapkan?: (t: Tiruan) => Promise<void> | void; jam?: number } = {},
) {
  const t = buatKlienTiruan({
    tampilkanResepContoh: true,
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

describe('dasbor pembeli (T4.22)', () => {
  it('pesanan, kebun pemenuh (desa dan jarak), bagian tanpa petani, uang, kiriman berikutnya', async () => {
    await buka('/pembeli', 'pembeli-ratna');
    const kartu = (
      await screen.findByRole('heading', { level: 2, name: 'Sawi hijau · 15 kg per minggu' })
    ).closest('section') as HTMLElement;
    expect(within(kartu).getByText(/^Kebun Arif Setiawan · /)).toBeInTheDocument();
    expect(within(kartu).getByText(/km dari titik antar$/)).toBeInTheDocument();
    expect(within(kartu).getByText('5 kg per minggu lagi belum ada petani')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Uang Anda' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kiriman berikutnya' })).toBeInTheDocument();
    // D-06: tidak ada titik lahan di halaman pembeli.
    expect(document.body.textContent).not.toMatch(/lintang|bujur|-6\.81/);
  });

  it('kiriman tiba: banner dan tautan periksa', async () => {
    await buka('/pembeli', 'pembeli-imas', { jam: pagi() });
    expect(
      await screen.findByRole('heading', { name: 'Kiriman bayam dari Arif Setiawan sudah tiba' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Periksa kiriman' })).toHaveAttribute(
      'href',
      '/pembeli/kiriman/kiriman-imas-arif-3',
    );
  });

  it('pesanan belum dibayar bisa dibatalkan dan masuk riwayat', async () => {
    const { router } = await buka('/pembeli', 'pembeli-imas', { jam: pagi() });
    const kartu = (
      await screen.findByRole('heading', { level: 2, name: 'Sawi hijau · 6 kg per minggu' })
    ).closest('section') as HTMLElement;
    expect(within(kartu).getByText('Belum dibayar')).toBeInTheDocument();
    await userEvent.click(within(kartu).getByRole('button', { name: 'Batalkan pesanan' }));
    const dialog = await screen.findByRole('dialog', { name: 'Batalkan pesanan ini?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Ya, batalkan' }));
    expect(await screen.findByText('Pesanan dibatalkan.')).toBeInTheDocument();
    await router.navigate('/pembeli/riwayat');
    expect(await screen.findByText(/^Dibatalkan · /)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pesan lagi' })).toBeInTheDocument();
  });
});

describe('buat pesanan (T4.23, T4.24)', () => {
  it('rutin: hanya komoditas berresep, ringkasan biaya dari pesanan-nilai, lalu ke bayar', async () => {
    const { router } = await buka('/pembeli/pesanan/baru', 'pembeli-ratna');
    const komoditas = await screen.findByRole('radiogroup', { name: 'Pilih komoditas' });
    expect(within(komoditas).queryByRole('radio', { name: /Cabai/ })).not.toBeInTheDocument();
    await userEvent.click(within(komoditas).getByRole('radio', { name: 'Sawi hijau' }));
    await userEvent.type(screen.getByLabelText('Jumlah per kiriman'), '10');
    // Seminggu sekali, 3 bulan = 12 kiriman; harga contoh sawi Rp5.000: 10 × 12 × 5.000.
    expect(screen.getByText('Rp600.000')).toBeInTheDocument();
    expect(screen.getByText('Rp120.000')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Lanjut bayar Rp150.000' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/\/bayar$/));
  });

  it('sekali panen: jumlah total dan bulan panen', async () => {
    const { t, router } = await buka('/pembeli/pesanan/baru?jenis=sekali_panen', 'pembeli-ratna');
    const komoditas = await screen.findByRole('radiogroup', { name: 'Pilih komoditas' });
    await userEvent.click(within(komoditas).getByRole('radio', { name: 'Padi sawah' }));
    await userEvent.type(screen.getByLabelText('Jumlah seluruhnya'), '1000');
    expect(screen.getByLabelText('Perkiraan bulan panen')).toHaveValue('2027-02');
    await userEvent.click(screen.getByRole('button', { name: /^Lanjut bayar/ }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/\/bayar$/));
    const baru = (await t.klien.pembeli.pesananSaya()).find(
      (p) =>
        p.jenis === 'sekali_panen' &&
        p.komoditas_id === 'padi' &&
        p.status === 'menunggu_pembayaran',
    );
    expect(baru).toMatchObject({ jumlah_kiriman: 1, perkiraan_bulan_panen: '2027-02' });
  });

  it('pembeli belum terverifikasi: tombol nonaktif dengan penjelasan (T4.28)', async () => {
    await buka('/pembeli/pesanan/baru', 'pembeli-baru');
    expect(await screen.findByText('Menunggu verifikasi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Lanjut bayar/ })).toBeDisabled();
  });
});

describe('bayar uang muka mode uji coba (T4.41, D-41)', () => {
  it('gagal tidak mengaktifkan pesanan; menunggu; lalu berhasil satu kali', async () => {
    const { t } = await buka('/pembeli/pesanan/pesanan-imas-sawi/bayar', 'pembeli-imas', {
      jam: pagi(),
    });
    expect(await screen.findByText('Mode uji coba')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Gagal' }));
    await userEvent.click(screen.getByRole('button', { name: /^Bayar Rp/ }));
    expect(await screen.findByText('Pembayaran belum berhasil')).toBeInTheDocument();
    expect(
      (await t.klien.pembeli.pesananSaya()).find((p) => p.id === 'pesanan-imas-sawi')?.status,
    ).toBe('menunggu_pembayaran');
    await userEvent.click(screen.getByRole('button', { name: 'Menunggu' }));
    await userEvent.click(screen.getByRole('button', { name: 'Coba bayar lagi' }));
    expect(await screen.findByText('Pembayaran sedang diproses')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Berhasil' }));
    await userEvent.dblClick(screen.getByRole('button', { name: 'Cek lagi' }));
    expect(await screen.findByText('Uang muka sudah masuk')).toBeInTheDocument();
    const bayar = (await t.klien.pembeli.pembayaran()).data.filter(
      (b) =>
        b.pesanan_id === 'pesanan-imas-sawi' && b.jenis === 'uang_muka' && b.status === 'ditahan',
    );
    expect(bayar).toHaveLength(1);
  });
});

describe('jam yang melewati tengah malam (D-48)', () => {
  it('data demo diatur pukul 23.00: batas periksa disebut "besok"', async () => {
    const malam = Date.parse(utcDariLokal(tanggalLokal(Date.now()), 23, 0, ZONA_BAWAAN));
    await buka('/pembeli', 'pembeli-imas', { jam: malam });
    expect(
      await screen.findByText(
        'Tiba pukul 22.00, 5 kg. Periksa sebelum besok pukul 04.00. Lewat dari itu, kiriman dianggap diterima semua.',
      ),
    ).toBeInTheDocument();
  });
});

describe('konfirmasi kiriman dan rating (T4.25, T4.26)', () => {
  it('tolak sebagian: Lainnya wajib keterangan, sengketa tercatat, lalu beri nilai', async () => {
    const { t } = await buka('/pembeli/kiriman/kiriman-imas-arif-3', 'pembeli-imas', {
      jam: pagi(),
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Periksa kiriman bayam' }),
    ).toBeInTheDocument();
    // Data demo diatur pukul 08.30: dikirim 1 jam sebelumnya, batas periksa 6 jam (D-01, D-47).
    expect(screen.getByText('Periksa sebelum pukul 13.30')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Tolak sebagian' }));
    await userEvent.type(screen.getByLabelText('Berat yang ditolak'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Lainnya' }));
    await userEvent.click(screen.getByRole('button', { name: 'Konfirmasi terima 4 kg' }));
    expect(screen.getByText('Tulis alasannya dulu')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Catatan untuk petani'), 'Daun berlubang');
    const sengketa = t.konteks.db.pesanan.sengketa.length;
    await userEvent.click(screen.getByRole('button', { name: 'Konfirmasi terima 4 kg' }));
    expect(await screen.findByText(/^Kiriman diterima 4 kg\./)).toBeInTheDocument();
    expect(t.konteks.db.pesanan.sengketa).toHaveLength(sengketa + 1);
    await userEvent.click(screen.getByRole('button', { name: 'Kirim nilai' }));
    expect(screen.getByText('Pilih nilai 1 sampai 5 bintang dulu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: '5 bintang' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kirim nilai' }));
    expect(await screen.findByText('Terima kasih. Anda memberi 5 bintang.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pesan lagi' })).toBeInTheDocument();
  });

  it('petani menilai pembeli dari Kiriman saya; yang sudah dinilai tidak ditawarkan lagi', async () => {
    await buka('/pesanan/kiriman', 'petani-arif', { jam: pagi() });
    const sebelum = await screen.findByRole('region', { name: 'Sebelumnya' });
    expect(within(sebelum).getByText(/^Kamu memberi \d bintang$/)).toBeInTheDocument();
    await userEvent.click(within(sebelum).getByRole('button', { name: 'Beri nilai pembeli' }));
    const dialog = await screen.findByRole('dialog', { name: 'Beri nilai pembeli' });
    await userEvent.click(within(dialog).getByRole('radio', { name: '4 bintang' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Kirim nilai' }));
    // Data kiriman dimuat ulang: dialog tertutup dan barisnya menampilkan nilai yang diberikan.
    expect(await within(sebelum).findByText('Kamu memberi 4 bintang')).toBeInTheDocument();
    expect(within(sebelum).queryByRole('button', { name: 'Beri nilai pembeli' })).toBeNull();
  });
});

describe('gagal panen (T4.27)', () => {
  it('kabar tepat waktu tanpa catatan profil; alasan wajib', async () => {
    await buka('/pesanan/kiriman/kiriman-ratna-arif-1/gagal', 'petani-arif');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Kabari tidak sanggup kirim' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^Kabari paling lambat 3 hari sebelum jadwal kirim/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Batas kabar sudah lewat/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim kabar' }));
    expect(screen.getByText('Tulis apa yang terjadi dulu')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Apa yang terjadi?'), 'Diserang ulat');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim kabar' }));
    expect(await screen.findByText('Kabar terkirim')).toBeInTheDocument();
    expect(screen.getByText(/Tidak ada catatan di profilmu/)).toBeInTheDocument();
  });
});

describe('data usaha pembeli (T4.28)', () => {
  it('pembeli tanpa data usaha diarahkan ke formulir; setelah dikirim menunggu verifikasi', async () => {
    const { router } = await buka('/pembeli', 'pembeli-baru', {
      siapkan: (t) => {
        t.konteks.db.pengguna.profil_pembeli = t.konteks.db.pengguna.profil_pembeli.filter(
          (p) => p.pengguna_id !== 'pembeli-baru',
        );
        t.konteks.simpan();
      },
    });
    await waitFor(() => expect(router.state.location.pathname).toBe('/pembeli/daftar'));
    await userEvent.click(await screen.findByRole('button', { name: 'Kirim untuk diperiksa' }));
    expect(screen.getByText('Isi nama usaha dulu')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Nama usaha'), 'Kedai Pagi');
    await userEvent.type(screen.getByLabelText('Alamat tempat usaha'), 'Jl. Raya Lembang 5');
    await userEvent.type(screen.getByLabelText('Desa tempat usaha'), 'Lembang');
    await userEvent.click((await screen.findAllByRole('radio', { name: /^Lembang,/ }))[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Kirim untuk diperiksa' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/pembeli'));
    // Tunggu dasbor benar-benar tampil: formulir sebelumnya juga memuat teks status yang sama,
    // jadi mencari teks itu langsung bisa menemukan elemen formulir yang sedang dilepas.
    await screen.findByRole('heading', { level: 1, name: 'Pesanan aktif' });
    expect(screen.getByRole('region', { name: 'Menunggu verifikasi' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Buat pesanan' })).not.toBeInTheDocument();
  });
});
