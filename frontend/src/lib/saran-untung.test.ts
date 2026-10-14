import { describe, expect, it } from 'vitest';
import type { Ringkasan } from './ringkasan';
import { saranUntung } from './saran-untung';

const ringkasanRugi: Ringkasan = {
  panenKg: 20,
  pendapatan: 100_000,
  untung: -40_000,
  rugi: true,
  hargaJualDipakai: 5000,
  sumberHargaJual: 'isian',
  modalPerM2: 7000,
  titikImpasKg: 28,
  skenarioJelek: null,
};

const ringkasanUntungBesar: Ringkasan = {
  panenKg: 200,
  pendapatan: 1_200_000,
  untung: 700_000,
  rugi: false,
  hargaJualDipakai: 6000,
  sumberHargaJual: 'isian',
  modalPerM2: 5000,
  titikImpasKg: 84,
  skenarioJelek: null,
};

describe('saranUntung', () => {
  it('tidak memunculkan saran bila untung di atas ambang', () => {
    const hasil = saranUntung(ringkasanUntungBesar);
    expect(hasil).toEqual([]);
  });

  it('menghasilkan saran saat berpotensi rugi dan mengurutkannya berdasarkan dampak rupiah terbesar', () => {
    const hasil = saranUntung(ringkasanRugi, {
      itemBiaya: [
        { id: '1', nama: 'Tenaga tanam', grup: 'Tenaga', subtotal: 60_000 },
        { id: '2', nama: 'Pestisida nabati', grup: 'Obat', subtotal: 25_000, opsional: true },
      ],
      pesananSekitar: [
        { id: 'p1', namaPembeli: 'Kafe Daun Pagi', hargaPerKg: 8000, jumlahKg: 20 },
      ],
      umurPanenHari: 28,
    });

    expect(hasil.length).toBeGreaterThan(0);
    expect(hasil.length).toBeLessThanOrEqual(3);

    // Kenaikan harga pesanan = 20 kg * (8000 - 5000) = 60.000
    // Tenaga = 60.000
    // Opsional = 25.000
    const dampak0 = hasil[0]?.dampakRupiah ?? 0;
    const dampak1 = hasil[1]?.dampakRupiah ?? 0;
    expect(dampak0).toBeGreaterThanOrEqual(dampak1);
  });

  it('memunculkan saran tanam bertingkat bila vertikultur didukung', () => {
    const hasil = saranUntung(ringkasanRugi, {
      bisaVertikultur: true,
      faktorVertikultur: 3,
    });

    const vertikultur = hasil.find((s) => s.jenis === 'vertikultur');
    expect(vertikultur).toBeDefined();
    // Potensi = pendapatan 100.000 * (3 - 1) = 200.000
    expect(vertikultur?.dampakRupiah).toBe(200_000);
  });
});
