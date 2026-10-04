import { describe, expect, it } from 'vitest';
import type { LaporanHarga, MerekInput } from '../tipe';
import { CONTOH_KELAYAKAN_SUBSIDI } from './fixtures/contoh-resep';
import {
  cariKelayakanSubsidi,
  hargaPerSatuan,
  hargaSatuanEfektif,
  rataRataSekitar,
  urutkanMerek,
  validasiMerekLain,
  type KonteksSubsidi,
} from './harga-item';
import { pastikan } from './hasil';

const konteks = (sebagian: Partial<KonteksSubsidi> = {}): KonteksSubsidi => ({
  dapatJatahSubsidi: true,
  komoditasId: 'padi',
  tanggal: '2026-10-05',
  kelayakan: CONTOH_KELAYAKAN_SUBSIDI,
  ...sebagian,
});

describe('subsidi (P0-09)', () => {
  it('urea untuk padi layak dalam rentang tanggal', () => {
    expect(
      cariKelayakanSubsidi('urea', 'padi', '2026-10-05', CONTOH_KELAYAKAN_SUBSIDI)?.hetPerSatuan,
    ).toBe(2250);
  });
  it.each([
    ['urea', 'padi', '2027-01-01'],
    ['urea', 'padi', '2025-12-31'],
    ['urea', 'sawi', '2026-10-05'],
    [undefined, 'padi', '2026-10-05'],
  ])('%s untuk %s pada %s tidak layak', (input, komoditas, tanggal) => {
    expect(cariKelayakanSubsidi(input, komoditas, tanggal, CONTOH_KELAYAKAN_SUBSIDI)).toBeNull();
  });
  it('dapat jatah → harga subsidi; tidak dapat jatah → nonsubsidi', () => {
    const item = { inputId: 'urea', hargaContoh: 9000 };
    expect(pastikan(hargaSatuanEfektif(item, konteks()))).toEqual({
      harga: 2250,
      sumber: 'subsidi',
      layakSubsidi: true,
    });
    expect(pastikan(hargaSatuanEfektif(item, konteks({ dapatJatahSubsidi: false })))).toEqual({
      harga: 9000,
      sumber: 'contoh_resep',
      layakSubsidi: true,
    });
  });
  it('di luar rentang tanggal → nonsubsidi walau dapat jatah', () => {
    expect(
      pastikan(
        hargaSatuanEfektif(
          { inputId: 'urea', hargaContoh: 9000 },
          konteks({ tanggal: '2027-02-01' }),
        ),
      ).sumber,
    ).toBe('contoh_resep');
  });
  it('petani memilih Nonsubsidi untuk satu item', () => {
    const h = pastikan(
      hargaSatuanEfektif({ inputId: 'urea', hargaContoh: 9000, pilihSubsidi: false }, konteks()),
    );
    expect(h).toEqual({ harga: 9000, sumber: 'contoh_resep', layakSubsidi: true });
  });
});

describe('urutan prioritas harga', () => {
  const k = konteks({ dapatJatahSubsidi: false });
  it.each([
    [
      {
        hargaContoh: 15000,
        hargaIsiSendiri: 14000,
        merekTerpilih: { hargaKemasan: 380000, isiKemasan: 25 },
        rataRataSekitar: 15500,
      },
      14000,
      'isi_sendiri',
    ],
    [
      {
        hargaContoh: 15000,
        merekTerpilih: { hargaKemasan: 380000, isiKemasan: 25 },
        rataRataSekitar: 15500,
      },
      15200,
      'merek',
    ],
    [{ hargaContoh: 15000, rataRataSekitar: 15500 }, 15500, 'rata_sekitar'],
    [{ hargaContoh: 15000 }, 15000, 'contoh_resep'],
    [{ hargaContoh: null }, null, 'belum_ada'],
    [{ hargaContoh: 15000, hargaIsiSendiri: 0 }, 0, 'isi_sendiri'],
  ])('%#', (item, harga, sumber) => {
    const h = pastikan(hargaSatuanEfektif(item, k));
    expect(h.harga).toBe(harga);
    expect(h.sumber).toBe(sumber);
  });
  it('harga negatif ditolak', () => {
    expect(hargaSatuanEfektif({ hargaContoh: 1, hargaIsiSendiri: -1 }, k)).toEqual({
      ok: false,
      galat: 'HARGA_NEGATIF',
    });
    expect(
      hargaSatuanEfektif(
        { hargaContoh: 1, merekTerpilih: { hargaKemasan: 1000, isiKemasan: 0 } },
        k,
      ),
    ).toEqual({
      ok: false,
      galat: 'ISI_KEMASAN_KOSONG',
    });
  });
});

describe('hargaPerSatuan', () => {
  it.each([
    [380000, 25, 15200],
    [25000, 1, 25000],
    [0, 5, 0],
  ])('%s / %s = %s', (h, isi, hasil) => {
    expect(hargaPerSatuan(h, isi)).toEqual({ ok: true, nilai: hasil });
  });
  it('galat', () => {
    expect(hargaPerSatuan(-1, 25)).toEqual({ ok: false, galat: 'HARGA_NEGATIF' });
    expect(hargaPerSatuan(1000, 0)).toEqual({ ok: false, galat: 'ISI_KEMASAN_KOSONG' });
  });
});

