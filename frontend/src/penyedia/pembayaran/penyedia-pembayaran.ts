/**
 * Antarmuka penyedia pembayaran (D-10, PRD P0-23, P0-26, P0-27): menahan, mencairkan, dan
 * mengembalikan dana. Dana pengguna tidak pernah masuk rekening tim; status dicatat dari respons
 * penyedia. Dipakai klien API tiruan (Tahap 3–4) dan backend (Tahap 5); halaman tidak memanggilnya.
 */

export interface StatusDana {
  referensi: string;
  ditahan: number;
  dicairkan: number;
  dikembalikan: number;
  /** Sisa yang masih ditahan = ditahan − dicairkan − dikembalikan. */
  sisa: number;
}

export type GalatPembayaran = 'MELEBIHI_SALDO' | 'TIDAK_DITEMUKAN' | 'JUMLAH_NEGATIF';

export type HasilPembayaran<T> = { ok: true; nilai: T } | { ok: false; galat: GalatPembayaran };

export interface PenyediaPembayaran {
  /** Tahan dana pembeli. Kunci idempoten yang sama mengembalikan referensi yang sama. */
  tahan(m: {
    nominal: number;
    keterangan: string;
    kunciIdempoten: string;
  }): Promise<HasilPembayaran<StatusDana>>;
  /** Cairkan sebagian dana yang ditahan ke petani. */
  cairkan(referensi: string, nominal: number): Promise<HasilPembayaran<StatusDana>>;
  /** Kembalikan sebagian dana yang ditahan ke pembeli. */
  kembalikan(referensi: string, nominal: number): Promise<HasilPembayaran<StatusDana>>;
  status(referensi: string): Promise<HasilPembayaran<StatusDana>>;
  /** Benar untuk implementasi tiruan: UI menampilkan label "Mode uji coba". */
  readonly modeUjiCoba: boolean;
}
