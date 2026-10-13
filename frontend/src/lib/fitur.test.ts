import { describe, expect, it } from 'vitest';
import { fiturAktif, type NamaFitur } from './fitur';

describe('fiturAktif', () => {
  it('mengembalikan true bila nilai env kosong atau belum disetel', () => {
    expect(fiturAktif('AI', '')).toBe(true);
    expect(fiturAktif('LEVEL', undefined)).toBe(true);
  });

  it('mengembalikan true bila bernilai nyala atau true', () => {
    expect(fiturAktif('AI', 'nyala')).toBe(true);
    expect(fiturAktif('AI', 'true')).toBe(true);
    expect(fiturAktif('AI', 'TRUE')).toBe(true);
    expect(fiturAktif('AI', '1')).toBe(true);
  });

  it('mengembalikan false bila bernilai mati, false, atau 0', () => {
    expect(fiturAktif('AI', 'mati')).toBe(false);
    expect(fiturAktif('AI', 'MATI')).toBe(false);
    expect(fiturAktif('AI', 'false')).toBe(false);
    expect(fiturAktif('AI', '0')).toBe(false);
  });

  it('mendukung semua nama fitur Tahap 7', () => {
    const semuaFitur: NamaFitur[] = [
      'AI',
      'SARAN_UNTUNG',
      'TANAMAN_BARU',
      'LEVEL',
      'DETEKSI',
      'CHATBOT',
      'CUACA',
      'STOK',
      'PETA',
      'CHAT',
      'HARGA_BERITA',
      'SARAN_HARIAN',
    ];

    for (const nama of semuaFitur) {
      expect(fiturAktif(nama, 'nyala')).toBe(true);
      expect(fiturAktif(nama, 'mati')).toBe(false);
    }
  });
});
