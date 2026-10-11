import { describe, expect, it } from 'vitest';
import { SEMUA_CONTOH_RESEP } from './fixtures/contoh-resep';
import { CONTOH_RESEP_SAWI_BEDENGAN } from './fixtures/contoh-resep-sawi-bedengan';
import { CONTOH_RESEP_SAWI_HIDROPONIK } from './fixtures/contoh-resep-sawi-hidroponik';
import { validasiResep } from './validasi-resep';

const sawi = CONTOH_RESEP_SAWI_BEDENGAN;

describe('validasi resep editor mentor (T4.39)', () => {
  it('semua resep contoh sah', () => {
    for (const r of SEMUA_CONTOH_RESEP) expect(validasiResep(r), r.id).toEqual([]);
  });

  it('hasil, umur, dan persen panen jelek', () => {
    expect(
      validasiResep({ ...sawi, hasilPerSatuan: 0, umurPanenHari: 28.5, persenPanenJelek: 120 }),
    ).toEqual([
      { kolom: 'hasilPerSatuan', kode: 'HASIL_KOSONG' },
      { kolom: 'umurPanenHari', kode: 'UMUR_PANEN_TIDAK_VALID' },
      { kolom: 'persenPanenJelek', kode: 'PERSEN_PANEN_JELEK_TIDAK_VALID' },
    ]);
  });

  it('HST tugas sekali tidak boleh melewati umur panen; HST negatif ditolak', () => {
    const tugas = [...sawi.tugas];
    tugas[0] = { ...tugas[0]!, hstMulai: 40 };
    tugas[1] = { ...tugas[1]!, hstMulai: -1 };
    expect(validasiResep({ ...sawi, tugas })).toEqual([
      { kolom: 'tugas', indeks: 0, bagian: 'hstMulai', kode: 'HST_TIDAK_VALID' },
      { kolom: 'tugas', indeks: 1, bagian: 'hstMulai', kode: 'HST_TIDAK_VALID' },
    ]);
  });

  it('tugas berulang: interval > 0 dan HST selesai tidak sebelum HST mulai', () => {
    const i = sawi.tugas.findIndex((t) => t.tipe === 'berulang');
    const tugas = [...sawi.tugas];
    tugas[i] = { ...tugas[i]!, interval: 0 };
    expect(validasiResep({ ...sawi, tugas })).toEqual([
      { kolom: 'tugas', indeks: i, bagian: 'interval', kode: 'INTERVAL_TIDAK_VALID' },
    ]);
    tugas[i] = { ...sawi.tugas[i]!, hstMulai: 3, hstSelesai: 1 };
    expect(validasiResep({ ...sawi, tugas })[0]).toMatchObject({ kode: 'HST_TIDAK_VALID' });
  });

  it('batas bawah tidak boleh di atas batas atas atau di luar skala', () => {
    const r = CONTOH_RESEP_SAWI_HIDROPONIK;
    const i = r.tugas.findIndex((t) => t.tipe === 'ukur');
    const ukur = [...r.tugas[i]!.ukur!];
    ukur[0] = { ...ukur[0]!, batasBawah: 7, batasAtas: 6 };
    const tugas = [...r.tugas];
    tugas[i] = { ...tugas[i]!, ukur };
    expect(validasiResep({ ...r, tugas })).toEqual([
      { kolom: 'tugas', indeks: i, bagian: 'ukur.0', kode: 'BATAS_UKUR_TIDAK_VALID' },
    ]);
    ukur[0] = { ...r.tugas[i]!.ukur![0]!, batasAtas: 15, skalaMaks: 14 };
    expect(validasiResep({ ...r, tugas })[0]?.kode).toBe('BATAS_UKUR_TIDAK_VALID');
  });

  it('input: nama, dosis, kemasan, harga; tanpa tugas ditolak', () => {
    const input = [...sawi.input];
    input[0] = { ...input[0]!, nama: ' ', dosis: -1, ukuranKemasan: 0, hargaContoh: -5 };
    expect(validasiResep({ ...sawi, input, tugas: [] })).toEqual([
      { kolom: 'input', indeks: 0, bagian: 'nama', kode: 'NAMA_ITEM_KOSONG' },
      { kolom: 'input', indeks: 0, bagian: 'dosis', kode: 'DOSIS_NEGATIF' },
      { kolom: 'input', indeks: 0, bagian: 'ukuranKemasan', kode: 'KEMASAN_TIDAK_VALID' },
      { kolom: 'input', indeks: 0, bagian: 'hargaContoh', kode: 'HARGA_NEGATIF' },
      { kolom: 'tugas', kode: 'TUGAS_TIDAK_ADA' },
    ]);
  });
});
