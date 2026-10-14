import { describe, expect, it } from 'vitest';
import kasusCuaca from '../../../shared/kasus-uji/cuaca.json';
import { kecocokanSuhu, type RentangSuhuResep } from './suhu';

describe('kecocokanSuhu', () => {
  it('memenuhi seluruh kasus uji bersama di shared/kasus-uji/cuaca.json', () => {
    for (const kasus of kasusCuaca.kasus) {
      const { suhu, rentang } = kasus.masukan as {
        suhu: number | null;
        rentang: RentangSuhuResep | null;
      };
      const hasil = kecocokanSuhu(suhu, rentang);
      const harapan = kasus.keluaran;

      expect(hasil.status, `Gagal status pada: ${kasus.nama}`).toBe(harapan.status);
      expect(hasil.label, `Gagal label pada: ${kasus.nama}`).toBe(harapan.label);
      expect(hasil.cocok, `Gagal cocok pada: ${kasus.nama}`).toBe(harapan.cocok);
      expect(hasil.saran, `Gagal saran pada: ${kasus.nama}`).toBe(harapan.saran);
    }
  });
});
