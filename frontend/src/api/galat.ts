/**
 * Galat API dengan format kontrak `{ galat: { kode, pesan, rincian } }` (kontrak bagian 1.4).
 * Kode stabil dipakai frontend; pesan siap tampil dalam Bahasa Indonesia; rincian berisi galat per
 * kolom untuk validasi.
 */
import type { KodeGalat } from '../lib/hasil';
import type { ResponsGalat } from './tipe';

/** Kode galat khusus API, di luar kode galat logika inti (src/lib/hasil.ts). */
export type KodeGalatKhususApi =
  | 'VALIDASI'
  | 'BELUM_MASUK'
  | 'TIDAK_DIIZINKAN'
  | 'TIDAK_DITEMUKAN'
  | 'BENTROK'
  | 'SESI_KEDALUWARSA'
  | 'TERLALU_SERING'
  | 'AKUN_NONAKTIF'
  | 'BELUM_TERVERIFIKASI'
  | 'PERAN_BELUM_DIPILIH'
  | 'WILAYAH_WAJIB'
  | 'WILAYAH_BELUM_TERSEDIA'
  | 'PRIVASI_WAJIB'
  | 'OTP_SALAH'
  | 'OTP_KEDALUWARSA'
  | 'OTP_TERKUNCI'
  | 'NOMOR_SUDAH_DIPAKAI'
  | 'NOMOR_SAMA'
  | 'FOTO_WAJIB'
  | 'STATUS_TIDAK_SESUAI'
  | 'SUDAH_DINILAI'
  | 'MELEBIHI_SALDO'
  | 'PEMBAYARAN_GAGAL'
  | 'SUMBER_BELUM_TERSEDIA'
  | 'GALAT_SERVER';

export type KodeGalatApi = KodeGalat | KodeGalatKhususApi;

/** Status HTTP tiap kode galat (kontrak bagian 1.4). Kode logika inti yang tidak tercantum = 422. */
const STATUS_KHUSUS: Partial<Record<KodeGalatApi, number>> = {
  BELUM_MASUK: 401,
  TIDAK_DIIZINKAN: 403,
  AKUN_NONAKTIF: 403,
  BELUM_TERVERIFIKASI: 403,
  PERAN_BELUM_DIPILIH: 403,
  TIDAK_DITEMUKAN: 404,
  BENTROK: 409,
  SESI_KEDALUWARSA: 419,
  MELEBIHI_PESANAN: 409,
  LAHAN_TIDAK_CUKUP: 409,
  JADWAL_TERLALU_DEKAT: 409,
  STATUS_TIDAK_SESUAI: 409,
  SUDAH_DINILAI: 409,
  MELEBIHI_SALDO: 409,
  PEMBAYARAN_GAGAL: 402,
  OTP_TERKUNCI: 423,
  NOMOR_SUDAH_DIPAKAI: 409,
  TERLALU_SERING: 429,
  GALAT_SERVER: 500,
  SUMBER_BELUM_TERSEDIA: 503,
};

export function statusHttp(kode: KodeGalatApi): number {
  return STATUS_KHUSUS[kode] ?? 422;
}

export class GalatApi extends Error {
  readonly kode: KodeGalatApi;
  readonly status: number;
  readonly rincian: Record<string, string[]>;
  /** Detik sampai boleh mencoba lagi (429). */
  readonly cobaLagiDalam: number | null;

  constructor(
    kode: KodeGalatApi,
    pesan: string,
    opsi: { rincian?: Record<string, string[]>; cobaLagiDalam?: number } = {},
  ) {
    super(pesan);
    this.name = 'GalatApi';
    this.kode = kode;
    this.status = statusHttp(kode);
    this.rincian = opsi.rincian ?? {};
    this.cobaLagiDalam = opsi.cobaLagiDalam ?? null;
  }

  /** Bentuk JSON galat sesuai kontrak. */
  keJson(): ResponsGalat {
    return {
      galat: {
        kode: this.kode,
        pesan: this.message,
        ...(Object.keys(this.rincian).length ? { rincian: this.rincian } : {}),
      },
    };
  }
}

export const adalahGalatApi = (x: unknown): x is GalatApi => x instanceof GalatApi;
