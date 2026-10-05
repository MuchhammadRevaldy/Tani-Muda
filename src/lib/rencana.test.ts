import { describe, expect, it } from 'vitest';
import {
  CONTOH_KELAYAKAN_SUBSIDI,
  CONTOH_RESEP_PADI_SAWAH,
} from './fixtures/contoh-resep-padi-sawah';
import { CONTOH_RESEP_SAWI_BEDENGAN } from './fixtures/contoh-resep-sawi-bedengan';
import { CONTOH_RESEP_SAWI_HIDROPONIK } from './fixtures/contoh-resep-sawi-hidroponik';
import { pastikan } from './hasil';
import { hitungKebutuhanResep } from './kebutuhan';
import {
  hargaItemRencana,
  itemDariKebutuhan,
  itemTambahan,
  keBarisRencana,
  pakaiSubsidi,
  ringkasRencana,
  SIKLUS_PEMBAGIAN_ALAT,
  type HargaItem,
  type ItemRencana,
} from './rencana';

const TANGGAL = '2026-10-03';

function rencana(
  resep: typeof CONTOH_RESEP_SAWI_BEDENGAN,
  ukuran: Parameters<typeof hitungKebutuhanResep>[2],
  dasar: 'luas' | 'lubang' = 'luas',
) {
  return itemDariKebutuhan(pastikan(hitungKebutuhanResep(resep, dasar, ukuran)), resep);
}

function semuaHarga(items: ItemRencana[], komoditasId: string, rata: Record<string, number> = {}) {
  return new Map<string, HargaItem>(
    items.map((it) => [
      it.id,
      pastikan(
        hargaItemRencana(
          it,
          { komoditasId, tanggal: TANGGAL, kelayakan: CONTOH_KELAYAKAN_SUBSIDI },
          it.inputId ? (rata[it.inputId] ?? null) : null,
        ),
      ),
    ]),
  );
}

describe('rencana kalkulator', () => {
  it('sawi bedengan 100 m² dengan harga contoh: total modal Rp430.000 (papan 16)', () => {
    const items = rencana(CONTOH_RESEP_SAWI_BEDENGAN, { luasM2: 100 });
    expect(items.every((i) => i.asal === 'resep' && !i.pilihSubsidi)).toBe(true);
    const harga = semuaHarga(items, 'sawi');
    const r = pastikan(ringkasRencana(items, harga, true));
    expect(r.totalModal).toBe(430_000);
    expect(r.lengkap).toBe(true);
    expect(pakaiSubsidi(harga)).toBe(false);
  });

  it('prioritas harga: isi sendiri menimpa merek, merek menimpa rata-rata sekitar', () => {
    const [benih] = rencana(CONTOH_RESEP_SAWI_BEDENGAN, { luasM2: 100 });
    const k = { komoditasId: 'sawi', tanggal: TANGGAL, kelayakan: [] };
    const b = benih as ItemRencana;
    expect(pastikan(hargaItemRencana(b, k, 20_000))).toMatchObject({
      harga: 20_000,
      sumber: 'rata_sekitar',
    });
    const merek = { id: 'm', nama: 'Daun Lebat', hargaKemasan: 30_000, isiKemasan: 1 };
    expect(pastikan(hargaItemRencana({ ...b, merek }, k, 20_000))).toMatchObject({
      harga: 30_000,
      sumber: 'merek',
    });
    expect(
      pastikan(hargaItemRencana({ ...b, merek, hargaIsiSendiri: 27_000 }, k, 20_000)),
    ).toMatchObject({ harga: 27_000, sumber: 'isi_sendiri' });
  });

  it('padi: urea layak subsidi; memilih Subsidi memakai HET dan menandai siklus bersubsidi', () => {
    const items = rencana(CONTOH_RESEP_PADI_SAWAH, { luasM2: 1000 });
    const nonsub = semuaHarga(items, 'padi');
    const urea = items.find((i) => i.inputId === 'urea') as ItemRencana;
    expect(nonsub.get(urea.id)).toMatchObject({ layakSubsidi: true, sumber: 'contoh_resep' });
    const dengan = items.map((i) => (i.id === urea.id ? { ...i, pilihSubsidi: true } : i));
    const sub = semuaHarga(dengan, 'padi');
    expect(sub.get(urea.id)).toMatchObject({ harga: 2250, sumber: 'subsidi' });
    expect(pakaiSubsidi(sub)).toBe(true);
  });

  it('hidroponik: alat dibagi ke 10 siklus atau ditanggung penuh', () => {
    const items = rencana(
      CONTOH_RESEP_SAWI_HIDROPONIK,
      { jumlahTanaman: 200, volumeLarutanLiter: 100 },
      'lubang',
    );
    const harga = semuaHarga(items, 'sawi');
    const dibagi = pastikan(ringkasRencana(items, harga, true));
    const penuh = pastikan(ringkasRencana(items, harga, false));
    expect(dibagi.biayaAlatPerSiklus).toBe(dibagi.totalAlat / SIKLUS_PEMBAGIAN_ALAT);
    expect(penuh.totalModal - dibagi.totalModal).toBe(dibagi.totalAlat - dibagi.biayaAlatPerSiklus);
  });

  it('item tambahan tanpa harga membuat total belum lengkap dan tanpa nama ditolak saat simpan', () => {
    const items = [
      ...rencana(CONTOH_RESEP_SAWI_BEDENGAN, { luasM2: 100 }),
      itemTambahan('t1', 'Tambahan'),
    ];
    const harga = semuaHarga(items, 'sawi');
    const r = pastikan(ringkasRencana(items, harga, true));
    expect(r.lengkap).toBe(false);
    expect(r.itemTanpaHarga).toEqual(['t1']);
    expect(keBarisRencana(items, harga)).toEqual({ ok: false, galat: 'NAMA_ITEM_KOSONG' });
    const bernama = items.map((i) =>
      i.id === 't1' ? { ...i, nama: ' Sewa cangkul ', jumlah: -1 } : i,
    );
    expect(keBarisRencana(bernama, harga)).toEqual({ ok: false, galat: 'JUMLAH_NEGATIF' });
  });

  it('pemetaan ke baris rencana_item memakai harga efektif dan merek', () => {
    const items = rencana(CONTOH_RESEP_SAWI_BEDENGAN, { luasM2: 100 });
    const pilih = items.map((i, n) =>
      n === 0
        ? { ...i, merek: { id: 'merek-1', nama: 'x', hargaKemasan: 24_000, isiKemasan: 1 } }
        : i,
    );
    const baris = pastikan(keBarisRencana(pilih, semuaHarga(pilih, 'sawi')));
    expect(baris).toHaveLength(items.length);
    expect(baris[0]).toMatchObject({
      merek_id: 'merek-1',
      harga_satuan: 24_000,
      resep_input_id: items[0]!.id,
    });
    expect(baris[1]?.merek_id).toBeNull();
  });
});
