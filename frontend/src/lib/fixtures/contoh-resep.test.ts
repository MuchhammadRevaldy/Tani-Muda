import { describe, expect, it } from 'vitest';
import { CONTOH_KOMODITAS, CONTOH_METODE } from './contoh-referensi';
import { SEMUA_CONTOH_RESEP } from './contoh-resep';

describe('fixture CONTOH resep konsisten', () => {
  it.each(SEMUA_CONTOH_RESEP.map((r) => [r.id, r] as const))('%s', (_id, r) => {
    // label contoh dan status draf (D-10, D-11)
    expect(r.contoh).toBe(true);
    expect(r.status).toBe('draf');
    expect(r.validator).toBeNull();
    expect(['desain', 'dikarang']).toContain(r.asalAngkaContoh);
    // rujukan valid
    expect(CONTOH_KOMODITAS.some((k) => k.id === r.komoditasId)).toBe(true);
    expect(CONTOH_METODE.some((m) => m.id === r.metodeId)).toBe(true);
    expect(r.hasilPerSatuan).toBeGreaterThan(0);
    // HST semua tugas ≤ umur panen
    for (const t of r.tugas) {
      expect(t.hstMulai).toBeGreaterThanOrEqual(0);
      expect(t.hstSelesai ?? t.hstMulai).toBeLessThanOrEqual(r.umurPanenHari);
      if (t.tipe !== 'sekali') expect(t.interval).toBeGreaterThan(0);
      if (t.tipe === 'ukur') expect(t.ukur?.length).toBeGreaterThan(0);
    }
    // ID unik
    expect(new Set(r.input.map((i) => i.id)).size).toBe(r.input.length);
    expect(new Set(r.tugas.map((t) => t.id)).size).toBe(r.tugas.length);
  });
  it('angka bayam dan kangkung ditandai dikarang (D-34)', () => {
    const dikarang = SEMUA_CONTOH_RESEP.filter((r) => r.asalAngkaContoh === 'dikarang').map(
      (r) => r.komoditasId,
    );
    expect(dikarang).toEqual(['bayam', 'kangkung']);
  });
  it('hidroponik hanya untuk sawi (D-05)', () => {
    const hidro = SEMUA_CONTOH_RESEP.filter((r) => r.metodeId === 'hidroponik');
    expect(hidro.map((r) => r.komoditasId)).toEqual(['sawi']);
  });
});
