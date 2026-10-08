/**
 * Tes halaman gelombang 7 (T4.32, T4.35, T4.36, T4.37, D-44): halaman depan dengan angka dari
 * resep contoh, peran terisi dari halaman depan, halaman statis berlabel draf, profil dengan
 * statistik nyata, ubah profil, ganti nomor HP dengan kode ke nomor baru, serta tanggapan D-43
 * untuk pemutar (selesai ditonton lewat klien API, kontrol bisa dipakai dengan keyboard).
 */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
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

const sebagai = (id: string) => (t: Tiruan) => t.kontrol.masukSebagai(id);

describe('halaman depan (T4.32)', () => {
  it('angka contoh dari resep dan konfigurasi; tombol ke Masuk dengan peran', async () => {
    await buka('/');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Bertani itu bisa untung, asal direncanakan.',
      }),
    ).toBeInTheDocument();
    // Modal dan untung sawi 100 m² dari angkaContoh (sama dengan papan 01).
    expect((await screen.findAllByText('Rp430.000')).length).toBeGreaterThan(0);
    expect(screen.getByText('Rp320.000')).toBeInTheDocument();
    expect(screen.getByText(/impas di 86 kg/)).toBeInTheDocument();
    expect(screen.getByText(/impas di 264 kg gabah/)).toBeInTheDocument();
    // Persen uang muka dan jam periksa dari konfigurasi.
    expect(screen.getByText(/membayar uang muka 20%/)).toBeInTheDocument();
    expect(screen.getByText(/Paling lama 6 jam setelah sayur tiba/)).toBeInTheDocument();
    expect(screen.getByText(/dalam 7 hari, uang muka kembali utuh/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mulai sebagai petani' })).toHaveAttribute(
      'href',
      '/masuk?peran=petani',
    );
    expect(screen.getByRole('link', { name: 'Saya pembeli' })).toHaveAttribute(
      'href',
      '/masuk?peran=pembeli',
    );
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/masuk');
    const kaki = screen.getByRole('navigation', { name: 'Informasi Tani Muda' });
    for (const nama of [
      'Tentang Tani Muda',
      'Kontak',
      'Kebijakan privasi',
      'Aturan pakai',
      'Bantuan',
    ])
      expect(within(kaki).getByRole('link', { name: nama })).toBeInTheDocument();
  });

  it('resep contoh tidak terlihat publik: teks tetap tampil tanpa angka', async () => {
    const t = buatKlienTiruan({ tampilkanResepContoh: false, kv: null });
    const router = createMemoryRouter(daftarRute, { initialEntries: ['/'] });
    render(
      <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
        <RouterProvider router={router} />
      </PenyediaKlienApi>,
    );
    expect(await screen.findByText('Pembeli pasti dulu, baru menanam')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/membayar uang muka 20%/)).toBeInTheDocument());
    expect(screen.queryByText('Rp430.000')).not.toBeInTheDocument();
  });

  it('peran dari halaman depan terisi di Lengkapi akun', async () => {
    await buka('/masuk?peran=pembeli');
    expect(await screen.findByLabelText('Nomor HP')).toBeInTheDocument();
    expect(sessionStorage.getItem('tani-muda:peran-awal')).toBe('pembeli');
    cleanup();
    await buka('/pilih-peran', async (x) => {
      await x.klien.akun.kirimOtp({ nomor_hp: '0857 1234 5678' });
      await x.klien.akun.verifikasiOtp({
        nomor_hp: '+6285712345678',
        kode: x.kontrol.kodeUji('+6285712345678') as string,
        setuju_privasi: true,
      });
    });
    expect(await screen.findByRole('radio', { name: /^Pembeli/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});

describe('halaman statis (T4.37)', () => {
  it.each([
    ['/aturan-pakai', 'Aturan pakai'],
    ['/privasi', 'Kebijakan privasi'],
    ['/tentang', 'Tentang Tani Muda'],
    ['/kontak', 'Kontak'],
    ['/bantuan', 'Pusat bantuan'],
  ])('%s terbuka tanpa masuk dan berlabel draf', async (alamat, judul) => {
    await buka(alamat);
    expect(await screen.findByRole('heading', { level: 1, name: judul })).toBeInTheDocument();
    expect(screen.getByText('Draf, belum ditinjau ahli hukum')).toBeInTheDocument();
  });

  it('aturan pakai memakai angka konfigurasi; kontak menautkan WhatsApp admin', async () => {
    await buka('/aturan-pakai');
    expect(await screen.findByText(/uang muka 20% saat memasang pesanan/)).toBeInTheDocument();
    expect(
      screen.getByText(/paling lama 6 jam untuk pesanan rutin dan 24 jam/),
    ).toBeInTheDocument();
    expect(screen.getByText(/paling lambat 3 hari sebelum jadwal kirim/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Kontak' }));
    expect(await screen.findByText('+62 812-0000-0099')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kirim pesan WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/wa\.me\/6281200000099\?text=/),
    );
  });
});

describe('profil petani (T4.35)', () => {
  it('statistik dari data, kartu akun dan kebun tanpa kata sandi dan nama pengguna', async () => {
    await buka('/profil', sebagai('petani-arif'));
    expect(await screen.findByRole('heading', { level: 1, name: 'Profil' })).toBeInTheDocument();
    // Kiriman diterima per 5 Oktober 08.00 (jam tes); kiriman lewat batas periksa ikut terhitung.
    expect(await screen.findByText('9 kg')).toBeInTheDocument();
    expect(screen.getByText('siklus selesai').nextElementSibling).toHaveTextContent('3');
    expect(await screen.findByText('dari 1 ulasan pembeli')).toBeInTheDocument();
    expect(screen.getByText('0812••••0001')).toBeInTheDocument();
    expect(await screen.findByText('180 m² · 200 lubang · 2 lahan')).toBeInTheDocument();
    expect(screen.getByText('Belum terdaftar di kelompok tani')).toBeInTheDocument();
    expect(screen.queryByText(/Kata sandi/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nama pengguna/)).not.toBeInTheDocument();
    // Pengingat per siklus aktif, menuju pengaturan siklus itu.
    expect(
      await screen.findByRole('link', {
        name: /Sawi hijau · Kebun belakang rumah.*Pagi pukul 06\.00/,
      }),
    ).toHaveAttribute('href', '/kebun/siklus-arif-sawi/pengingat');
    // Arif tidak punya catatan admin.
    expect(screen.queryByText('Catatan dari admin')).not.toBeInTheDocument();
  });

  it('catatan admin tampil ke petani sendiri (D-03); Keluar kembali ke Masuk', async () => {
    const { router } = await buka('/profil', sebagai('petani-budi'));
    expect(await screen.findByText('Catatan dari admin')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/masuk'));
  });
});

describe('ubah profil (T4.36)', () => {
  it('nama, desa, dan kelompok tani tersimpan lewat klien API', async () => {
    const { t, router } = await buka('/profil/ubah', sebagai('petani-arif'));
    const nama = await screen.findByLabelText('Nama lengkap');
    expect(screen.queryByLabelText(/Kata sandi/)).not.toBeInTheDocument();
    await userEvent.clear(nama);
    await userEvent.type(nama, 'Arif Setiawan Putra');
    await userEvent.type(screen.getByLabelText('Desa atau kelurahan'), 'Sukajaya');
    await userEvent.click(await screen.findByRole('radio', { name: /^Sukajaya,/ }));
    expect(screen.getByText(/^Desa terpilih: Sukajaya/)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Saya terdaftar di kelompok tani/ }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(await screen.findByText('Profil tersimpan')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/profil');
    const akun = await t.klien.akun.ambil();
    expect(akun?.pengguna).toMatchObject({
      nama: 'Arif Setiawan Putra',
      terdaftar_kelompok_tani: true,
    });
    expect((await t.klien.wilayah.ambil(akun?.pengguna.wilayah_id as string)).desa).toBe(
      'Sukajaya',
    );
  });

  it('nama kosong ditolak sebelum dikirim', async () => {
    await buka('/profil/ubah', sebagai('petani-arif'));
    await userEvent.clear(await screen.findByLabelText('Nama lengkap'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(await screen.findByText('Isi nama lengkapmu')).toBeInTheDocument();
  });

  it('ganti nomor HP: nomor terpakai ditolak, lalu kode dari nomor baru', async () => {
    const { t } = await buka('/profil/ubah', sebagai('petani-arif'));
    await userEvent.click(await screen.findByRole('button', { name: 'Ganti nomor' }));
    const dialog = await screen.findByRole('dialog', { name: 'Ganti nomor HP' });
    await userEvent.type(within(dialog).getByLabelText('Nomor HP baru'), '0812 0000 0002');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Kirim kode' }));
    expect(
      await within(dialog).findByText('Nomor ini sudah dipakai akun lain'),
    ).toBeInTheDocument();

    const kolom = within(dialog).getByLabelText('Nomor HP baru');
    await userEvent.clear(kolom);
    await userEvent.type(kolom, '0857 1111 2222');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Kirim kode' }));
    expect(await within(dialog).findByText('Kode dikirim ke 0857••••2222.')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByLabelText('Angka ke-1'));
    await userEvent.paste(t.kontrol.kodeUji('+6285711112222') as string);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan nomor baru' }));
    expect(await screen.findByText('Nomor HP berhasil diganti')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect((await t.klien.akun.ambil())?.pengguna.nomor_hp).toBe('+6285711112222');
    expect(await screen.findByText('0857••••2222')).toBeInTheDocument();
  });
});

describe('pemutar modul: tanggapan D-43', () => {
  it('video habis ditonton menandai progres_modul lewat klien API, posisi di perangkat dihapus', async () => {
    localStorage.setItem(
      'tani-muda:posisi-modul:petani-arif',
      JSON.stringify({ 'modul-sawi-hidroponik-5': { detik: 8, durasi: 20 } }),
    );
    const { t } = await buka('/belajar/modul-sawi-hidroponik-5', sebagai('petani-arif'));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mengukur pH dan PPM' }),
    ).toBeInTheDocument();
    expect((await t.klien.belajar.ambilModul('modul-sawi-hidroponik-5')).selesai).toBe(false);
    fireEvent(screen.getByLabelText('Video Mengukur pH dan PPM'), new Event('ended'));
    expect(await screen.findByText('Modul ini sudah selesai')).toBeInTheDocument();
    expect((await t.klien.belajar.ambilModul('modul-sawi-hidroponik-5')).selesai).toBe(true);
    expect(localStorage.getItem('tani-muda:posisi-modul:petani-arif')).not.toContain(
      'modul-sawi-hidroponik-5',
    );
  });

  it('semua kontrol bisa dicapai dengan Tab dan dipakai dengan keyboard', async () => {
    const putar = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    await buka('/belajar/modul-sawi-hidroponik-5', sebagai('petani-arif'));
    const tombolPutar = await screen.findByRole('button', { name: 'Putar' });
    tombolPutar.focus();
    await userEvent.keyboard('{Enter}');
    expect(putar).toHaveBeenCalled();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Mundur 10 detik' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Maju 10 detik' })).toHaveFocus();
    // Penggeser posisi: input range asli dengan nama dan teks nilai untuk pembaca layar.
    const geser = screen.getByRole('slider', { name: 'Posisi video' });
    expect(geser).toHaveAttribute('aria-valuetext', expect.stringMatching(/^0:00 dari /));
    geser.focus();
    expect(geser).toHaveFocus();
    putar.mockRestore();
  });
});
