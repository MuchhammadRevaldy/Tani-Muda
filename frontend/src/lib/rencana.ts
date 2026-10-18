/**
 * Keadaan rencana kalkulator Hitung (T4.05–T4.08, PRD P0-07–P0-11, P0-36): item dari kebutuhan
 * resep, harga efektif tiap item, ringkasan modal, dan pemetaan ke baris `rencana_item` saat
 * "Simpan rencana". Fungsi murni; harga dan konteks dikirim sebagai argumen.
 */
import type { ResepTanam } from '../tipe';
import { hargaSatuanEfektif, type KonteksSubsidi, type SumberHarga } from './harga-item';
import { berhasil, gagal, type Hasil } from './hasil';
import type { KebutuhanItem } from './kebutuhan';
import { hitungModal, type RingkasanModal } from './modal';

/** Bawaan saklar "Bagi biaya alat ke n siklus" (papan 18; sama dengan data contoh). */
export const SIKLUS_PEMBAGIAN_ALAT = 10;

export interface MerekDipilih {
  id: string;
  nama: string;
  hargaKemasan: number;
  isiKemasan: number;
}

export interface ItemRencana {
  id: string;
  /** Input resep asal; null untuk item tambahan ("Tambah item"). */
  resepInputId: string | null;
  /** Rujukan input_pertanian; null untuk tenaga, listrik, dan item tambahan. */
  inputId: string | null;
  nama: string;
  grup: string;
  jumlah: number;
  satuan: string;
  alatSekaliBeli: boolean;
  asal: 'resep' | 'tambahan';
  hargaContoh: number | null;
  /** Harga per satuan yang diketik petani; menimpa merek dan rata-rata. */
  hargaIsiSendiri: number | null;
  merek: MerekDipilih | null;
  /** Pilihan Subsidi/Nonsubsidi untuk item yang layak subsidi. Bawaan: nonsubsidi. */
  pilihSubsidi: boolean;
  /** Penanda item opsional (F-01) */
  opsional?: boolean;
  keteranganOpsional?: string | null;
  /** Apakah item ini disertakan dalam kalkulasi modal. Bawaan: true. */
  disertakan?: boolean;
}

export interface HargaItem {
  harga: number | null;
  sumber: SumberHarga;
  layakSubsidi: boolean;
}

/**
 * Item rencana dari kebutuhan resep, urut sesuai resep. `pilihSubsidi` bawaan = petani menyatakan
 * terdaftar di kelompok tani di profilnya (D-38); selain itu Nonsubsidi.
 */
export function itemDariKebutuhan(
  kebutuhan: KebutuhanItem[],
  resep: ResepTanam,
  opsi: { terdaftarKelompokTani?: boolean } = {},
): ItemRencana[] {
  return kebutuhan.map((k) => {
    const input = resep.input.find((i) => i.id === k.inputId);
    return {
      id: k.inputId,
      resepInputId: k.inputId,
      inputId: input?.inputId ?? null,
      nama: k.nama,
      grup: k.grup,
      jumlah: k.jumlahBeli,
      satuan: k.satuanBeli,
      alatSekaliBeli: k.alatSekaliBeli,
      asal: 'resep',
      hargaContoh: k.hargaContoh,
      hargaIsiSendiri: null,
      merek: null,
      pilihSubsidi: opsi.terdaftarKelompokTani ?? false,
      opsional: k.opsional ?? input?.opsional ?? false,
      keteranganOpsional: k.keteranganOpsional ?? input?.keteranganOpsional ?? null,
      disertakan: true,
    };
  });
}

/** Item kosong dari "Tambah item" (tenaga kerja, sewa lahan, …): harga belum diisi. */
export function itemTambahan(id: string, grup: string): ItemRencana {
  return {
    id,
    resepInputId: null,
    inputId: null,
    nama: '',
    grup,
    jumlah: 1,
    satuan: 'kali',
    alatSekaliBeli: false,
    asal: 'tambahan',
    hargaContoh: null,
    hargaIsiSendiri: null,
    merek: null,
    pilihSubsidi: false,
  };
}

/**
 * Harga efektif satu item: subsidi (bila layak dan dipilih) → isi sendiri → merek → rata-rata
 * sekitar → harga contoh resep. Petani yang memilih "Subsidi" dianggap mendapat jatah.
 */
