/**
 * Bentuk umum respons API (docs/kontrak-api.md bagian 1). Nama kolom snake_case sama persis dengan
 * kontrak dan Model Data; tidak diubah ke camelCase di lapisan ini.
 */

/** Tanggal kalender tanpa jam "YYYY-MM-DD". */
export type TanggalISO = string;
/** Waktu ISO 8601 dalam UTC dengan akhiran "Z" (D-31). */
export type WaktuISO = string;
/** Rupiah bulat. */
export type Rupiah = number;

export interface MetaHalaman {
  halaman: number;
  per_halaman: number;
  total: number;
  halaman_terakhir: number;
}

/** Daftar berhalaman: `{ data: [...], meta: {...} }`. */
export interface Halaman<T> {
  data: T[];
  meta: MetaHalaman;
}

export interface ParamHalaman {
  halaman?: number;
  per_halaman?: number;
}

/** Bungkus respons sukses: `{ data: ... }`. Klien API membuka bungkus ini. */
export interface ResponsSukses<T> {
  data: T;
}

/** Bungkus respons galat: `{ galat: { kode, pesan, rincian } }`. */
export interface ResponsGalat {
  galat: {
    kode: string;
    pesan: string;
    rincian?: Record<string, string[]>;
  };
}

/** Kunci idempoten untuk operasi uang dan antrean offline (dikirim ulang → hasil sama). */
export interface DenganKunciIdempoten {
  kunci_idempoten: string;
}
