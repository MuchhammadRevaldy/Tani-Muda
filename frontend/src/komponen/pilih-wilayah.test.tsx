import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { KlienApi } from '../api/klien';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import type { Wilayah, WilayahKabupaten, WilayahKecamatan } from '../api/tipe';
import { PilihWilayah } from './pilih-wilayah';

const DAFTAR_KABUPATEN: WilayahKabupaten[] = [
  { id: '33.10', nama: 'Kabupaten Klaten', provinsi_id: '33', lintang: -7.7, bujur: 110.6 },
  { id: '33.74', nama: 'Kota Semarang', provinsi_id: '33', lintang: -7.0, bujur: 110.4 },
];

const DAFTAR_KECAMATAN_KLATEN: WilayahKecamatan[] = [
  { id: '33.10.16', nama: 'Delanggu', kabupaten_id: '33.10', lintang: -7.6, bujur: 110.7 },
  { id: '33.10.01', nama: 'Prambanan', kabupaten_id: '33.10', lintang: -7.7, bujur: 110.5 },
];

const DAFTAR_DESA_DELANGGU: Wilayah[] = [
  {
    id: '33.10.16.2001',
    desa: 'Gatak',
    kecamatan: 'Delanggu',
    kabupaten: 'Kabupaten Klaten',
    provinsi: 'Jawa Tengah',
    lintang: -7.6,
    bujur: 110.7,
    tersedia_pilot: true,
  },
  {
    id: '33.10.16.2002',
    desa: 'Delanggu',
    kecamatan: 'Delanggu',
    kabupaten: 'Kabupaten Klaten',
    provinsi: 'Jawa Tengah',
    lintang: -7.6,
    bujur: 110.7,
    tersedia_pilot: true,
  },
];

function buatKlienWilayahUji(): KlienApi {
  return {
    wilayah: {
      kabupaten: vi.fn().mockResolvedValue(DAFTAR_KABUPATEN),
      kecamatan: vi.fn().mockImplementation((kabId: string) => {
        if (kabId === '33.10') return Promise.resolve(DAFTAR_KECAMATAN_KLATEN);
        return Promise.resolve([]);
      }),
      desa: vi.fn().mockImplementation((kecId: string) => {
        if (kecId === '33.10.16') return Promise.resolve(DAFTAR_DESA_DELANGGU);
        return Promise.resolve([]);
      }),
      daftar: vi.fn().mockResolvedValue({ data: [], meta: { halaman: 1, per_halaman: 10, total: 0, halaman_terakhir: 1 } }),
      terdekat: vi.fn(),
      ambil: vi.fn(),
    },
  } as unknown as KlienApi;
}

describe('PilihWilayah', () => {
  it('urutan bertingkat: kecamatan kosong/nonaktif sebelum kabupaten dipilih, reset saat kabupaten diganti', async () => {
    const klien = buatKlienWilayahUji();
    const queryClient = buatQueryClient();
    const onChange = vi.fn();

    render(
      <PenyediaKlienApi klien={klien} queryClient={queryClient}>
        <PilihWilayah nilai={null} onChange={onChange} />
      </PenyediaKlienApi>,
    );

    // 1. Kabupaten siap dipilih setelah selesai memuat
    const tombolKab = document.getElementById('wilayah-kabupaten-tombol') as HTMLButtonElement;
    await waitFor(() => {
      expect(tombolKab).toBeEnabled();
    });

    // 2. Kecamatan & Desa awalnya nonaktif
    const tombolKec = document.getElementById('wilayah-kecamatan-tombol') as HTMLButtonElement;
    expect(tombolKec).toBeDisabled();
    const tombolDesa = document.getElementById('wilayah-desa-tombol') as HTMLButtonElement;
    expect(tombolDesa).toBeDisabled();

    // 3. Pilih Kabupaten Klaten
    await userEvent.click(tombolKab);
    const opsiKlaten = await screen.findByRole('option', { name: /kabupaten klaten/i });
    await userEvent.click(opsiKlaten);

    // Kecamatan aktif setelah kabupaten dipilih
    await waitFor(() => {
      expect(tombolKec).toBeEnabled();
    });

    // 4. Pilih Kecamatan Delanggu
    await userEvent.click(tombolKec);
    const opsiDelanggu = await screen.findByRole('option', { name: /delanggu/i });
    await userEvent.click(opsiDelanggu);

    // Desa aktif setelah kecamatan dipilih
    await waitFor(() => {
      expect(tombolDesa).toBeEnabled();
    });

    // 5. Pilih Desa Gatak
    await userEvent.click(tombolDesa);
    const opsiGatak = await screen.findByRole('option', { name: /gatak/i });
    await userEvent.click(opsiGatak);

    expect(onChange).toHaveBeenLastCalledWith('33.10.16.2001', expect.objectContaining({ desa: 'Gatak' }));

    // 6. Ganti kabupaten kembali -> kecamatan dan desa harus ter-reset
    await userEvent.click(tombolKab);
    const opsiSemarang = await screen.findByRole('option', { name: /kota semarang/i });
    await userEvent.click(opsiSemarang);

    expect(onChange).toHaveBeenLastCalledWith('', null);
  });
});
