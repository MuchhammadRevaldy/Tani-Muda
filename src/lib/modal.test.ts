import { describe, expect, it } from 'vitest';
import type { DasarUkuran, ResepTanam } from '../tipe';
import {
  CONTOH_RESEP_PADI_SAWAH,
  CONTOH_RESEP_SAWI_BEDENGAN,
  CONTOH_RESEP_SAWI_HIDROPONIK,
} from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import { hitungKebutuhanResep, type UkuranTanam } from './kebutuhan';
import { hitungModal, type ItemModal } from './modal';

/** Item kalkulator dari resep: jumlah dari kebutuhan, harga contoh resep. */
function itemDariResep(resep: ResepTanam, dasar: DasarUkuran, ukuran: UkuranTanam): ItemModal[] {
  return pastikan(hitungKebutuhanResep(resep, dasar, ukuran)).map((k) => ({
    id: k.inputId,
    grup: k.grup,
    jumlah: k.jumlahBeli,
    hargaSatuan: k.hargaContoh,
    alatSekaliBeli: k.alatSekaliBeli,
  }));
}

const SAWI = itemDariResep(CONTOH_RESEP_SAWI_BEDENGAN, 'luas', { luasM2: 100 });
const HIDRO = itemDariResep(CONTOH_RESEP_SAWI_HIDROPONIK, 'lubang', {
  jumlahTanaman: 200,
  volumeLarutanLiter: 100,
});
const PADI = itemDariResep(CONTOH_RESEP_PADI_SAWAH, 'luas', { luasM2: 1000 });

describe('hitungModal dengan fixture desain', () => {
  it('sawi bedengan 100 m², NPK nonsubsidi → total modal contoh Rp430.000 (papan 16)', () => {
    const r = pastikan(hitungModal(SAWI, { bagiAlat: true, jumlahSiklusPembagian: 10 }));
    expect(r.totalModal).toBe(430000);
    expect(r.totalAlat).toBe(0);
    expect(r.grup).toEqual([
      { nama: 'Benih', subtotal: 25000, adaTanpaHarga: false },
      { nama: 'Pupuk dan pembenah tanah', subtotal: 265000, adaTanpaHarga: false },
      { nama: 'Perlindungan tanaman', subtotal: 80000, adaTanpaHarga: false },
      { nama: 'Tenaga dan air', subtotal: 60000, adaTanpaHarga: false },
    ]);
    expect(r.lengkap).toBe(true);
  });
  it('hidroponik NFT: alat Rp1.500.000 ÷ 10 siklus = Rp150.000 (papan 18)', () => {
    const r = pastikan(hitungModal(HIDRO, { bagiAlat: true, jumlahSiklusPembagian: 10 }));
    expect(r.totalBahan).toBe(247500);
    expect(r.totalAlat).toBe(1500000);
    expect(r.biayaAlatPerSiklus).toBe(150000);
    expect(r.totalModal).toBe(397500);
    expect(r.grup.map((g) => g.nama)).not.toContain('Alat sekali beli');
  });
  it('alat tidak dibagi atau dibagi 1 siklus → seluruh harga alat', () => {
    expect(
      pastikan(hitungModal(HIDRO, { bagiAlat: false, jumlahSiklusPembagian: 10 })).totalModal,
    ).toBe(1747500);
    expect(
      pastikan(hitungModal(HIDRO, { bagiAlat: true, jumlahSiklusPembagian: 1 })).totalModal,
    ).toBe(1747500);
  });
  it('padi sawah dengan harga nonsubsidi', () => {
    expect(
      pastikan(hitungModal(PADI, { bagiAlat: false, jumlahSiklusPembagian: 1 })).totalModal,
    ).toBe(1715000);
  });
});

describe('ubah, hapus, dan tambah item (P0-08)', () => {
  const opsi = { bagiAlat: true, jumlahSiklusPembagian: 10 };
  it('item dihapus mengurangi total', () => {
    expect(
      pastikan(
        hitungModal(
          SAWI.filter((i) => i.id !== 'mulsa'),
          opsi,
        ),
      ).totalModal,
    ).toBe(385000);
  });
  it('item tambahan (sewa lahan) masuk grupnya sendiri', () => {
    const r = pastikan(
      hitungModal(
        [
          ...SAWI,
          { id: 'sewa', grup: 'Sewa lahan', jumlah: 1, hargaSatuan: 100000, alatSekaliBeli: false },
        ],
        opsi,
      ),
    );
    expect(r.totalModal).toBe(530000);
    expect(r.grup.at(-1)).toEqual({ nama: 'Sewa lahan', subtotal: 100000, adaTanpaHarga: false });
  });
  it('item tanpa harga tidak merusak total dan memunculkan peringatan', () => {
    const r = pastikan(
      hitungModal(
        [
          ...SAWI,
          { id: 'baru', grup: 'Benih', jumlah: 2, hargaSatuan: null, alatSekaliBeli: false },
        ],
        opsi,
      ),
    );
    expect(r.totalModal).toBe(430000);
    expect(r.lengkap).toBe(false);
    expect(r.itemTanpaHarga).toEqual(['baru']);
    expect(r.grup[0]).toEqual({ nama: 'Benih', subtotal: 25000, adaTanpaHarga: true });
    expect(r.item.at(-1)).toEqual({ id: 'baru', subtotal: null });
  });
  it.each([
    [1.5, 333, 500],
    [3, 333.33, 1000],
    [0.5, 1, 1],
  ])('subtotal %s × %s dibulatkan ke rupiah penuh = %s', (jumlah, harga, subtotal) => {
    const r = pastikan(
      hitungModal(
        [{ id: 'x', grup: 'g', jumlah, hargaSatuan: harga, alatSekaliBeli: false }],
        opsi,
      ),
    );
    expect(r.item[0]?.subtotal).toBe(subtotal);
  });
  it('alat dibagi dengan sisa dibulatkan', () => {
    const r = pastikan(
      hitungModal(
        [{ id: 'a', grup: 'Alat', jumlah: 1, hargaSatuan: 100000, alatSekaliBeli: true }],
        { bagiAlat: true, jumlahSiklusPembagian: 3 },
      ),
    );
    expect(r.biayaAlatPerSiklus).toBe(33333);
  });
  it.each([
    [
      { id: 'x', grup: 'g', jumlah: -1, hargaSatuan: 1, alatSekaliBeli: false },
      opsi,
      'JUMLAH_NEGATIF',
    ],
    [
      { id: 'x', grup: 'g', jumlah: 1, hargaSatuan: -1, alatSekaliBeli: false },
      opsi,
      'HARGA_NEGATIF',
    ],
    [
      { id: 'x', grup: 'g', jumlah: 1, hargaSatuan: 1, alatSekaliBeli: true },
      { bagiAlat: true, jumlahSiklusPembagian: 0 },
      'PEMBAGIAN_TIDAK_VALID',
    ],
    [
      { id: 'x', grup: 'g', jumlah: 1, hargaSatuan: 1, alatSekaliBeli: true },
      { bagiAlat: true, jumlahSiklusPembagian: 2.5 },
      'PEMBAGIAN_TIDAK_VALID',
    ],
  ])('galat %#', (item, o, galat) => {
    expect(hitungModal([item], o)).toEqual({ ok: false, galat });
  });
  it('daftar kosong → nol', () => {
    expect(pastikan(hitungModal([], opsi))).toMatchObject({
      totalModal: 0,
      lengkap: true,
      grup: [],
    });
  });
});
