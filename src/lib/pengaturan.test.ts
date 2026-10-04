import { describe, expect, it } from 'vitest';
import { bacaTampilkanResepContoh } from './pengaturan';
import { gagal, pastikan, berhasil } from './hasil';

describe('bacaTampilkanResepContoh (D-12)', () => {
  it.each([
    ['true', true],
    ['', false],
    [undefined, false],
    [null, false],
    ['TRUE', false],
    ['1', false],
    ['ya', false],
    [' true', false],
  ])('%j → %s', (nilai, hasil) => {
    expect(bacaTampilkanResepContoh(nilai)).toBe(hasil);
  });
});

describe('hasil', () => {
  it('pastikan mengambil nilai atau melempar', () => {
    expect(pastikan(berhasil(5))).toBe(5);
    expect(() => pastikan(gagal('UKURAN_KOSONG'))).toThrow('UKURAN_KOSONG');
  });
});
