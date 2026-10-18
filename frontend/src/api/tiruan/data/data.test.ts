import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pastikan } from '../../../lib/hasil';
import { kapasitasLahan } from '../../../lib/kapasitas-lahan';
import { jarakKm, titikWilayah, urutkanTerdekat } from '../../../lib/jarak';
import { hitungKebutuhanResep } from '../../../lib/kebutuhan';
import { hitungModal } from '../../../lib/modal';
import { hitungNilaiPesanan } from '../../../lib/pesanan-nilai';
import { SEMUA_CONTOH_RESEP } from '../../../lib/fixtures/contoh-resep';
import { lahanKeDomain, resepKeDomain, siklusKeDomain } from '../../peta';
import { tambahHari } from '../../../lib/tanggal';
import { ZONA_BAWAAN } from '../../../lib/zona-waktu';
import { selesaikanTanggalRelatif } from '../tanggal-relatif';
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

/**
 * Kode wilayah resmi (D-54): dataset shared/wilayah/wilayah.sql (Kepmendagri, lihat README di
 * foldernya). Menggantikan pencocokan manual di docs/cek-wilayah.md.
 */
describe('wilayah data contoh cocok dengan dataset resmi', () => {
  const akar = new URL('../../../../../shared/wilayah/', import.meta.url);
  const sql = readFileSync(fileURLToPath(new URL('wilayah.sql', akar)), 'utf8');
  const resmi = new Map(
    [...sql.matchAll(/\('([0-9.]+)','((?:[^']|'')*)'\)/g)].map((m) => [
      m[1]!,
      m[2]!.replaceAll("''", "'"),
    ]),
  );
  const titik = (
    JSON.parse(readFileSync(fileURLToPath(new URL('titik-tengah.json', akar)), 'utf8')) as {
      titik: { id: string; desa: string; lintang: number; bujur: number }[];
    }
  ).titik;
  expect(titik.length).toBeGreaterThan(0);

  /** Semua nilai `wilayah_id` di seluruh data contoh. */
  function semuaWilayahId(x: unknown, hasil = new Set<string>()): Set<string> {
    if (Array.isArray(x)) x.forEach((y) => semuaWilayahId(y, hasil));
    else if (x && typeof x === 'object')
      for (const [k, v] of Object.entries(x)) {
        if (k === 'wilayah_id' && typeof v === 'string') hasil.add(v);
        else semuaWilayahId(v, hasil);
      }
    return hasil;
  }

  it('dataset terbaca utuh', () => {
    expect(resmi.size).toBe(91599);
    expect(resmi.get('33.10.16.2013')).toBe('Delanggu');
  });
  it('setiap wilayah di data contoh ada di dataset dengan nama desa, kecamatan, kabupaten, dan provinsi yang sama', () => {
    for (const w of data.wilayah) {
      const [pp, kk, cc] = w.id.split('.');
      expect([w.id, resmi.get(w.id)]).toEqual([w.id, w.desa]);
      expect(resmi.get(`${pp}.${kk}.${cc}`)).toBe(w.kecamatan);
      expect(resmi.get(`${pp}.${kk}`)).toBe(w.kabupaten);
      expect(resmi.get(`${pp}`)).toBe(w.provinsi);
    }
  });
  it('setiap wilayah_id yang dirujuk data contoh ada di dataset dan di daftar wilayah data contoh', () => {
    const dirujuk = [...semuaWilayahId(data)];
    expect(dirujuk.length).toBeGreaterThan(5);
    const daftar = new Set(data.wilayah.map((w) => w.id));
    expect(dirujuk.filter((id) => !resmi.has(id) || !daftar.has(id))).toEqual([]);
  });
  it('titik tengah desa di data contoh sesuai titik kecamatan Jawa Tengah (D-67, AG-41)', () => {
    const jateng = JSON.parse(
      readFileSync(fileURLToPath(new URL('titik-kecamatan-jateng.json', akar)), 'utf8'),
    ) as {
      kecamatan: Record<string, { lintang: number; bujur: number }>;
    };
    // Satu desa tanpa titik untuk menguji desa yang belum punya koordinat (D-56, D-67).
    expect(data.wilayah.filter((w) => w.lintang === null).map((w) => w.id)).toEqual([
      '33.10.01.2012',
    ]);
    const delanggu = jateng.kecamatan['33.10.16']!;
    expect(delanggu).toBeDefined();
    const desaDelanggu = data.wilayah.find((w) => w.id === '33.10.16.2013')!;
    expect(desaDelanggu).toMatchObject({
      desa: 'Delanggu',
      lintang: delanggu.lintang,
      bujur: delanggu.bujur,
    });
  });
});

