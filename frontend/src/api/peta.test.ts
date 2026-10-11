import { describe, expect, it } from 'vitest';
import { SEMUA_CONTOH_RESEP } from '../lib/fixtures/contoh-resep';
import { CONTOH_METODE } from '../lib/fixtures/contoh-referensi';
import { buatJadwal } from '../lib/jadwal-buat';
import { pastikan } from '../lib/hasil';
import {
  konfigurasiKeDomain,
  pengaturanKeDomain,
  resepDariDomain,
  resepKeDomain,
  tugasDariDomain,
  tugasKeDomain,
} from './peta';

describe('peta API ↔ domain', () => {
  it.each(SEMUA_CONTOH_RESEP.map((r) => [r.id, r] as const))(
    'resep %s bolak-balik tanpa kehilangan data',
    (_id, r) => {
      const dasar = CONTOH_METODE.find((m) => m.id === r.metodeId)!.dasarUkuran;
      const api = resepDariDomain(r, dasar);
      expect(api.dasar_ukuran).toBe(dasar);
      expect(Object.keys(api)).toContain('komoditas_id');
      expect(resepKeDomain(api)).toEqual(r);
    },
  );
  it('tugas bolak-balik dengan ID berawalan siklus', () => {
    const r = SEMUA_CONTOH_RESEP[1]!;
    const [t] = pastikan(buatJadwal(r.tugas, '2026-10-01')).filter((x) => x.tipe === 'ukur');
    const api = tugasDariDomain(t!, 'siklus-9');
    expect(api.id).toBe(`siklus-9:${t!.id}`);
    expect(api.ukur?.[0]).toMatchObject({ batas_bawah: 5.5, skala_maks: 14 });
    expect(tugasKeDomain(api)).toEqual({ ...t, id: api.id });
  });
  it('pengaturan pengingat "06:30" → 6 dan 30', () => {
    expect(
      pengaturanKeDomain({
        siklus_id: 's',
        jam_pagi: '06:30',
        pengingat_sore: false,
        tipe_aktif: { sekali: true, berulang: false, ukur: true },
      }),
    ).toEqual({
      jamPagi: 6,
      menitPagi: 30,
      soreAktif: false,
      tipeAktif: { sekali: true, berulang: false, ukur: true },
    });
  });
  it('konfigurasi', () => {
    const k = konfigurasiKeDomain({
      persen_uang_muka: 20,
      persen_layanan: 5,
      jam_periksa_rutin: 6,
      jam_periksa_sekali_panen: 24,
      hari_kabar_gagal_panen: 3,
      radius_km: 10,
    } as never);
    expect(k).toEqual({
      persenUangMuka: 20,
      persenLayanan: 5,
      jamPeriksa: { rutin: 6, sekali_panen: 24 },
      hariKabarGagalPanen: 3,
      radiusKm: 10,
    });
  });
});