const MEREK: MerekInput[] = [
  { id: 'a', inputId: 'npk-16', nama: 'Daun Lebat', isiKemasan: 25, teksKemasan: '25 kg' },
  { id: 'b', inputId: 'npk-16', nama: 'Bumi Hijau', isiKemasan: 25, teksKemasan: '25 kg' },
  { id: 'c', inputId: 'npk-16', nama: 'Sari Tani', isiKemasan: 5, teksKemasan: '5 kg' },
  { id: 'd', inputId: 'npk-16', nama: 'Belum Dilaporkan', isiKemasan: 25, teksKemasan: '25 kg' },
];
const lap = (
  id: string,
  merekId: string,
  hargaKemasan: number,
  tanggal: string,
  pelaporId: string,
  kecamatan = 'Lembang',
): LaporanHarga => ({
  id,
  merekId,
  hargaKemasan,
  tanggal,
  pelaporId,
  kecamatan,
});
const LAPORAN: LaporanHarga[] = [
  lap('1', 'a', 380000, '2026-09-23', 'p1'),
  lap('2', 'a', 375000, '2026-09-20', 'p2'),
  lap('3', 'b', 355000, '2026-10-01', 'p3'),
  lap('4', 'c', 80000, '2026-09-23', 'p4'),
  lap('5', 'c', 82000, '2026-09-10', 'p4'),
  lap('6', 'c', 79000, '2026-09-23', 'p5'),
  lap('7', 'a', 300000, '2026-10-04', 'p6', 'Cisarua'),
];

describe('urutkanMerek (P0-34)', () => {
  it('menurut laporan terbaru, lalu jumlah pelapor, lalu nama; tanpa laporan di akhir', () => {
    const r = urutkanMerek(MEREK, LAPORAN, 'Lembang', '2026-10-05');
    // a dan c sama-sama terbaru 23 Sep dengan 2 pelapor → urut nama (Daun Lebat, Sari Tani)
    expect(r.map((m) => m.merek.id)).toEqual(['b', 'a', 'c', 'd']);
    expect(r[0]).toMatchObject({
      hargaKemasan: 355000,
      hargaPerSatuan: 14200,
      jumlahPelapor: 1,
      hariLalu: 4,
    });
    expect(r[1]).toMatchObject({ hargaKemasan: 380000, jumlahPelapor: 2, hariLalu: 12 });
    expect(r[3]).toMatchObject({
      hargaKemasan: null,
      hargaPerSatuan: null,
      jumlahPelapor: 0,
      hariLalu: null,
    });
  });
  it('tanggal sama → lebih banyak pelapor di depan', () => {
    const tambah = [...LAPORAN, lap('9', 'c', 81000, '2026-09-15', 'p8')];
    expect(urutkanMerek(MEREK, tambah, 'Lembang', '2026-10-05').map((m) => m.merek.id)).toEqual([
      'b',
      'c',
      'a',
      'd',
    ]);
  });
  it('laporan kecamatan lain dan laporan dari masa depan diabaikan', () => {
    const r = urutkanMerek(
      MEREK,
      [...LAPORAN, lap('8', 'd', 1, '2026-10-09', 'p7')],
      'Lembang',
      '2026-10-05',
    );
    expect(r.find((m) => m.merek.id === 'a')?.hargaKemasan).toBe(380000);
    expect(r.find((m) => m.merek.id === 'd')?.hargaKemasan).toBeNull();
  });
  it('promo tidak mengubah urutan (P0-35)', () => {
    const denganPromo = MEREK.map((m) => ({ ...m, adaPromo: m.id === 'd' }));
    expect(
      urutkanMerek(denganPromo, LAPORAN, 'Lembang', '2026-10-05').map((m) => m.merek.id),
    ).toEqual(urutkanMerek(MEREK, LAPORAN, 'Lembang', '2026-10-05').map((m) => m.merek.id));
  });
  it('nama sama-sama tanpa laporan diurutkan menurut nama', () => {
    const r = urutkanMerek(
      [MEREK[3]!, { ...MEREK[3]!, id: 'e', nama: 'Abadi' }],
      [],
      'Lembang',
      '2026-10-05',
    );
    expect(r.map((m) => m.merek.nama)).toEqual(['Abadi', 'Belum Dilaporkan']);
  });
});

describe('rataRataSekitar (P1-02)', () => {
  it('rata-rata harga per satuan dalam 30 hari di kecamatan yang sama', () => {
    // a: 15.200, 15.000; b: 14.200; c: 16.000, 16.400, 15.800 → rata 15.433,33
    expect(
      rataRataSekitar(LAPORAN, MEREK, 'Lembang', '2026-10-05', {
        rentangHari: 30,
        minimalLaporan: 3,
      }),
    ).toBe(15433);
  });
  it('kurang dari minimal laporan → null', () => {
    expect(
      rataRataSekitar(LAPORAN, MEREK, 'Cisarua', '2026-10-05', {
        rentangHari: 30,
        minimalLaporan: 3,
      }),
    ).toBeNull();
    expect(
      rataRataSekitar(LAPORAN, MEREK, 'Lembang', '2026-10-05', {
        rentangHari: 2,
        minimalLaporan: 1,
      }),
    ).toBeNull();
  });
});

describe('validasiMerekLain', () => {
  it('valid menjadi laporan harga baru', () => {
    expect(
      validasiMerekLain({ namaMerek: ' Pupuk Desa ', isiKemasan: 50, hargaKemasan: 600000 }),
    ).toEqual({
      ok: true,
      nilai: {
        namaMerek: 'Pupuk Desa',
        isiKemasan: 50,
        hargaKemasan: 600000,
        hargaPerSatuan: 12000,
      },
    });
  });
  it.each([
    [{ namaMerek: '  ', isiKemasan: 50, hargaKemasan: 1 }, 'NAMA_KOSONG'],
    [{ namaMerek: 'X', isiKemasan: 0, hargaKemasan: 1 }, 'ISI_KEMASAN_KOSONG'],
    [{ namaMerek: 'X', isiKemasan: 5, hargaKemasan: -1 }, 'HARGA_NEGATIF'],
  ])('%j → %s', (m, galat) => {
    expect(validasiMerekLain(m)).toEqual({ ok: false, galat });
  });
});
