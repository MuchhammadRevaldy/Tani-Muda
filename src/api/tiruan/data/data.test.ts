import { describe, expect, it } from 'vitest';
import { pastikan } from '../../../lib/hasil';
import { kapasitasLahan } from '../../../lib/kapasitas-lahan';
import { jarakKm, urutkanTerdekat } from '../../../lib/jarak';
import { hitungKebutuhanResep } from '../../../lib/kebutuhan';
import { hitungModal } from '../../../lib/modal';
import { hitungNilaiPesanan } from '../../../lib/pesanan-nilai';
import { SEMUA_CONTOH_RESEP } from '../../../lib/fixtures/contoh-resep';
import { lahanKeDomain, resepKeDomain, siklusKeDomain } from '../../peta';
import { pecahDataContoh } from './berkas-data';
import { muatDataContoh } from './muat-data';
import { buatDataContoh } from './pembuat-data';

const data = muatDataContoh();

describe('data contoh JSON', () => {
  it('sama persis dengan keluaran pembuat data (jalankan `npm run data-contoh` bila berbeda)', () => {
    expect(JSON.parse(JSON.stringify(pecahDataContoh(buatDataContoh())))).toEqual(
      pecahDataContoh(data),
    );
  });
});

describe('T3.06 referensi, wilayah, konfigurasi', () => {
  it('ID wilayah memakai format kode Kemendagri (D-27); dua kode sudah terverifikasi', () => {
    for (const w of data.wilayah) expect(w.id).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    expect(
      data.wilayah
        .filter((w) => w.kode_terverifikasi)
        .map((w) => w.id)
        .sort(),
    ).toEqual(['32.17.01.2003', '32.17.01.2013']);
  });
  it('angka bisnis hanya ada di konfigurasi', () => {
    expect(data.konfigurasi).toMatchObject({
      persen_uang_muka: 20,
      persen_layanan: 5,
      jam_periksa_rutin: 6,
      jam_periksa_sekali_panen: 24,
      hari_kabar_gagal_panen: 3,
      radius_km: 10,
    });
    expect(data.konfigurasi).toMatchObject({ batas_video_mb: 15, batas_unduhan_offline_mb: 200 });
  });
  it('setiap merek punya input, setiap laporan punya merek dan pelapor yang ada', () => {
    const input = new Set(data.referensi.input_pertanian.map((i) => i.id));
    const merek = new Set(data.referensi.merek_input.map((m) => m.id));
    const pengguna = new Set(data.pengguna.pengguna.map((p) => p.id));
    for (const m of data.referensi.merek_input) expect(input.has(m.input_id)).toBe(true);
    for (const l of data.referensi.laporan_harga) {
      expect(merek.has(l.merek_id)).toBe(true);
      expect(pengguna.has(l.pelapor_id)).toBe(true);
    }
  });
  it('nomor HP fiktif dan unik', () => {
    const nomor = data.pengguna.pengguna.map((p) => p.nomor_hp);
    expect(new Set(nomor).size).toBe(nomor.length);
    for (const n of nomor) expect(n).toMatch(/^\+6281[2-5]000000\d{2}$/);
  });
});

describe('T3.07 resep dan modul', () => {
  it('resep diturunkan dari fixture T2.01 (bukan disalin dengan angka berbeda)', () => {
    expect(data.resep.map(resepKeDomain)).toEqual(expect.arrayContaining(SEMUA_CONTOH_RESEP));
    expect(data.resep).toHaveLength(SEMUA_CONTOH_RESEP.length);
  });
  it('semua resep draf contoh; bayam dan kangkung bertanda angka dikarang', () => {
    for (const r of data.resep) {
      expect(r.status).toBe('draf');
      expect(r.contoh).toBe(true);
    }
    expect(
      data.resep.filter((r) => r.asal_angka_contoh === 'dikarang').map((r) => r.komoditas_id),
    ).toEqual(['bayam', 'kangkung']);
  });
  it('kalkulator dengan data resep menghasilkan total fixture (Rp430.000)', () => {
    const r = resepKeDomain(data.resep.find((x) => x.id === 'resep-sawi-bedengan')!);
    const item = pastikan(hitungKebutuhanResep(r, 'luas', { luasM2: 100 })).map((k) => ({
      id: k.inputId,
      grup: k.grup,
      jumlah: k.jumlahBeli,
      hargaSatuan: k.hargaContoh,
      alatSekaliBeli: k.alatSekaliBeli,
    }));
    expect(
      pastikan(hitungModal(item, { bagiAlat: true, jumlahSiklusPembagian: 10 })).totalModal,
    ).toBe(430000);
  });
  it('hidroponik hanya sawi (D-05); 6 modul per resep; 3 video contoh 360p ≤ 15 MB (D-29)', () => {
    expect(
      data.resep.filter((r) => r.metode_id === 'hidroponik').map((r) => r.komoditas_id),
    ).toEqual(['sawi']);
    expect(data.modul).toHaveLength(data.resep.length * 6);
    const video = data.modul.filter((m) => m.video_url);
    expect(video).toHaveLength(3);
    for (const m of video)
      expect(m.ukuran_video_mb).toBeLessThanOrEqual(data.konfigurasi.batas_video_mb);
  });
});

