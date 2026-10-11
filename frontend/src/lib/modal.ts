/**
 * Total modal (PRD P0-08, P0-36; rumus "Total modal" dan "Biaya alat per siklus"):
 * total modal = Σ (jumlah × harga per satuan) bahan + biaya alat per siklus,
 * biaya alat per siklus = harga alat ÷ jumlah siklus pembagian (atau seluruhnya bila tidak dibagi).
 */
import { bulatkanRupiah } from './format';
import { berhasil, gagal, type Hasil } from './hasil';

export interface ItemModal {
  id: string;
  grup: string;
  jumlah: number;
  /** Harga per satuan, atau null bila belum diisi ("Harga belum diisi"). */
  hargaSatuan: number | null;
  alatSekaliBeli: boolean;
}

export interface OpsiModal {
  /** Saklar "Bagi biaya alat ke n siklus". */
  bagiAlat: boolean;
  jumlahSiklusPembagian: number;
}

export interface RingkasanModal {
  item: { id: string; subtotal: number | null }[];
  /** Subtotal per grup bahan sesuai urutan kemunculan; alat dihitung terpisah. */
  grup: { nama: string; subtotal: number; adaTanpaHarga: boolean }[];
  totalBahan: number;
  /** Harga seluruh alat sekali beli. */
  totalAlat: number;
  biayaAlatPerSiklus: number;
  /** Modal siklus ini = total bahan + biaya alat per siklus. */
  totalModal: number;
  itemTanpaHarga: string[];
  /** false bila ada item tanpa harga: ringkasan memberi peringatan "total belum lengkap". */
  lengkap: boolean;
}

export function hitungModal(items: ItemModal[], opsi: OpsiModal): Hasil<RingkasanModal> {
  if (
    opsi.bagiAlat &&
    !(Number.isInteger(opsi.jumlahSiklusPembagian) && opsi.jumlahSiklusPembagian >= 1)
  ) {
    return gagal('PEMBAGIAN_TIDAK_VALID');
  }
  const ringkasItem: RingkasanModal['item'] = [];
  const grup = new Map<string, { subtotal: number; adaTanpaHarga: boolean }>();
  let totalBahan = 0;
  let totalAlat = 0;
  const itemTanpaHarga: string[] = [];

  for (const it of items) {
    if (it.jumlah < 0) return gagal('JUMLAH_NEGATIF');
    if (it.hargaSatuan !== null && it.hargaSatuan < 0) return gagal('HARGA_NEGATIF');
    const subtotal = it.hargaSatuan === null ? null : bulatkanRupiah(it.jumlah * it.hargaSatuan);
    ringkasItem.push({ id: it.id, subtotal });
    if (subtotal === null) itemTanpaHarga.push(it.id);
    if (it.alatSekaliBeli) {
      totalAlat += subtotal ?? 0;
      continue;
    }
    totalBahan += subtotal ?? 0;
    const g = grup.get(it.grup) ?? { subtotal: 0, adaTanpaHarga: false };
    g.subtotal += subtotal ?? 0;
    g.adaTanpaHarga ||= subtotal === null;
    grup.set(it.grup, g);
  }

  const biayaAlatPerSiklus = opsi.bagiAlat
    ? bulatkanRupiah(totalAlat / opsi.jumlahSiklusPembagian)
    : totalAlat;
  return berhasil({
    item: ringkasItem,
    grup: [...grup].map(([nama, g]) => ({ nama, ...g })),
    totalBahan,
    totalAlat,
    biayaAlatPerSiklus,
    totalModal: totalBahan + biayaAlatPerSiklus,
    itemTanpaHarga,
    lengkap: itemTanpaHarga.length === 0,
  });
}
