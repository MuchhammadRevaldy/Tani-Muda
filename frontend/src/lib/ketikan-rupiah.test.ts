import { describe, expect, it } from 'vitest';
import {
  MAKS_DIGIT_RUPIAH,
  olahKetikanRupiah,
  posisiSetelahDigit,
  tampilanRupiah,
} from './ketikan-rupiah';

describe('olahKetikanRupiah', () => {
  it('mengetik 5000 menjadi 5.000', () => {
    expect(olahKetikanRupiah('5000')).toEqual({
      nilai: 5000,
      tampil: '5.000',
      digitSebelumKursor: 4,
    });
  });
  it('menempel angka berformat', () => {
    expect(olahKetikanRupiah('1.250.000').nilai).toBe(1250000);
    expect(olahKetikanRupiah('Rp 1.250.000').tampil).toBe('1.250.000');
  });
  it('membuang nol di depan dan menyesuaikan kursor', () => {
    const h = olahKetikanRupiah('0050', 3);
    expect(h.nilai).toBe(50);
    expect(h.digitSebelumKursor).toBe(1);
  });
  it('nol tunggal tetap nol', () => {
    expect(olahKetikanRupiah('0').nilai).toBe(0);
  });
  it('kosong menjadi null', () => {
    expect(olahKetikanRupiah('')).toEqual({ nilai: null, tampil: '', digitSebelumKursor: 0 });
    expect(olahKetikanRupiah('abc').nilai).toBeNull();
  });
  it('dibatasi 13 digit', () => {
    const h = olahKetikanRupiah('12345678901234567');
    expect(String(h.nilai).length).toBe(MAKS_DIGIT_RUPIAH);
    expect(h.digitSebelumKursor).toBe(MAKS_DIGIT_RUPIAH);
  });
  it('menghapus di tengah: kursor tetap di posisi digit yang benar', () => {
    // "12.500" lalu hapus "2" (kursor setelah "1"): teks mentah "1.500", kursor 1
    const h = olahKetikanRupiah('1.500', 1);
    expect(h.tampil).toBe('1.500');
    expect(h.digitSebelumKursor).toBe(1);
  });
  it('kursor negatif atau melewati panjang aman', () => {
    expect(olahKetikanRupiah('500', -3).digitSebelumKursor).toBe(0);
    expect(olahKetikanRupiah('500', 99).digitSebelumKursor).toBe(3);
  });
});

describe('posisiSetelahDigit', () => {
  it('melewati titik ribuan', () => {
    expect(posisiSetelahDigit('12.500', 2)).toBe(2);
    expect(posisiSetelahDigit('12.500', 3)).toBe(4);
    expect(posisiSetelahDigit('12.500', 0)).toBe(0);
    expect(posisiSetelahDigit('12.500', 9)).toBe(6);
  });
});

describe('tampilanRupiah', () => {
  it('membulatkan dan memberi titik', () => {
    expect(tampilanRupiah(12500.4)).toBe('12.500');
    expect(tampilanRupiah(null)).toBe('');
    expect(tampilanRupiah(undefined)).toBe('');
    expect(tampilanRupiah(Number.NaN)).toBe('');
  });
});
