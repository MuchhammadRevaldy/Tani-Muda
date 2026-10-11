import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GalatApi } from '../galat';
import type { KlienApi } from '../klien';
import {
  bolehUlang,
  buatQueryClient,
  PenyediaKlienApi,
  useKontrolPengembangan,
  useSumberData,
} from '../penyedia-klien';
import { klienBelumTersedia, siapkanKlien } from '../sumber';
import { useKomoditas, useMintaResep } from './index';

const KOMODITAS = [{ id: 'sawi', nama: 'Sawi hijau', status_resep: 'tersedia' }];

function klienPalsu(): KlienApi {
  return {
    referensi: { komoditas: vi.fn().mockResolvedValue(KOMODITAS) },
    resep: { minta: vi.fn().mockResolvedValue({ permintaan: { id: 'p1' }, sudah_diminta: false }) },
  } as unknown as KlienApi;
}

function DaftarKomoditas() {
  const { data, error, isPending } = useKomoditas();
  const minta = useMintaResep();
  const sumber = useSumberData();
  const kontrol = useKontrolPengembangan();
  if (isPending) return <p>memuat</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return (
    <div>
      <p>{sumber}</p>
      <p>{kontrol ? 'ada kontrol' : 'tanpa kontrol'}</p>
      <ul>
        {data?.map((k) => (
          <li key={k.id}>{k.nama}</li>
        ))}
      </ul>
      <button type="button" onClick={() => minta.mutate({ komoditas_id: 'tomat' })}>
        Minta resep
      </button>
      {minta.isSuccess ? <p>tercatat</p> : null}
    </div>
  );
}

describe('hook kueri dengan klien yang disuntikkan', () => {
  it('useKomoditas membaca dari klien API, mutasi berjalan', async () => {
    const klien = klienPalsu();
    render(
      <PenyediaKlienApi klien={klien} queryClient={buatQueryClient()}>
        <DaftarKomoditas />
      </PenyediaKlienApi>,
    );
    expect(await screen.findByText('Sawi hijau')).toBeInTheDocument();
    expect(screen.getByText('tiruan')).toBeInTheDocument();
    expect(screen.getByText('tanpa kontrol')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Minta resep' }));
    expect(await screen.findByText('tercatat')).toBeInTheDocument();
    expect(klien.resep.minta).toHaveBeenCalledWith({ komoditas_id: 'tomat' });
  });

  it('galat API ditampilkan dengan pesan Indonesia dan galat 4xx tidak diulang', async () => {
    const klien = {
      referensi: {
        komoditas: vi
          .fn()
          .mockRejectedValue(new GalatApi('BELUM_MASUK', 'Masuk dulu dengan nomor HP')),
      },
    } as unknown as KlienApi;
    render(
      <PenyediaKlienApi klien={klien}>
        <DaftarKomoditas />
      </PenyediaKlienApi>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Masuk dulu dengan nomor HP');
    expect(klien.referensi.komoditas).toHaveBeenCalledTimes(1);
  });

  it('hook di luar penyedia memberi galat yang jelas', () => {
    const galat = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<DaftarKomoditas />)).toThrow('PenyediaKlienApi');
    galat.mockRestore();
  });
});

describe('aturan ulang dan pemilihan sumber data', () => {
  it('bolehUlang', () => {
    expect(bolehUlang(0, new GalatApi('VALIDASI', 'x'))).toBe(false);
    expect(bolehUlang(0, new GalatApi('GALAT_SERVER', 'x'))).toBe(true);
    expect(bolehUlang(2, new Error('jaringan'))).toBe(false);
  });
  it('sumber http belum tersedia → galat SUMBER_BELUM_TERSEDIA', async () => {
    const s = await siapkanKlien({ VITE_SUMBER_DATA: 'http' });
    expect(s).toMatchObject({ sumber: 'http', kontrol: null });
    await expect(s.klien.akun.ambil()).rejects.toMatchObject({
      kode: 'SUMBER_BELUM_TERSEDIA',
      status: 503,
    });
    await expect(klienBelumTersedia().lahan.daftar()).rejects.toBeInstanceOf(GalatApi);
  });
  // Tes ini sengaja memuat modul klien tiruan secara dinamis dan memakai latensi buatan mode
  // pengembangan (200–400 ms per panggilan), sekitar 2 detik saat mesin sepi. Batas 5 detik bawaan
  // bisa terlewati saat coverage atau proses lain berjalan, jadi batasnya dinaikkan khusus di sini.
  it(
    'sumber tiruan bawaan; kontrol hanya di mode pengembangan; resep contoh mengikuti env',
    { timeout: 20_000 },
    async () => {
      const dev = await siapkanKlien({ DEV: true, VITE_TAMPILKAN_RESEP_CONTOH: 'true' });
      expect(dev.sumber).toBe('tiruan');
      expect(dev.kontrol).not.toBeNull();
      const prod = await siapkanKlien({ DEV: false, MODE: 'production' });
      expect(prod.kontrol).toBeNull();
      // Build demo (D-48): kontrol demo ikut walau bukan mode pengembangan.
      const demo = await siapkanKlien({ DEV: false, MODE: 'demo' });
      expect(demo.kontrol).not.toBeNull();
      await dev.kontrol!.masukSebagai('petani-budi');
      await waitFor(async () => expect((await dev.klien.resep.daftar()).length).toBeGreaterThan(0));
      await dev.kontrol!.aturUlang();
    },
  );
});
