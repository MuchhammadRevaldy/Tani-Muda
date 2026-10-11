import { describe, expect, it } from 'vitest';
import { ukuranKecil } from './kecilkan-foto';

describe('ukuranKecil', () => {
  it('foto HP 4000×3000 menjadi 1280×960; tegak juga dibatasi sisi terpanjang', () => {
    expect(ukuranKecil(4000, 3000)).toEqual({ lebar: 1280, tinggi: 960 });
    expect(ukuranKecil(3000, 4000)).toEqual({ lebar: 960, tinggi: 1280 });
  });
  it('foto kecil tidak diperbesar; tepat di batas tetap', () => {
    expect(ukuranKecil(800, 600)).toEqual({ lebar: 800, tinggi: 600 });
    expect(ukuranKecil(1280, 720)).toEqual({ lebar: 1280, tinggi: 720 });
  });
  it('ukuran tidak sah → nol; sisi sangat tipis tetap minimal 1 piksel', () => {
    expect(ukuranKecil(0, 100)).toEqual({ lebar: 0, tinggi: 0 });
    expect(ukuranKecil(100000, 10, 1280)).toEqual({ lebar: 1280, tinggi: 1 });
  });
});