export function hargaItemRencana(
  item: ItemRencana,
  konteks: Omit<KonteksSubsidi, 'dapatJatahSubsidi'>,
  rataSekitar: number | null,
): Hasil<HargaItem> {
  return hargaSatuanEfektif(
    {
      ...(item.inputId ? { inputId: item.inputId } : {}),
      hargaContoh: item.hargaContoh,
      hargaIsiSendiri: item.hargaIsiSendiri,
      merekTerpilih: item.merek,
      rataRataSekitar: rataSekitar,
      pilihSubsidi: item.pilihSubsidi,
    },
    { ...konteks, dapatJatahSubsidi: true },
  );
}

/** Ringkasan modal rencana dengan harga efektif tiap item. Item opsional yang dilewati tidak dihitung. */
export function ringkasRencana(
  items: ItemRencana[],
  harga: Map<string, HargaItem>,
  bagiAlat: boolean,
  jumlahSiklusPembagian = SIKLUS_PEMBAGIAN_ALAT,
): Hasil<RingkasanModal> {
  const itemAktif = items.filter((it) => it.disertakan !== false);
  return hitungModal(
    itemAktif.map((it) => ({
      id: it.id,
      grup: it.grup,
      jumlah: it.jumlah,
      hargaSatuan: harga.get(it.id)?.harga ?? null,
      alatSekaliBeli: it.alatSekaliBeli,
    })),
    { bagiAlat, jumlahSiklusPembagian },
  );
}

/** Siklus memakai harga subsidi bila ada item layak yang dipilih "Subsidi". */
export function pakaiSubsidi(harga: Map<string, HargaItem>): boolean {
  return [...harga.values()].some((h) => h.sumber === 'subsidi');
}

/** Satu baris `rencana_item` untuk POST /siklus (kontrak bagian 2.6). */
export interface BarisRencana {
  resep_input_id: string | null;
  input_id: string | null;
  merek_id: string | null;
  nama: string;
  grup: string;
  jumlah: number;
  satuan: string;
  harga_satuan: number | null;
  alat_sekali_beli: boolean;
}

/** Pemetaan rencana → baris `rencana_item`. Item tambahan tanpa nama ditolak. Item yang tidak disertakan diabaikan. */
export function keBarisRencana(
  items: ItemRencana[],
  harga: Map<string, HargaItem>,
): Hasil<BarisRencana[]> {
  const itemAktif = items.filter((it) => it.disertakan !== false);
  if (itemAktif.some((it) => !it.nama.trim())) return gagal('NAMA_ITEM_KOSONG');
  if (itemAktif.some((it) => it.jumlah < 0)) return gagal('JUMLAH_NEGATIF');
  return berhasil(
    itemAktif.map((it) => ({
      resep_input_id: it.resepInputId,
      input_id: it.inputId,
      merek_id: it.merek?.id ?? null,
      nama: it.nama.trim(),
      grup: it.grup,
      jumlah: it.jumlah,
      satuan: it.satuan,
      harga_satuan: harga.get(it.id)?.harga ?? null,
      alat_sekali_beli: it.alatSekaliBeli,
    })),
  );
}

/** Panen saat panen jelek (D-38, P-20): perkiraan panen × persen dari resep, dua desimal. */
export function panenJelekKg(
  perkiraanKg: number,
  persen: number | null | undefined,
): number | null {
  if (persen === null || persen === undefined || !(persen > 0) || !(perkiraanKg >= 0)) return null;
  return Math.round(perkiraanKg * Math.min(persen, 100)) / 100;
}

export type SumberHargaJual =
  | 'isian'
  | 'kesepakatan'
  | 'pesanan_terdekat'
  | 'berita'
  | 'contoh'
  | 'belum_ada';

/**
 * Harga jual di kalkulator (D-38, P-21, F-10): isian petani menang; lalu harga kesepakatan bila
 * siklus terhubung pesanan; lalu harga pesanan terdekat; lalu harga pantauan berita; lalu harga contoh.
 */
export function pilihHargaJual(m: {
  isian: number | null;
  kesepakatan: number | null;
  pesananTerdekat: number | null;
  berita?: number | null;
  contoh: number | null;
}): { harga: number | null; sumber: SumberHargaJual } {
  if (m.isian !== null) return { harga: m.isian, sumber: 'isian' };
  if (m.kesepakatan !== null) return { harga: m.kesepakatan, sumber: 'kesepakatan' };
  if (m.pesananTerdekat !== null) return { harga: m.pesananTerdekat, sumber: 'pesanan_terdekat' };
  if (m.berita !== null && m.berita !== undefined && m.berita > 0) {
    return { harga: m.berita, sumber: 'berita' };
  }
  if (m.contoh !== null) return { harga: m.contoh, sumber: 'contoh' };
  return { harga: null, sumber: 'belum_ada' };
}
