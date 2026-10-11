import { describe, expect, it } from 'vitest';
import { OtpTiruan } from './otp/otp-tiruan';
import { ATURAN_OTP } from './otp/penyedia-otp';
import { keadaanPembayaranKosong, PembayaranTiruan } from './pembayaran/pembayaran-tiruan';

const NOMOR = '+6281200000001';

function siapkanOtp() {
  let sekarang = Date.parse('2026-10-05T01:00:00Z');
  const otp = new OtpTiruan(
    () => sekarang,
    () => '123456',
  );
  return { otp, maju: (detik: number) => (sekarang += detik * 1000) };
}

describe('OtpTiruan (aturan backend, T3.11)', () => {
  it('kode benar diterima sekali; kode hanya disimpan sebagai hash', async () => {
    const { otp } = siapkanOtp();
    const kirim = await otp.kirimKode(NOMOR);
    expect(kirim).toEqual({
      ok: true,
      nilai: { kirimUlangDalamDetik: 60, kedaluwarsaDalamDetik: 300 },
    });
    expect(JSON.stringify(kirim)).not.toContain('123456');
    const hash = otp.hashTersimpan(NOMOR);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain('123456');
    expect(otp.kodeUji(NOMOR)).toBe('123456');
    expect(await otp.verifikasi(NOMOR, '123456')).toEqual({ ok: true, nilai: true });
    expect(await otp.verifikasi(NOMOR, '123456')).toEqual({ ok: false, galat: 'OTP_KEDALUWARSA' });
    expect(otp.kodeUji(NOMOR)).toBeNull();
  });
  it('kedaluwarsa tepat di menit ke-5', async () => {
    const { otp, maju } = siapkanOtp();
    await otp.kirimKode(NOMOR);
    maju(ATURAN_OTP.kedaluwarsaDetik - 1);
    expect((await otp.verifikasi(NOMOR, '000000')).ok).toBe(false);
    const lagi = siapkanOtp();
    await lagi.otp.kirimKode(NOMOR);
    lagi.maju(ATURAN_OTP.kedaluwarsaDetik - 1);
    expect(await lagi.otp.verifikasi(NOMOR, '123456')).toEqual({ ok: true, nilai: true });
    const habis = siapkanOtp();
    await habis.otp.kirimKode(NOMOR);
    habis.maju(ATURAN_OTP.kedaluwarsaDetik);
    expect(await habis.otp.verifikasi(NOMOR, '123456')).toEqual({
      ok: false,
      galat: 'OTP_KEDALUWARSA',
    });
  });
  it('percobaan ke-6 ditolak walau kodenya benar', async () => {
    const { otp } = siapkanOtp();
    await otp.kirimKode(NOMOR);
    for (let i = 1; i <= 4; i++)
      expect(await otp.verifikasi(NOMOR, '999999')).toEqual({ ok: false, galat: 'OTP_SALAH' });
    expect(await otp.verifikasi(NOMOR, '999999')).toEqual({ ok: false, galat: 'OTP_TERKUNCI' });
    expect(await otp.verifikasi(NOMOR, '123456')).toEqual({ ok: false, galat: 'OTP_TERKUNCI' });
  });
  it('kirim ulang setelah 60 detik, paling banyak 5 per jam', async () => {
    const { otp, maju } = siapkanOtp();
    await otp.kirimKode(NOMOR);
    maju(30);
    expect(await otp.kirimKode(NOMOR)).toEqual({
      ok: false,
      galat: 'TERLALU_SERING',
      cobaLagiDalamDetik: 30,
    });
    for (let i = 2; i <= 5; i++) {
      maju(60);
      expect((await otp.kirimKode(NOMOR)).ok).toBe(true);
    }
    maju(60);
    const r = await otp.kirimKode(NOMOR);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.galat).toBe('TERLALU_SERING');
    maju(3600);
    expect((await otp.kirimKode(NOMOR)).ok).toBe(true);
  });
  it('tanpa kode terkirim → kedaluwarsa; kode acak 6 digit', async () => {
    const otp = new OtpTiruan(() => 0);
    expect(await otp.verifikasi(NOMOR, '123456')).toEqual({ ok: false, galat: 'OTP_KEDALUWARSA' });
    await otp.kirimKode(NOMOR);
    expect(otp.kodeUji(NOMOR)).toMatch(/^\d{6}$/);
    expect(otp.hashTersimpan('+620')).toBeNull();
  });
});

describe('PembayaranTiruan (T3.11)', () => {
  it('tahan lalu cairkan dan kembalikan; referensi TIRUAN-', async () => {
    const p = new PembayaranTiruan(keadaanPembayaranKosong());
    expect(p.modeUjiCoba).toBe(true);
    const t = await p.tahan({ nominal: 120000, keterangan: 'uang muka', kunciIdempoten: 'k1' });
    if (!t.ok) throw new Error('gagal');
    expect(t.nilai.referensi).toBe('TIRUAN-000001');
    expect(await p.cairkan(t.nilai.referensi, 10000)).toMatchObject({
      ok: true,
      nilai: { dicairkan: 10000, sisa: 110000 },
    });
    expect(await p.kembalikan(t.nilai.referensi, 10000)).toMatchObject({
      ok: true,
      nilai: { dikembalikan: 10000, sisa: 100000 },
    });
    expect(await p.status(t.nilai.referensi)).toMatchObject({ ok: true, nilai: { sisa: 100000 } });
  });
  it('cairkan melebihi saldo ditolak', async () => {
    const p = new PembayaranTiruan(keadaanPembayaranKosong());
    const t = await p.tahan({ nominal: 5000, keterangan: 'x', kunciIdempoten: 'k' });
    if (!t.ok) throw new Error('gagal');
    expect(await p.cairkan(t.nilai.referensi, 5001)).toEqual({
      ok: false,
      galat: 'MELEBIHI_SALDO',
    });
    expect(await p.kembalikan(t.nilai.referensi, -1)).toEqual({
      ok: false,
      galat: 'JUMLAH_NEGATIF',
    });
  });
  it('kunci idempoten sama tidak menahan dua kali', async () => {
    const keadaan = keadaanPembayaranKosong();
    const p = new PembayaranTiruan(keadaan);
    const a = await p.tahan({ nominal: 1000, keterangan: 'x', kunciIdempoten: 'sama' });
    const b = await p.tahan({ nominal: 1000, keterangan: 'x', kunciIdempoten: 'sama' });
    expect(a).toEqual(b);
    expect(Object.keys(keadaan.dana)).toHaveLength(1);
  });
  it('referensi tidak dikenal dan nominal negatif', async () => {
    const p = new PembayaranTiruan(keadaanPembayaranKosong());
    expect(await p.cairkan('TIRUAN-999', 1)).toEqual({ ok: false, galat: 'TIDAK_DITEMUKAN' });
    expect(await p.status('TIRUAN-999')).toEqual({ ok: false, galat: 'TIDAK_DITEMUKAN' });
    expect(await p.tahan({ nominal: -1, keterangan: 'x', kunciIdempoten: 'n' })).toEqual({
      ok: false,
      galat: 'JUMLAH_NEGATIF',
    });
  });
});
