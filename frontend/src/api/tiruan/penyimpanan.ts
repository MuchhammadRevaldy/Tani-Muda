/**
 * Penyimpanan klien tiruan (T3.05): data di memori, disalin ke localStorage bila tersedia supaya
 * bertahan setelah muat ulang. localStorage yang kosong, rusak, atau versinya lama diganti data
 * contoh baru; kegagalan menyimpan (mis. kuota penuh atau mode privat) diabaikan.
 */
import type { BasisData } from './basis-data';

/** Bagian Storage yang dipakai; `null` = hanya memori (tes). */
export interface PenyimpananKunciNilai {
  getItem(kunci: string): string | null;
  setItem(kunci: string, nilai: string): void;
  removeItem(kunci: string): void;
}

export const KUNCI_PENYIMPANAN = 'tani-muda:data-tiruan';

export class PenyimpananTiruan {
  private db: BasisData | null = null;

  constructor(
    private readonly opsi: {
      buatAwal: () => BasisData;
      versi: number;
      kv: PenyimpananKunciNilai | null;
      kunci?: string;
    },
  ) {}

  private get kunci(): string {
    return this.opsi.kunci ?? KUNCI_PENYIMPANAN;
  }

  ambil(): BasisData {
    if (this.db) return this.db;
    this.db = this.bacaTersimpan() ?? this.opsi.buatAwal();
    return this.db;
  }

  private bacaTersimpan(): BasisData | null {
    if (!this.opsi.kv) return null;
    try {
      const mentah = this.opsi.kv.getItem(this.kunci);
      if (!mentah) return null;
      const db = JSON.parse(mentah) as BasisData;
      if (db?.versi !== this.opsi.versi || !db.pengguna || !db.kebun || !db.pesanan) return null;
      return db;
    } catch {
      return null;
    }
  }

  simpan(): void {
    if (!this.opsi.kv || !this.db) return;
    try {
      this.opsi.kv.setItem(this.kunci, JSON.stringify(this.db));
    } catch {
      // Kuota penuh atau penyimpanan diblokir: data tetap ada di memori selama sesi ini.
    }
  }

  /** "Atur ulang data demo": kembali ke data contoh. */
  aturUlang(): BasisData {
    this.db = this.opsi.buatAwal();
    try {
      this.opsi.kv?.removeItem(this.kunci);
    } catch {
      // diabaikan
    }
    this.simpan();
    return this.db;
  }
}

/** localStorage peramban bila tersedia, atau null (Node, mode privat yang memblokir). */
export function localStorageAman(): PenyimpananKunciNilai | null {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return null;
    const uji = '__tani_muda_uji__';
    ls.setItem(uji, '1');
    ls.removeItem(uji);
    return ls;
  } catch {
    return null;
  }
}
