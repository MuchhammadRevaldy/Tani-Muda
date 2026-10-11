import { describe, expect, it } from 'vitest';
import { muatDataContoh } from './data/muat-data';
import { periksaInvarianPesanan } from './invarian';

/**
 * Invarian kolom turunan (D-52); setelah setiap alur dicek di rangkaian kontrak. Data contoh adalah
 * objek modul bersama, jadi tes yang mengubahnya bekerja pada salinan.
 */
describe('periksaInvarianPesanan', () => {
  it('data contoh memenuhi semua invarian', () => {
    expect(periksaInvarianPesanan(muatDataContoh().pesanan)).toEqual([]);
  });

  it('menangkap saldo uang muka, kg terambil, dan dana diterima yang menyimpang', () => {
    const d = structuredClone(muatDataContoh().pesanan);
    const pesanan = d.pesanan.find((p) => p.saldo_uang_muka > 0)!;
    pesanan.saldo_uang_muka += 1000;
    const diambil = d.pesanan.find((p) => p.terambil_kg > 0)!;
    diambil.terambil_kg += 1;
    const diterima = d.pengiriman.find((x) => x.nilai_diterima !== null)!;
    diterima.nilai_diterima = diterima.nilai_diterima! - 500;
    const terjadwal = d.pengiriman.find((x) => x.status === 'terjadwal')!;
    terjadwal.nilai_diterima = 0;

    const salah = periksaInvarianPesanan(d);
    expect(salah).toHaveLength(4);
    expect(salah.join('\n')).toMatch(/saldo_uang_muka[\s\S]*terambil_kg/);
    expect(salah.some((s) => s.startsWith(`${diterima.id}: nilai_diterima`))).toBe(true);
    expect(salah).toContain(`${terjadwal.id}: nilai_diterima 0, seharusnya null`);
  });

  it('alokasi yang gagal atau dibatalkan tidak dihitung terambil', () => {
    const d = structuredClone(muatDataContoh().pesanan);
    const a = d.alokasi[0]!;
    a.status = 'gagal';
    expect(periksaInvarianPesanan(d)).toContain(
      `${a.pesanan_id}: terambil_kg ${d.pesanan.find((p) => p.id === a.pesanan_id)!.terambil_kg}, seharusnya 0`,
    );
  });
});