describe('T3.06 referensi, wilayah, konfigurasi', () => {
  it('ID wilayah memakai format kode Kemendagri (D-27); semua sudah dicocokkan (D-54)', () => {
    for (const w of data.wilayah) {
      expect(w.id).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
      expect(w.kode_terverifikasi).toBe(true);
    }
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
  it('semua resep draf contoh; resep tanpa validasi bertanda angka dikarang (D-34, F-02)', () => {
    for (const r of data.resep) {
      expect(r.status).toBe('draf');
      expect(r.contoh).toBe(true);
    }
    const dikarang = data.resep
      .filter((r) => r.asal_angka_contoh === 'dikarang')
      .map((r) => r.komoditas_id);
    expect([...new Set(dikarang)]).toEqual(['bayam', 'kangkung', 'cabai', 'tomat', 'selada']);
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
  it('hidroponik untuk sawi dan selada (D-05, F-02); 6 modul per resep; 3 video contoh 360p ≤ 15 MB (D-29)', () => {
    const hidro = data.resep
      .filter((r) => r.metode_id === 'hidroponik')
      .map((r) => r.komoditas_id);
    expect([...new Set(hidro)]).toEqual(['sawi', 'selada']);
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
  it('kapasitas lahan cukup untuk siklus yang memakai lahan; petak pesanan rutin dihitung dari puncaknya (D-40)', () => {
    // Tanggal relatif diselesaikan supaya rentang tanam sampai panen setiap petak bisa dibandingkan.
    const nyata = selesaikanTanggalRelatif(data, '2026-10-05', ZONA_BAWAAN);
    const umur = new Map(nyata.resep.map((r) => [r.id, r.umur_panen_hari]));
    const siklus = nyata.kebun.siklus.map((s) => ({
      ...siklusKeDomain(s),
      tanggalPanen: s.tanggal_tanam ? tambahHari(s.tanggal_tanam, umur.get(s.resep_id) ?? 0) : null,
    }));
    for (const l of data.kebun.lahan) {
      const k = kapasitasLahan(lahanKeDomain(l), siklus);
      expect(k.dipakai).toBeLessThanOrEqual(k.total);
    }
    const sisa = (id: string) =>
      kapasitasLahan(lahanKeDomain(data.kebun.lahan.find((l) => l.id === id)!), siklus).sisa;
    // 180 m² − sawi 100 − petak Ratna 4 × 6,67 (4 tumbuh bersamaan) − petak Imas 2 × 4,17 = 44,98.
    expect(sisa('lahan-arif-kebun')).toBe(44.98);
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
  it('urutan pesanan terbuka dari Desa Delanggu: yang terdekat lebih dulu, Klaten Tengah paling jauh', () => {
    const wil = (id: string) => titikWilayah(data.wilayah.find((w) => w.id === id)!)!;
    const pusat = wil('33.10.16.2013');
    const terbuka = data.pesanan.pesanan.filter((p) => p.status !== 'menunggu_pembayaran');
    const urut = urutkanTerdekat(terbuka, pusat, (p) => wil(p.wilayah_id)).map((x) => [
      x.item.id,
      Math.round(x.jarakKm * 10) / 10,
    ]);
    expect(urut.at(-1)?.[0]).toBe('pesanan-lestari-kangkung');
    expect(jarakKm(pusat, wil('33.10.25.1001'))).toBeGreaterThan(data.konfigurasi.radius_km);
    expect(jarakKm(pusat, wil('33.10.25.1001'))).toBeLessThan(data.konfigurasi.radius_maks_km);
  });
});

describe('jalur gambar dan berkas data contoh ada di public', () => {
  const publicDir = fileURLToPath(new URL('../../../../public', import.meta.url));

  function kumpulkanJalurBerkas(x: unknown, hasil = new Set<string>()): Set<string> {
    if (typeof x === 'string') {
      if (x.startsWith('/') && /\.(svg|png|jpg|jpeg|webp|mp4|webm|ico|pdf)$/i.test(x)) {
        hasil.add(x);
      }
    } else if (Array.isArray(x)) {
      x.forEach((item) => kumpulkanJalurBerkas(item, hasil));
    } else if (x && typeof x === 'object') {
      for (const val of Object.values(x)) {
        kumpulkanJalurBerkas(val, hasil);
      }
    }
    return hasil;
  }

  it('setiap jalur gambar dan berkas di shared/data-contoh/ benar-benar ada di frontend/public/', () => {
    const jalur = [...kumpulkanJalurBerkas(data)];
    expect(jalur.length).toBeGreaterThan(5);
    const hilang = jalur.filter((j) => !existsSync(join(publicDir, j.replace(/^\//, ''))));
    expect(hilang).toEqual([]);
  });
});
