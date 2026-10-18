import { describe, expect, it } from 'vitest';
import { buatKlienTiruan } from './klien-tiruan';

/**
 * Sisa pesanan rutin per kiriman (tanggapan D-53, usulan D-54). Kedua skenario gagal dengan model
 * sekarang, yang menghitung sisa per pesanan (`jumlah_per_kiriman_kg` − Σ alokasi aktif):
 * - (A) kiriman yang belum terkejar petani A tidak lagi ditawarkan ke petani B (D-39);
 * - (B) kiriman yang gagal panen tidak ditawarkan ulang ke petani lain (D-03).
 * Ditandai `it.fails` sampai model kapasitas per kiriman ditetapkan; bila model sudah diubah,
 * tes ini lulus, sehingga `it.fails` gagal dan penandanya wajib dihapus.
 */
const AWAL = Date.parse('2026-10-05T01:00:00Z');
let n = 0;
const kunci = () => `sisa-rutin-${++n}`;

async function siapkan() {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null, jam: () => AWAL });
  const K = t.klien;
  // Pesanan rutin 10 kg × 12 kiriman, mulai 5 November (H+31), mingguan.
  await t.kontrol.masukSebagai('pembeli-ratna');
  const p = await K.pembeli.buatPesanan({
    jenis: 'rutin',
    komoditas_id: 'sawi',
    jumlah_per_kiriman_kg: 10,
    frekuensi_hari: 7,
    durasi_hari: 84,
    tanggal_mulai: '2026-11-05',
    harga_per_kg: 5000,
    standar_kualitas: [],
    wilayah_id: '33.10.16.2005',
    alamat_antar: 'Jl. Uji Sisa',
  });
  expect(p.jumlah_kiriman).toBe(12);
  await K.pembeli.bayarUangMuka(p.id, { kunci_idempoten: kunci() });
  return { t, K, p };
}

async function lahanBaru(
  K: ReturnType<typeof buatKlienTiruan>['klien'],
  jenis: 'kebun' | 'hidroponik',
) {
  return K.lahan.buat({
    nama: `Lahan uji ${jenis}`,
    jenis_lahan: jenis,
    satuan_asli: 'm2',
    nilai_asli: jenis === 'kebun' ? 2000 : 100,
    ...(jenis === 'hidroponik' ? { kapasitas_lubang: 20000 } : {}),
    wilayah_id: '33.10.16.2013',
  });
}

describe('sisa pesanan rutin per kiriman (D-54)', () => {
  it.fails(
    '(A) kiriman ke-1 yang belum terkejar petani A masih bisa diambil petani B (D-39)',
    async () => {
      const { t, K, p } = await siapkan();
      // Petani A: sawi hidroponik 35 hari, kiriman 5 November belum terkejar → mulai kiriman ke-2.
      await t.kontrol.masukSebagai('petani-arif');
      const hidro = await lahanBaru(K, 'hidroponik');
      const a = await K.pesanan.ambilPesanan(p.id, {
        kunci_idempoten: kunci(),
        jumlah_kg: 10,
        lahan_id: hidro.id,
      });
      await K.pesanan.setujuiKesepakatan(a.alokasi.id);
      const kirimanA = (await K.kiriman.saya()).filter((x) => x.alokasi_id === a.alokasi.id);
      expect(kirimanA[0]?.ke).toBe(2);
      expect(kirimanA).toHaveLength(11);

      // Petani B: sawi bedengan 28 hari, kiriman ke-1 terkejar. Bagian itu harus tetap ditawarkan.
      await t.kontrol.masukSebagai('petani-dewi');
      const kebun = await lahanBaru(K, 'kebun');
      const terlihat = (await K.pesanan.sekitar()).data.find((x) => x.id === p.id);
      expect(terlihat).toBeDefined();
      const b = await K.pesanan.ambilPesanan(p.id, {
        kunci_idempoten: kunci(),
        jumlah_kg: 10,
        lahan_id: kebun.id,
      });
      await K.pesanan.setujuiKesepakatan(b.alokasi.id);
      const kirimanB = (await K.kiriman.saya()).filter((x) => x.alokasi_id === b.alokasi.id);
      expect(kirimanB.map((x) => x.ke)).toEqual([1]);
    },
  );

  it.fails(
    '(B) 10 kg kiriman ke-5 yang gagal panen muncul lagi di Pesanan di sekitar (D-03)',
    async () => {
      const { t, K, p } = await siapkan();
      await t.kontrol.masukSebagai('petani-dewi');
      const kebun = await lahanBaru(K, 'kebun');
      const a = await K.pesanan.ambilPesanan(p.id, {
        kunci_idempoten: kunci(),
        jumlah_kg: 10,
        lahan_id: kebun.id,
      });
      await K.pesanan.setujuiKesepakatan(a.alokasi.id);
      const kiriman = (await K.kiriman.saya()).filter((x) => x.alokasi_id === a.alokasi.id);
      const ke5 = kiriman.find((x) => x.ke === 5)!;
      const g = await K.pesanan.laporGagalPanen(a.alokasi.id, {
        pengiriman_id: ke5.id,
        alasan: 'Bedengan terendam banjir',
      });
      expect(g.tepat_waktu).toBe(true);
      expect(g.alokasi.status).toBe('disepakati');

      // Petani lain harus melihat 10 kg kiriman ke-5 (17 Desember) sebagai sisa yang bisa diambil.
      await t.kontrol.masukSebagai('petani-arif');
      const terlihat = (await K.pesanan.sekitar()).data.find((x) => x.id === p.id);
      expect(terlihat?.sisa_kg).toBe(10);
    },
  );
});
