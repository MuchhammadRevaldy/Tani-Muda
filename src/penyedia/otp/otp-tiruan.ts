/**
 * OTP TIRUAN untuk pengembangan dan demo (D-10). Meniru aturan backend: kode hanya disimpan sebagai
 * hash SHA-256, kedaluwarsa 5 menit, paling banyak 5 percobaan, kirim ulang setelah 60 detik dan
 * paling banyak 5 kali per jam. Kode bisa dibaca lewat `kodeUji` untuk panel "Kode uji" yang hanya
 * ada di mode pengembangan; respons API tidak pernah memuat kode.
 */
import { ATURAN_OTP, type HasilKirimOtp, type HasilOtp, type PenyediaOtp } from './penyedia-otp';

interface KeadaanOtp {
  hash: string;
  kedaluwarsaMs: number;
  percobaan: number;
  dipakai: boolean;
  kirimMs: number[];
}

const MS = 1000;

async function sha256(teks: string): Promise<string> {
  const data = new TextEncoder().encode(teks);
  const hasil = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hasil)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function kodeAcak(panjang: number): string {
  const angka = new Uint32Array(panjang);
  globalThis.crypto.getRandomValues(angka);
  return [...angka].map((n) => String(n % 10)).join('');
}

export class OtpTiruan implements PenyediaOtp {
  private readonly keadaan = new Map<string, KeadaanOtp>();
  /** Kode terakhir per nomor, HANYA untuk panel "Kode uji" di pengembangan. */
  private readonly kodeTerakhir = new Map<string, string>();

  constructor(
    private readonly jam: () => number,
    private readonly buatKode: (panjang: number) => string = kodeAcak,
    private readonly garam = 'tani-muda-tiruan',
  ) {}

  async kirimKode(nomorHp: string): Promise<HasilOtp<HasilKirimOtp>> {
    const sekarang = this.jam();
    const lama = this.keadaan.get(nomorHp);
    const kirimMs = (lama?.kirimMs ?? []).filter((t) => sekarang - t < 3600 * MS);
    const terakhir = kirimMs.at(-1);
    if (terakhir !== undefined && sekarang - terakhir < ATURAN_OTP.jedaKirimUlangDetik * MS) {
      return {
        ok: false,
        galat: 'TERLALU_SERING',
        cobaLagiDalamDetik: Math.ceil(
          (terakhir + ATURAN_OTP.jedaKirimUlangDetik * MS - sekarang) / MS,
        ),
      };
    }
    if (kirimMs.length >= ATURAN_OTP.maksKirimPerJam) {
      const pertama = kirimMs[0] as number;
      return {
        ok: false,
        galat: 'TERLALU_SERING',
        cobaLagiDalamDetik: Math.ceil((pertama + 3600 * MS - sekarang) / MS),
      };
    }
    const kode = this.buatKode(ATURAN_OTP.panjang);
    this.keadaan.set(nomorHp, {
      hash: await sha256(`${this.garam}:${nomorHp}:${kode}`),
      kedaluwarsaMs: sekarang + ATURAN_OTP.kedaluwarsaDetik * MS,
      percobaan: 0,
      dipakai: false,
      kirimMs: [...kirimMs, sekarang],
    });
    this.kodeTerakhir.set(nomorHp, kode);
    return {
      ok: true,
      nilai: {
        kirimUlangDalamDetik: ATURAN_OTP.jedaKirimUlangDetik,
        kedaluwarsaDalamDetik: ATURAN_OTP.kedaluwarsaDetik,
      },
    };
  }

  async verifikasi(nomorHp: string, kode: string): Promise<HasilOtp<true>> {
    const k = this.keadaan.get(nomorHp);
    if (!k || k.dipakai) return { ok: false, galat: 'OTP_KEDALUWARSA' };
    if (k.percobaan >= ATURAN_OTP.maksPercobaan) return { ok: false, galat: 'OTP_TERKUNCI' };
    if (this.jam() >= k.kedaluwarsaMs) return { ok: false, galat: 'OTP_KEDALUWARSA' };
    k.percobaan += 1;
    const cocok = (await sha256(`${this.garam}:${nomorHp}:${kode}`)) === k.hash;
    if (!cocok)
      return {
        ok: false,
        galat: k.percobaan >= ATURAN_OTP.maksPercobaan ? 'OTP_TERKUNCI' : 'OTP_SALAH',
      };
    k.dipakai = true;
    this.kodeTerakhir.delete(nomorHp);
    return { ok: true, nilai: true };
  }

  /** Kode uji terakhir (pengembangan saja). */
  kodeUji(nomorHp: string): string | null {
    return this.kodeTerakhir.get(nomorHp) ?? null;
  }

  /** Untuk tes: hash yang tersimpan tidak pernah sama dengan kode. */
  hashTersimpan(nomorHp: string): string | null {
    return this.keadaan.get(nomorHp)?.hash ?? null;
  }
}
