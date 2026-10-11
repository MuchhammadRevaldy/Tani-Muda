/**
 * Tes halaman gelombang 3 (T4.10–T4.17, D-26, D-38) dan perubahan kalkulator D-38, terhadap rute
 * aplikasi dan klien tiruan sungguhan. jsdom tanpa matchMedia → tata letak HP.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { buatQueryClient, PenyediaKlienApi } from '../api/penyedia-klien';
import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';
import { tambahHari } from '../lib/tanggal';
import { tanggalLokal } from '../lib/zona-waktu';
import { daftarRute } from '../rute';

type Tiruan = ReturnType<typeof buatKlienTiruan>;
const hariIni = () => tanggalLokal(Date.now());
const SIANGI = 'siklus-arif-sawi:siangi@11';
const UKUR = 'siklus-arif-hidro:ukur-ph-ppm@20';

async function buka(
  alamat: string,
  pengguna = 'petani-arif',
  siapkan?: (t: Tiruan) => Promise<void>,
) {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  await t.kontrol.masukSebagai(pengguna);
  await siapkan?.(t);
  const router = createMemoryRouter(daftarRute, { initialEntries: [alamat] });
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={router} />
    </PenyediaKlienApi>,
  );
  return { t, router };
}

describe('menu Kebun (D-26, D-38)', () => {
  it('beberapa siklus aktif → daftar; satu siklus aktif tanpa rencana → langsung jadwal', async () => {
    await buka('/kebun');
    expect(await screen.findByRole('heading', { name: 'Sedang ditanam' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Sawi hijau/ }).length).toBeGreaterThan(1);
  });
  it('Dewi (satu siklus aktif) langsung dibawa ke jadwal padinya', async () => {
    const { router } = await buka('/kebun', 'petani-dewi');
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/kebun/siklus-dewi-padi/jadwal'),
    );
  });
  it('rencana "Nanti saja" tampil di Kebun dan penandanya di Beranda', async () => {
    await buka('/beranda', 'petani-arif', async (t) => {
      const resep = (await t.klien.resep.daftar({ komoditas_id: 'bayam' }))[0]!;
      await t.klien.kebun.buatSiklus({
        resep_id: resep.id,
        lahan_id: 'lahan-arif-kebun',
        luas_m2: 10,
        satuan_asli: 'm2',
        nilai_asli: 10,
        tanggal_tanam: null,
        dapat_subsidi: false,
        harga_jual: 6000,
        bagi_alat: true,
        jumlah_siklus_pembagian: 10,
        rencana_item: [],
      });
    });
    const tautan = await screen.findByRole('link', { name: /1 rencana belum dijadwalkan/ });
    await userEvent.click(tautan);
    expect(
      await screen.findByRole('heading', { name: 'Rencana belum dijadwalkan' }),
    ).toBeInTheDocument();
  });
});

describe('Jadwal (T4.10)', () => {
  it('kelompok terlambat, label contoh, dan filter Pengukuran kosong di bedengan', async () => {
    await buka('/kebun/siklus-arif-sawi/jadwal');
    expect(await screen.findByText(/^Terlambat · /)).toBeInTheDocument();
    expect(screen.getAllByText('CONTOH, belum divalidasi penyuluh').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Pengukuran' }));
    expect(screen.getByText(/tidak punya tugas pengukuran/)).toBeInTheDocument();
  });
});

describe('Detail tugas (T4.11)', () => {
  it('tugas terlambat: saran resep, cara mengerjakan, tunda 1 hari dari hari ini', async () => {
    const { t, router } = await buka(`/tugas/${encodeURIComponent(SIANGI)}`);
    expect(await screen.findByText('Sebaiknya dikerjakan hari ini')).toBeInTheDocument();
    expect(screen.getByText(/Cabut rumput sampai ke akarnya/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tunda 1 hari' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/kebun/siklus-arif-sawi/jadwal'),
    );
    const tugas = await t.klien.kebun.daftarTugas('siklus-arif-sawi');
    expect(tugas.find((x) => x.id === SIANGI)?.tanggal).toBe(tambahHari(hariIni(), 1));
  });
  it('tandai selesai menyimpan tugas', async () => {
    const { t, router } = await buka(`/tugas/${encodeURIComponent(SIANGI)}`);
    await userEvent.click(await screen.findByRole('button', { name: 'Tandai selesai' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/kebun/siklus-arif-sawi/jadwal'),
    );
    const tugas = await t.klien.kebun.daftarTugas('siklus-arif-sawi');
    expect(tugas.find((x) => x.id === SIANGI)?.status).toBe('selesai');
  });
});

describe('Cek pH dan PPM (T4.12)', () => {
  it('pH terlalu tinggi memberi saran resep dan membuat tugas Ukur ulang besok', async () => {
    const { t } = await buka(`/tugas/${encodeURIComponent(UKUR)}/ukur`);
    await userEvent.type(await screen.findByLabelText('pH larutan'), '7,2');
    await userEvent.type(screen.getByLabelText('PPM (kepekatan nutrisi)'), '1250');
    expect(await screen.findByText('pH terlalu tinggi')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan hasil' }));
    expect(await screen.findByText(/Tugas "Ukur ulang" dibuat/)).toBeInTheDocument();
    const tugas = await t.klien.kebun.daftarTugas('siklus-arif-hidro');
    expect(
      tugas.some((x) => x.judul.startsWith('Ukur ulang') && x.tanggal === tambahHari(hariIni(), 1)),
    ).toBe(true);
  });
  it('angka di luar skala ditolak', async () => {
    await buka(`/tugas/${encodeURIComponent(UKUR)}/ukur`);
    await userEvent.type(await screen.findByLabelText('pH larutan'), '15');
    expect(await screen.findByText(/di luar|skala/i)).toBeInTheDocument();
  });
});

describe('Pengingat per siklus (T4.14)', () => {
  it('mematikan pengingat sore lalu menyimpan', async () => {
    const { t } = await buka('/kebun/siklus-arif-sawi/pengingat');
    const sore = await screen.findByRole('switch', { name: 'Pengingat sore' });
    await userEvent.click(sore);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan pengaturan' }));
    expect(await screen.findByText('Pengaturan pengingat tersimpan.')).toBeInTheDocument();
    expect((await t.klien.kebun.ambilPengingat('siklus-arif-sawi')).pengingat_sore).toBe(false);
    expect(screen.getByText('3 tugas hari ini')).toBeInTheDocument();
  });
});

describe('Modal dan jurnal (T4.15, T4.16)', () => {
  it('catat pengeluaran NPK lebih mahal dari rencana tampil "Lebih"', async () => {
    await buka('/kebun/siklus-arif-sawi/modal');
    await userEvent.click(await screen.findByRole('button', { name: 'Catat pengeluaran' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.selectOptions(
      within(dialog).getByLabelText('Untuk item'),
      within(dialog).getByRole('option', { name: /NPK/ }),
    );
    await userEvent.type(within(dialog).getByLabelText('Nominal'), '90000');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan pengeluaran' }));
    expect(await screen.findByText('Pengeluaran tersimpan.')).toBeInTheDocument();
    expect(await screen.findByText(/^Lebih Rp/)).toBeInTheDocument();
  });
  it('jurnal per minggu dan tambah catatan', async () => {
    await buka('/kebun/siklus-arif-sawi/jurnal');
    expect(await screen.findByRole('heading', { name: 'Minggu ke-2' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tambah foto bukti' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(
      within(dialog).getByLabelText('Catatan (tidak wajib)'),
      'Daun bawah menguning',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan ke jurnal' }));
    expect(await screen.findByText('Daun bawah menguning')).toBeInTheDocument();
  });
});

describe('Ubah tanggal tanam dan akhir siklus (T4.13, T4.17)', () => {
  it('tugas belum selesai bergeser, tugas selesai tetap', async () => {
    const { t } = await buka('/kebun/siklus-arif-sawi/tanggal-tanam');
    const sebelum = await t.klien.kebun.daftarTugas('siklus-arif-sawi');
    const kolom = await screen.findByLabelText('Tanggal tanam baru');
    const lama = (kolom as HTMLInputElement).value;
    await userEvent.clear(kolom);
    await userEvent.type(kolom, tambahHari(lama, 2));
    expect(await screen.findByText('Tugas belum selesai mundur 2 hari.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan tanggal tanam' }));
    await waitFor(async () => {
      const sesudah = await t.klien.kebun.daftarTugas('siklus-arif-sawi');
      const a = sebelum.find((x) => x.id === 'siklus-arif-sawi:panen@28')!;
      expect(sesudah.find((x) => x.id === a.id)?.tanggal).toBe(tambahHari(a.tanggal, 2));
    });
    const sesudah = await t.klien.kebun.daftarTugas('siklus-arif-sawi');
    const p1 = sebelum.find((x) => x.id === 'siklus-arif-sawi:pupuk-1@7')!;
    expect(sesudah.find((x) => x.id === p1.id)?.tanggal).toBe(p1.tanggal);
  });
  it('akhiri siklus dengan pendapatan nyata', async () => {
    const { t } = await buka('/kebun/siklus-arif-sawi/akhir');
    await userEvent.type(await screen.findByLabelText('Pendapatan dari panen'), '750000');
    await userEvent.click(screen.getByRole('button', { name: 'Akhiri siklus' }));
    await waitFor(async () =>
      expect((await t.klien.kebun.ambilSiklus('siklus-arif-sawi')).status).toBe('selesai'),
    );
  });
});

describe('Kalkulator setelah D-38', () => {
  it('petani terdaftar kelompok tani: urea padi langsung bersubsidi', async () => {
    await buka('/hitung/modal?komoditas=padi&metode=sawah&nilai=1000', 'petani-dewi');
    expect((await screen.findAllByText(/Harga subsidi \(HET\)/)).length).toBeGreaterThan(0);
  });
  it('kangkung tanpa pesanan dekat memakai harga jual contoh dan menampilkan panen jelek 70%', async () => {
    await buka('/hitung/modal?komoditas=kangkung&metode=bedengan&nilai=20');
    expect(
      await screen.findByText('Harga contoh. Ubah sesuai harga di desamu.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/\(70%\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/laporan di kecamatanmu|Harga contoh resep/).length).toBeGreaterThan(
      0,
    );
  });
});
