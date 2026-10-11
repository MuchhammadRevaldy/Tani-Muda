import { describe, expect, it } from 'vitest';
import { hapusMundurOtp, isiOtp, kodeLengkap, otpKosong } from './kotak-otp';

describe('kotak OTP', () => {
  it('mengetik satu digit memindah fokus', () => {
    const h = isiOtp(otpKosong(), 0, '4');
    expect(h.digit).toEqual(['4', '', '', '', '', '']);
    expect(h.fokus).toBe(1);
  });
  it('menempel 123456 mengisi semua kotak', () => {
    const h = isiOtp(otpKosong(), 0, '123456');
    expect(kodeLengkap(h.digit)).toBe('123456');
    expect(h.fokus).toBe(5);
  });
  it('tempelan dengan spasi atau tanda hubung tetap terbaca', () => {
    expect(kodeLengkap(isiOtp(otpKosong(), 0, '123-456').digit)).toBe('123456');
  });
  it('tempelan di tengah dipotong sesuai sisa kotak', () => {
    const h = isiOtp(otpKosong(), 4, '9876');
    expect(h.digit).toEqual(['', '', '', '', '9', '8']);
    expect(h.fokus).toBe(5);
  });
  it('huruf diabaikan dan mengosongkan kotak', () => {
    const h = isiOtp(['1', '2', '', '', '', ''], 1, 'a');
    expect(h.digit[1]).toBe('');
    expect(h.fokus).toBe(1);
  });
  it('hapus mundur', () => {
    expect(hapusMundurOtp(['1', '2', '3', '', '', ''], 2)).toEqual({
      digit: ['1', '2', '', '', '', ''],
      fokus: 2,
    });
    expect(hapusMundurOtp(['1', '2', '', '', '', ''], 2)).toEqual({
      digit: ['1', '', '', '', '', ''],
      fokus: 1,
    });
    expect(hapusMundurOtp(otpKosong(), 0).fokus).toBe(0);
  });
  it('kode belum lengkap', () => {
    expect(kodeLengkap(['1', '2', '3', '4', '5', ''])).toBeNull();
  });
});
