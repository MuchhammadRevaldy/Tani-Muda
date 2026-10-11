/**
 * Konteks bersama fitur klien tiruan: akses data, sesi, aturan akses (D-22: data milik orang lain →
 * 404; peran atau status yang tidak mengizinkan → 403), galat berformat kontrak, idempoten, paginasi.
 */
import type { TanggalISO } from '../../lib/format';
import type { Hasil } from '../../lib/hasil';
import { tanggalLokal, ZONA_BAWAAN } from '../../lib/zona-waktu';
import { OtpTiruan } from '../../penyedia/otp/otp-tiruan';
import { PembayaranTiruan } from '../../penyedia/pembayaran/pembayaran-tiruan';
import { teksUntukGalat } from '../../teks/galat-api';
import { GalatApi, type KodeGalatApi } from '../galat';
import type { Halaman, ParamHalaman, Pengguna, Peran, ResepTanam, Wilayah } from '../tipe';
import type { BasisData } from './basis-data';
import type { WilayahContoh } from './data/jenis-data';
import type { PenyimpananTiruan } from './penyimpanan';

export interface OpsiKonteks {
  /** D-12: dari VITE_TAMPILKAN_RESEP_CONTOH lewat bacaTampilkanResepContoh. */
  tampilkanResepContoh: boolean;
}

export const PER_HALAMAN_BAWAAN = 20;
export const PER_HALAMAN_MAKS = 100;

export class Konteks {
  constructor(
    readonly penyimpanan: PenyimpananTiruan,
    readonly jam: () => number,
    readonly otp: OtpTiruan,
    readonly opsi: OpsiKonteks,
  ) {}

  get db(): BasisData {
    return this.penyimpanan.ambil();
  }

  get bayar(): PembayaranTiruan {
    return new PembayaranTiruan(this.db.pembayaran_tiruan);
  }

  simpan(): void {
    this.penyimpanan.simpan();
  }

  sekarangIso(): string {
    return new Date(this.jam()).toISOString();
  }

  hariIni(p?: Pengguna | null): TanggalISO {
    return tanggalLokal(this.jam(), p?.zona_waktu ?? ZONA_BAWAAN);
  }

  idBaru(awalan: string): string {
    this.db.urut += 1;
    return `${awalan}-n${this.db.urut}`;
  }

  /** Salinan dalam supaya data tiruan tidak bisa diubah dari luar. */
  salin<T>(x: T): T {
    return structuredClone(x);
  }

  // ---------------------------------------------------------------- galat

  galat(
    kode: KodeGalatApi,
    opsi: { rincian?: Record<string, string[]>; cobaLagiDalam?: number } = {},
  ): never {
    throw new GalatApi(kode, teksUntukGalat(kode), opsi);
  }

  /** Galat validasi per kolom. */
  validasi(rincian: Record<string, KodeGalatApi>): never {
    const r = Object.fromEntries(
      Object.entries(rincian).map(([k, kode]) => [k, [teksUntukGalat(kode)]]),
    );
    throw new GalatApi('VALIDASI', teksUntukGalat('VALIDASI'), { rincian: r });
  }

  /** Buka hasil fungsi src/lib; gagal → galat dengan kode yang sama, ditandai pada kolomnya. */
  dariHasil<T>(h: Hasil<T>, kolom?: string): T {
    if (h.ok) return h.nilai;
    return this.galat(h.galat, kolom ? { rincian: { [kolom]: [teksUntukGalat(h.galat)] } } : {});
  }

  // ---------------------------------------------------------------- sesi dan akses

  penggunaSesi(): Pengguna | null {
    const id = this.db.sesi.pengguna_id;
    return id ? (this.db.pengguna.pengguna.find((p) => p.id === id) ?? null) : null;
  }

  penggunaMasuk(): Pengguna {
    return this.penggunaSesi() ?? this.galat('BELUM_MASUK');
  }

  /** Pengguna masuk dengan salah satu peran ini; selain itu 403. */
  wajibPeran(...peran: Peran[]): Pengguna {
    const p = this.penggunaMasuk();
    if (p.peran === null) this.galat('PERAN_BELUM_DIPILIH');
    if (!peran.includes(p.peran)) this.galat('TIDAK_DIIZINKAN');
    return p;
  }

  /** Cari baris; tidak ada atau bukan milik pengguna → 404 (D-22). */
  milik<T>(daftar: T[], cocok: (x: T) => boolean, bolehDiakses: (x: T) => boolean = () => true): T {
    const x = daftar.find(cocok);
    if (!x || !bolehDiakses(x)) this.galat('TIDAK_DITEMUKAN');
    return x;
  }

  wilayah(id: string | null | undefined): WilayahContoh | null {
    return id ? (this.db.wilayah.find((w) => w.id === id) ?? null) : null;
  }

  /** Wilayah seperti dikirim API: tanpa kolom khusus server, dengan `tersedia_pilot` (D-56). */
  wilayahKeluar({ kode_terverifikasi: _k, ...w }: WilayahContoh): Wilayah {
    return this.salin({ ...w, tersedia_pilot: w.lintang !== null && w.bujur !== null });
  }

  /** Desa boleh dipilih sebagai desa petani, desa lahan, atau titik antar (D-56). */
  wilayahTersedia(id: string | null | undefined): boolean {
    const w = this.wilayah(id);
    return !!w && w.lintang !== null && w.bujur !== null;
  }

  /** Resep boleh dilihat petani: divalidasi, atau contoh bila pengaturan menyala (D-12). */
  resepTerlihat(r: ResepTanam): boolean {
    return r.status === 'divalidasi' || (r.contoh && this.opsi.tampilkanResepContoh);
  }

  // ---------------------------------------------------------------- idempoten dan paginasi

  /** Permintaan dengan kunci yang sama mengembalikan hasil pertama tanpa mengulang efeknya. */
  async idempoten<T>(
    cakupan: string,
    kunci: string | undefined,
    kerja: () => Promise<T> | T,
  ): Promise<T> {
    if (!kunci) this.validasi({ kunci_idempoten: 'VALIDASI' });
    const k = `${cakupan}:${kunci}`;
    if (k in this.db.idempoten) return this.salin(this.db.idempoten[k] as T);
    const hasil = await kerja();
    this.db.idempoten[k] = this.salin(hasil);
    this.simpan();
    return hasil;
  }

  halaman<T>(daftar: T[], p: ParamHalaman = {}): Halaman<T> {
    const per = Math.min(
      PER_HALAMAN_MAKS,
      Math.max(1, Math.floor(p.per_halaman ?? PER_HALAMAN_BAWAAN)),
    );
    const halamanTerakhir = Math.max(1, Math.ceil(daftar.length / per));
    const halaman = Math.min(halamanTerakhir, Math.max(1, Math.floor(p.halaman ?? 1)));
    return {
      data: this.salin(daftar.slice((halaman - 1) * per, halaman * per)),
      meta: { halaman, per_halaman: per, total: daftar.length, halaman_terakhir: halamanTerakhir },
    };
  }
}