describe('T3.08 pengguna uji, lahan, siklus, pesanan', () => {
  const peran = (id: string) => data.pengguna.pengguna.find((p) => p.id === id)!;
  it('setiap peran dan keadaan ada', () => {
    const uji = data.pengguna.pengguna_uji.map((u) => peran(u.pengguna_id));
    expect(new Set(uji.map((p) => p.peran))).toEqual(
      new Set(['petani', 'pembeli', 'mentor', 'admin']),
    );
    expect(uji.some((p) => p.status_akun === 'dinonaktifkan_sementara')).toBe(true);
    const status = data.pengguna.profil_pembeli.map((p) => p.status_verifikasi);
    expect(status).toContain('terverifikasi');
    expect(status).toContain('menunggu');
    expect(data.pengguna.catatan_petani.some((c) => c.petani_id === 'petani-budi')).toBe(true);
  });
  it('kapasitas lahan cukup untuk siklus yang memakai lahan; Arif sisa 20 m² dan 50 lubang', () => {
    const siklus = data.kebun.siklus.map(siklusKeDomain);
    for (const l of data.kebun.lahan) {
      const k = kapasitasLahan(lahanKeDomain(l), siklus);
      expect(k.dipakai).toBeLessThanOrEqual(k.total);
    }
    const sisa = (id: string) =>
      kapasitasLahan(lahanKeDomain(data.kebun.lahan.find((l) => l.id === id)!), siklus).sisa;
    expect(sisa('lahan-arif-kebun')).toBe(20);
    expect(sisa('lahan-arif-hidro')).toBe(50);
  });
  it('total alokasi tidak melebihi pesanan', () => {
    for (const p of data.pesanan.pesanan) {
      const total = data.pesanan.alokasi
        .filter((a) => a.pesanan_id === p.id)
        .reduce((s, a) => s + a.jumlah_kg, 0);
      expect(total).toBe(p.terambil_kg);
      expect(total).toBeLessThanOrEqual(p.jumlah_per_kiriman_kg ?? p.jumlah_total_kg);
    }
  });
  it('nilai uang konsisten dengan pesanan-nilai.ts; saldo = uang muka − pencairan dari uang muka', () => {
    for (const p of data.pesanan.pesanan) {
      const n = pastikan(
        hitungNilaiPesanan(
          p.jenis === 'rutin'
            ? {
                jenis: 'rutin',
                jumlahPerKirimanKg: p.jumlah_per_kiriman_kg!,
                jumlahKiriman: p.jumlah_kiriman,
                hargaPerKg: p.harga_per_kg,
              }
            : {
                jenis: 'sekali_panen',
                jumlahTotalKg: p.jumlah_total_kg,
                hargaPerKg: p.harga_per_kg,
              },
          {
            persenUangMuka: data.konfigurasi.persen_uang_muka,
            persenLayanan: data.konfigurasi.persen_layanan,
          },
        ),
      );
      expect([p.nilai_pesanan, p.uang_muka, p.biaya_layanan]).toEqual([
        n.nilaiPesanan,
        n.uangMuka,
        n.biayaLayanan,
      ]);
      const um = data.pesanan.pembayaran.find(
        (b) => b.pesanan_id === p.id && b.jenis === 'uang_muka',
      );
      if (!um) continue;
      const keluar = data.pesanan.pembayaran
        .filter((b) => b.referensi === um.referensi && b.jenis === 'pencairan')
        .reduce((s, b) => s + b.nominal, 0);
      expect(p.saldo_uang_muka).toBe(um.nominal - keluar);
    }
    // kiriman ke-2 Imas: bayam Rp6.000 × 5 kg, tolak 1 kg → dana cair Rp24.000
    expect(
      data.pesanan.pengiriman.find((k) => k.id === 'kiriman-imas-arif-2')?.nilai_diterima,
    ).toBe(24000);
  });
  it('urutan pesanan terbuka dari Desa Lembang: yang terdekat lebih dulu, Kota Bandung paling jauh', () => {
    const wil = (id: string) => data.wilayah.find((w) => w.id === id)!;
    const pusat = wil('32.17.01.2003');
    const terbuka = data.pesanan.pesanan.filter((p) => p.status !== 'menunggu_pembayaran');
    const urut = urutkanTerdekat(terbuka, pusat, (p) => wil(p.wilayah_id)).map((x) => [
      x.item.id,
      Math.round(x.jarakKm * 10) / 10,
    ]);
    expect(urut.at(-1)?.[0]).toBe('pesanan-lestari-kangkung');
    expect(jarakKm(pusat, wil('32.73.10.1001'))).toBeGreaterThan(data.konfigurasi.radius_km);
    expect(jarakKm(pusat, wil('32.73.10.1001'))).toBeLessThan(data.konfigurasi.radius_maks_km);
  });
});
