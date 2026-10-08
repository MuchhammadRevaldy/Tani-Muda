/**
 * Rangkaian tes kontrak klien API (T3.12). Dijalankan terhadap implementasi `KlienApi` mana pun:
 * klien tiruan di Tahap 3 (src/api/tiruan/kontrak.test.ts) dan klien HTTP ke backend lokal di
 * Tahap 6. Setiap endpoint di docs/kontrak-api.md punya minimal satu kasus, ditambah aturan akses
 * utama (D-22), uang (D-02), kapasitas (D-15, D-34), dan privasi (D-06).
 *
 * Data awal = data contoh (src/api/tiruan/data/*.json) dengan hari ini 2026-10-05 08.00 WIB.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { adalahGalatApi, type GalatApi, type KodeGalatApi } from './galat';
import type { KlienApi } from './klien';

export interface Lingkungan {
  klien: KlienApi;
  /** Masuk sebagai pengguna data contoh (tiruan: langsung; HTTP: lewat OTP driver log). */
  masukSebagai(penggunaId: string): Promise<void>;
  /** Kode OTP terakhir untuk nomor (tiruan: panel kode uji; HTTP: dibaca dari log). */
  kodeOtp(nomorHp: string): Promise<string | null>;
  /** Majukan jam (ms). Bila tidak tersedia, tes yang butuh waktu dilewati. */
  majukanJam?: (ms: number) => void;
}

export type PenyiapLingkungan = (opsi: { tampilkanResepContoh: boolean }) => Promise<Lingkungan>;

/** Tangkap galat API dan periksa kode, status, dan kolom rinciannya. */
export async function galatDari(janji: Promise<unknown>): Promise<GalatApi> {
  try {
    await janji;
  } catch (e) {
    if (adalahGalatApi(e)) return e;
    throw e;
  }
  throw new Error('Diharapkan galat API, tetapi berhasil');
}

export async function harapGalat(
  janji: Promise<unknown>,
  kode: KodeGalatApi,
  status?: number,
  kolom?: string,
): Promise<GalatApi> {
  const g = await galatDari(janji);
  expect(g.kode).toBe(kode);
  if (status !== undefined) expect(g.status).toBe(status);
  if (kolom !== undefined) expect(Object.keys(g.rincian)).toContain(kolom);
  expect(g.message.length).toBeGreaterThan(0);
  expect(g.keJson().galat).toMatchObject({ kode, pesan: g.message });
  return g;
}

const JAM = 3_600_000;
const kunci = (() => {
  let n = 0;
  return () => `uji-${++n}`;
})();

export function ujiKontrak(nama: string, siapkan: PenyiapLingkungan): void {
  describe(`kontrak API: ${nama}`, () => {
    let L: Lingkungan;
    let K: KlienApi;
    const masuk = (id: string) => L.masukSebagai(id);
    beforeEach(async () => {
      L = await siapkan({ tampilkanResepContoh: true });
      K = L.klien;
    });

    // ------------------------------------------------------------ format umum
    describe('format galat dan akses dasar', () => {
      it('belum masuk: akun null, endpoint lain 401 BELUM_MASUK', async () => {
        expect(await K.akun.ambil()).toBeNull();
        await harapGalat(K.referensi.komoditas(), 'BELUM_MASUK', 401);
      });
      it('konfigurasi terbuka tanpa masuk; angka bisnis dari konfigurasi', async () => {
        expect(await K.referensi.konfigurasi()).toMatchObject({
          persen_uang_muka: 20,
          persen_layanan: 5,
          jam_periksa_rutin: 6,
          jam_periksa_sekali_panen: 24,
          batas_video_mb: 15,
          batas_unduhan_offline_mb: 200,
        });
      });
      it('peran salah → 403 TIDAK_DIIZINKAN', async () => {
        await masuk('pembeli-ratna');
        await harapGalat(K.lahan.daftar(), 'TIDAK_DIIZINKAN', 403);
        await harapGalat(K.admin.pembeliMenunggu(), 'TIDAK_DIIZINKAN', 403);
      });
    });

    // ------------------------------------------------------------ akun
    describe('akun', () => {
      it('kirim OTP: nomor tidak valid ditolak; respons tidak memuat kode', async () => {
        await harapGalat(
          K.akun.kirimOtp({ nomor_hp: '021-123' }),
          'NOMOR_HP_TIDAK_VALID',
          422,
          'nomor_hp',
        );
        const r = await K.akun.kirimOtp({ nomor_hp: '0812 0000 0001' });
        expect(r).toEqual({
          nomor_hp: '+6281200000001',
          kirim_ulang_dalam_detik: 60,
          kedaluwarsa_dalam_detik: 300,
        });
        const kode = await L.kodeOtp('+6281200000001');
        expect(JSON.stringify(r)).not.toContain(kode as string);
        await harapGalat(K.akun.kirimOtp({ nomor_hp: '081200000001' }), 'TERLALU_SERING', 429);
      });
      it('pengguna lama masuk dengan OTP; kode salah ditolak', async () => {
        await K.akun.kirimOtp({ nomor_hp: '081200000001' });
        const kode = (await L.kodeOtp('+6281200000001')) as string;
        const salah = kode === '000000' ? '111111' : '000000';
        await harapGalat(
          K.akun.verifikasiOtp({ nomor_hp: '081200000001', kode: salah }),
          'OTP_SALAH',
          422,
        );
        const r = await K.akun.verifikasiOtp({ nomor_hp: '081200000001', kode });
        expect(r.pengguna_baru).toBe(false);
        expect(r.akun.pengguna).toMatchObject({
          id: 'petani-arif',
          peran: 'petani',
          zona_waktu: 'Asia/Jakarta',
        });
        expect((await K.akun.ambil())?.pengguna.id).toBe('petani-arif');
        await K.akun.keluar();
        expect(await K.akun.ambil()).toBeNull();
      });
      it('pengguna baru wajib setuju privasi (D-30), lalu memilih peran dan desa', async () => {
        await K.akun.kirimOtp({ nomor_hp: '085700000009' });
        const kode = (await L.kodeOtp('+6285700000009')) as string;
        await harapGalat(
          K.akun.verifikasiOtp({ nomor_hp: '085700000009', kode }),
          'VALIDASI',
          422,
          'setuju_privasi',
        );
        const r = await K.akun.verifikasiOtp({
          nomor_hp: '085700000009',
          kode,
          setuju_privasi: true,
        });
        expect(r.pengguna_baru).toBe(true);
        expect(r.akun.pengguna).toMatchObject({
          peran: null,
          versi_privasi: 'draf-2026-10',
          zona_waktu: 'Asia/Jakarta',
        });
        expect(r.akun.pengguna.setuju_privasi_pada).not.toBeNull();
        await harapGalat(K.lahan.daftar(), 'PERAN_BELUM_DIPILIH', 403);
        await harapGalat(
          K.akun.pilihPeran({ peran: 'petani', nama: 'Siti' }),
          'VALIDASI',
          422,
          'wilayah_id',
        );
        const a = await K.akun.pilihPeran({
          peran: 'petani',
          nama: 'Siti',
          wilayah_id: '32.17.01.2013',
        });
        expect(a.pengguna).toMatchObject({
          peran: 'petani',
          nama: 'Siti',
          wilayah_id: '32.17.01.2013',
        });
        await harapGalat(
          K.akun.pilihPeran({ peran: 'pembeli', nama: 'Siti' }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
      });
      it('ubah profil: zona waktu divalidasi', async () => {
        await masuk('petani-arif');
        await harapGalat(
          K.akun.ubahProfil({ zona_waktu: 'Bulan/Purnama' }),
          'VALIDASI',
          422,
          'zona_waktu',
        );
        expect(
          (await K.akun.ubahProfil({ nama: 'Arif S.', zona_waktu: 'Asia/Makassar' })).pengguna,
        ).toMatchObject({ nama: 'Arif S.', zona_waktu: 'Asia/Makassar' });
      });
      it('ganti nomor HP: kode dari nomor baru, nomor terpakai dan nomor sama ditolak (T4.36)', async () => {
        await masuk('petani-arif');
        const sama = await harapGalat(
          K.akun.kirimOtpNomorBaru({ nomor_hp: '081200000001' }),
          'VALIDASI',
          422,
          'nomor_hp',
        );
        expect(sama.rincian.nomor_hp?.[0]).toMatch(/nomormu sekarang/);
        await harapGalat(
          K.akun.kirimOtpNomorBaru({ nomor_hp: '081200000002' }),
          'NOMOR_SUDAH_DIPAKAI',
          409,
        );
        const r = await K.akun.kirimOtpNomorBaru({ nomor_hp: '0857 1111 2222' });
        expect(r.nomor_hp).toBe('+6285711112222');
        const kode = (await L.kodeOtp('+6285711112222')) as string;
        expect(JSON.stringify(r)).not.toContain(kode);
        const salah = kode === '000000' ? '111111' : '000000';
        await harapGalat(
          K.akun.gantiNomorHp({ nomor_hp: '085711112222', kode: salah }),
          'OTP_SALAH',
          422,
        );
        const akun = await K.akun.gantiNomorHp({ nomor_hp: '085711112222', kode });
        expect(akun.pengguna).toMatchObject({ id: 'petani-arif', nomor_hp: '+6285711112222' });
        // Masuk berikutnya memakai nomor baru (kirim ulang ke nomor yang sama perlu jeda 60 detik).
        if (!L.majukanJam) return;
        L.majukanJam(61_000);
        await K.akun.keluar();
        await K.akun.kirimOtp({ nomor_hp: '085711112222' });
        const kodeMasuk = (await L.kodeOtp('+6285711112222')) as string;
        const masukLagi = await K.akun.verifikasiOtp({ nomor_hp: '085711112222', kode: kodeMasuk });
        expect(masukLagi.akun.pengguna.id).toBe('petani-arif');
      });
      it('catatan petani hanya untuk dirinya (D-03)', async () => {
        await masuk('petani-budi');
        expect(await K.akun.catatanSaya()).toHaveLength(1);
        await masuk('petani-arif');
        expect(await K.akun.catatanSaya()).toEqual([]);
      });
      it('profil pembeli baru menunggu verifikasi', async () => {
        await K.akun.kirimOtp({ nomor_hp: '085700000010' });
        await K.akun.verifikasiOtp({
          nomor_hp: '085700000010',
          kode: (await L.kodeOtp('+6285700000010')) as string,
          setuju_privasi: true,
        });
        await K.akun.pilihPeran({ peran: 'pembeli', nama: 'Tono' });
        await harapGalat(
          K.akun.simpanProfilPembeli({
            nama_usaha: '',
            jenis_usaha: 'warung',
            alamat: 'x',
            wilayah_id: '32.17.01.2003',
          }),
          'VALIDASI',
          422,
          'nama_usaha',
        );
        const p = await K.akun.simpanProfilPembeli({
          nama_usaha: 'Warung Tono',
          jenis_usaha: 'warung',
          alamat: 'Jl. Contoh 1',
          wilayah_id: '32.17.01.2003',
        });
        expect(p.status_verifikasi).toBe('menunggu');
        expect((await K.akun.ambil())?.profil_pembeli?.nama_usaha).toBe('Warung Tono');
      });
    });

    // ------------------------------------------------------------ wilayah
    describe('wilayah', () => {
      beforeEach(() => masuk('petani-arif'));
      it('cari dan paginasi', async () => {
        const r = await K.wilayah.daftar({ cari: 'suka' });
        expect(r.data.map((w) => w.desa)).toEqual(['Sukajaya']);
        const h = await K.wilayah.daftar({ per_halaman: 3, halaman: 2 });
        expect(h.meta).toEqual({ halaman: 2, per_halaman: 3, total: 8, halaman_terakhir: 3 });
        expect(h.data).toHaveLength(3);
        expect((await K.wilayah.daftar({ per_halaman: 500 })).meta.per_halaman).toBe(100);
      });
      it('ambil satu; tidak ada → 404', async () => {
        expect(await K.wilayah.ambil('32.17.01.2003')).toMatchObject({
          desa: 'Lembang',
          kecamatan: 'Lembang',
        });
        await harapGalat(K.wilayah.ambil('99.99.99.9999'), 'TIDAK_DITEMUKAN', 404);
      });
    });

    // ------------------------------------------------------------ referensi
    describe('referensi', () => {
      beforeEach(() => masuk('petani-arif'));
      it('komoditas: status resep dan pesanan di sekitar', async () => {
        const k = await K.referensi.komoditas();
        const sawi = k.find((x) => x.id === 'sawi')!;
        expect(sawi).toMatchObject({ status_resep: 'tersedia', jumlah_pesanan_sekitar: 1 });
        expect(k.find((x) => x.id === 'cabai')?.status_resep).toBe('segera_hadir');
        expect(k.find((x) => x.id === 'kangkung')?.jumlah_pesanan_sekitar).toBe(0);
        expect((await K.referensi.komoditas({ jenis_lahan: 'sawah' })).map((x) => x.id)).toEqual([
          'padi',
          'jagung',
        ]);
      });
      it('metode, sistem hidroponik, konversi satuan', async () => {
        expect(await K.referensi.metode()).toHaveLength(4);
        expect((await K.referensi.sistemHidroponik()).find((s) => s.id === 'nft')).toMatchObject({
          liter_tandon_per_lubang: 0.5,
        });
        expect(await K.referensi.konversiSatuan('32.17.01.2003')).toEqual(
          expect.arrayContaining([{ wilayah_id: '32.17.01.2003', satuan: 'ru', nilai_m2: 14 }]),
        );
        await harapGalat(K.referensi.konversiSatuan('x'), 'TIDAK_DITEMUKAN', 404);
      });
      it('merek terurut laporan terbaru (P0-34), rata-rata sekitar (P1-02)', async () => {
        const m = await K.referensi.merek('npk-16');
        expect(m.map((x) => x.merek.nama)).toEqual(['Bumi Hijau', 'Daun Lebat', 'Sari Tani']);
        expect(m[0]).toMatchObject({
          harga_kemasan: 355000,
          harga_per_satuan: 14200,
          jumlah_pelapor: 3,
          hari_lalu: 4,
        });
        expect(await K.referensi.hargaSekitar('npk-16')).toEqual({
          input_id: 'npk-16',
          harga_per_satuan: 15100,
          jumlah_laporan: 10,
        });
        await harapGalat(K.referensi.merek('tidak-ada'), 'TIDAK_DITEMUKAN', 404);
      });
      it('lapor harga: merek ada dan "Merek lain, isi sendiri"', async () => {
        const l = await K.referensi.laporHarga({ merek_id: 'merek-9', harga_kemasan: 370000 });
        expect(l).toMatchObject({
          pelapor_id: 'petani-arif',
          kecamatan: 'Lembang',
          tanggal: '2026-10-05',
        });
        expect((await K.referensi.merek('npk-16'))[0]?.merek.nama).toBe('Daun Lebat');
        const baru = await K.referensi.laporHarga({
          merek_baru: {
            input_id: 'npk-16',
            nama: 'Pupuk Desa',
            isi_kemasan: 50,
            teks_kemasan: '50 kg',
          },
          harga_kemasan: 600000,
        });
        expect((await K.referensi.merek('npk-16')).some((x) => x.merek.id === baru.merek_id)).toBe(
          true,
        );
        await harapGalat(
          K.referensi.laporHarga({ merek_id: 'merek-9', harga_kemasan: -1 }),
          'VALIDASI',
          422,
          'harga_kemasan',
        );
      });
      it('promo terpisah dan berlaku; kelayakan subsidi', async () => {
        expect((await K.referensi.promo()).map((p) => p.id).sort()).toEqual([
          'promo-1',
          'promo-2',
          'promo-3',
          'promo-4',
        ]);
        expect(await K.referensi.kelayakanSubsidi('padi')).toHaveLength(2);
      });
    });

    // ------------------------------------------------------------ resep
    describe('resep (D-12)', () => {
      beforeEach(() => masuk('petani-arif'));
      it('daftar resep contoh, versi terbaru', async () => {
        const r = await K.resep.daftar({ komoditas_id: 'sawi' });
        expect(r.map((x) => x.metode_id).sort()).toEqual(['bedengan', 'hidroponik']);
        expect(r.every((x) => x.contoh && x.status === 'draf')).toBe(true);
        expect(await K.resep.ambil('resep-sawi-bedengan')).toMatchObject({
          hasil_per_satuan: 1.5,
          dasar_ukuran: 'luas',
        });
      });
      it('pengaturan resep contoh mati: tidak ada resep, komoditas segera hadir', async () => {
        const L2 = await siapkan({ tampilkanResepContoh: false });
        await L2.masukSebagai('petani-budi');
        expect(await L2.klien.resep.daftar()).toEqual([]);
        expect(
          (await L2.klien.referensi.komoditas()).every((x) => x.status_resep === 'segera_hadir'),
        ).toBe(true);
        await harapGalat(L2.klien.resep.ambil('resep-sawi-bedengan'), 'TIDAK_DITEMUKAN', 404);
        // Petani yang siklusnya memakai resep itu tetap bisa membukanya.
        await L2.masukSebagai('petani-arif');
        expect((await L2.klien.resep.ambil('resep-sawi-bedengan')).id).toBe('resep-sawi-bedengan');
      });
      it('contoh publik tanpa masuk: hanya data contoh perhitungan, tanpa data pengguna (D-45)', async () => {
        await K.akun.keluar();
        const c = await K.resep.contohPublik();
        expect(Object.keys(c).sort()).toEqual(['contoh', 'komoditas']);
        expect(c.komoditas.find((x) => x.id === 'sawi')).toEqual({
          id: 'sawi',
          nama: 'Sawi hijau',
          satuan_panen: 'kg',
          status_resep: 'tersedia',
        });
        expect(c.komoditas.find((x) => x.id === 'cabai')?.status_resep).toBe('segera_hadir');
        // Hanya pasangan contoh halaman depan, bukan seluruh resep.
        expect(c.contoh.map((x) => `${x.komoditas_id}/${x.metode_id}`).sort()).toEqual([
          'bayam/bedengan',
          'padi/sawah',
          'sawi/bedengan',
        ]);
        const sawi = c.contoh.find((x) => x.komoditas_id === 'sawi')!;
        expect(sawi).toMatchObject({ harga_jual_contoh: 5000, contoh: true, umur_panen_hari: 28 });
        // Tidak ada kolom resep lengkap atau data pengguna.
        const teks = JSON.stringify(c);
        for (const kolom of [
          'validator',
          'standar_kualitas',
          'ukur',
          'saran_terlambat',
          'nomor_hp',
          'petani_id',
          'pengguna_id',
        ])
          expect(teks).not.toContain(`"${kolom}"`);
        expect(Object.keys(sawi.tugas[0]!).sort()).toEqual([
          'hst_mulai',
          'hst_selesai',
          'id',
          'interval',
          'judul',
          'langkah_pertama',
          'tipe',
        ]);
        const L2 = await siapkan({ tampilkanResepContoh: false });
        expect((await L2.klien.resep.contohPublik()).contoh).toEqual([]);
      });
      it('minta resep tidak ganda', async () => {
        const a = await K.resep.minta({ komoditas_id: 'tomat', metode_id: 'bedengan' });
        expect(a.sudah_diminta).toBe(false);
        const b = await K.resep.minta({ komoditas_id: 'tomat', metode_id: 'bedengan' });
        expect(b).toEqual({ permintaan: a.permintaan, sudah_diminta: true });
        expect((await K.resep.permintaanSaya()).map((p) => p.komoditas_id).sort()).toEqual([
          'cabai',
          'tomat',
        ]);
        await harapGalat(
          K.resep.minta({ komoditas_id: 'durian' }),
          'VALIDASI',
          422,
          'komoditas_id',
        );
      });
    });

    // ------------------------------------------------------------ lahan
    describe('lahan (D-06, D-15)', () => {
      beforeEach(() => masuk('petani-arif'));
      it('daftar dengan kapasitas: kebun sisa 44,98 m², hidroponik sisa 50 lubang', async () => {
        const l = await K.lahan.daftar();
        expect(l.map((x) => x.id).sort()).toEqual(['lahan-arif-hidro', 'lahan-arif-kebun']);
        expect(l.find((x) => x.id === 'lahan-arif-kebun')?.kapasitas).toEqual({
          satuan: 'm2',
          // Sawi 100 + petak Ratna 4 × 6,67 yang tumbuh bersamaan + petak Imas 2 × 4,17 (D-40).
          total: 180,
          dipakai: 135.02,
          sisa: 44.98,
        });
        expect(l.find((x) => x.id === 'lahan-arif-hidro')?.kapasitas).toEqual({
          satuan: 'lubang',
          total: 200,
          dipakai: 150,
          sisa: 50,
        });
      });
      it('lahan orang lain → 404 (D-22)', async () => {
        await harapGalat(K.lahan.ubah('lahan-dewi-sawah', { nama: 'x' }), 'TIDAK_DITEMUKAN', 404);
        await harapGalat(K.lahan.hapus('lahan-dewi-sawah'), 'TIDAK_DITEMUKAN', 404);
      });
      it('buat dengan satuan lokal, ubah, hapus', async () => {
        const l = await K.lahan.buat({
          nama: 'Petak baru',
          jenis_lahan: 'pekarangan',
          satuan_asli: 'ru',
          nilai_asli: 5,
          wilayah_id: '32.17.01.2003',
        });
        expect(l).toMatchObject({
          luas_m2: 70,
          satuan_asli: 'ru',
          nilai_asli: 5,
          kapasitas: { satuan: 'm2', sisa: 70 },
        });
        expect((await K.lahan.ubah(l.id, { nilai_asli: 10 })).luas_m2).toBe(140);
        await K.lahan.hapus(l.id);
        expect((await K.lahan.daftar()).some((x) => x.id === l.id)).toBe(false);
      });
      it('validasi: hidroponik wajib kapasitas lubang; luas kosong; lahan dipakai tidak bisa dihapus', async () => {
        await harapGalat(
          K.lahan.buat({
            nama: 'Rak',
            jenis_lahan: 'hidroponik',
            satuan_asli: 'm2',
            nilai_asli: 5,
            wilayah_id: '32.17.01.2003',
          }),
          'VALIDASI',
          422,
          'kapasitas_lubang',
        );
        await harapGalat(
          K.lahan.buat({
            nama: 'X',
            jenis_lahan: 'kebun',
            satuan_asli: 'm2',
            nilai_asli: 0,
            wilayah_id: '32.17.01.2003',
          }),
          'UKURAN_KOSONG',
          422,
          'nilai_asli',
        );
        await harapGalat(K.lahan.hapus('lahan-arif-kebun'), 'STATUS_TIDAK_SESUAI', 409);
      });
    });

    // ------------------------------------------------------------ kebun
    describe('kebun', () => {
      beforeEach(() => masuk('petani-arif'));
      const rencanaSawi = (luas: number) => [
        {
          resep_input_id: 'benih',
          nama: 'Benih sawi hijau',
          grup: 'Benih',
          jumlah: 1,
          satuan: 'bungkus',
          harga_satuan: 25000,
          alat_sekali_beli: false,
        },
        {
          nama: 'Tenaga',
          grup: 'Tenaga dan air',
          jumlah: luas > 0 ? 1 : 0,
          satuan: 'siklus',
          harga_satuan: 60000,
          alat_sekali_beli: false,
        },
      ];
      const siklusBaru = (luas: number, tanggal: string | null) =>
        K.kebun.buatSiklus({
          resep_id: 'resep-sawi-bedengan',
          lahan_id: 'lahan-arif-kebun',
          luas_m2: luas,
          satuan_asli: 'm2',
          nilai_asli: luas,
          tanggal_tanam: tanggal,
          dapat_subsidi: false,
          harga_jual: 5000,
          bagi_alat: false,
          jumlah_siklus_pembagian: 1,
          rencana_item: rencanaSawi(luas),
        });

      it('daftar dan detail siklus dengan modal dari modal.ts', async () => {
        const petak = (awalan: string, n: number) =>
          Array.from({ length: n }, (_, i) => `${awalan}-${i + 1}`);
        expect((await K.kebun.daftarSiklus()).map((s) => s.id).sort()).toEqual(
          [
            ...petak('siklus-arif-bayam', 4),
            'siklus-arif-hidro',
            'siklus-arif-kangkung',
            ...petak('siklus-arif-ratna', 12),
            'siklus-arif-sawi',
          ].sort(),
        );
        expect(await K.kebun.daftarSiklus({ status: 'selesai' })).toHaveLength(3);
        // Petak pesanan rutin membawa kelompok pesanannya (D-40); siklus biasa tidak.
        const semua = await K.kebun.daftarSiklus();
        expect(semua.find((s) => s.id === 'siklus-arif-ratna-3')).toMatchObject({
          petak_ke: 3,
          tanggal_tanam: '2026-10-06',
          kelompok_pesanan: {
            alokasi_id: 'alokasi-ratna-arif',
            nama_pembeli: 'Katering Bu Ratna',
            jumlah_petak: 12,
            status_alokasi: 'berjalan',
            tanggal_kirim: '2026-11-03',
          },
        });
        expect(semua.find((s) => s.id === 'siklus-arif-sawi')?.kelompok_pesanan).toBeNull();
        const d = await K.kebun.ambilSiklus('siklus-arif-sawi');
        expect(d).toMatchObject({
          hari_ke: 13,
          resep_contoh: true,
          perkiraan_tanggal_panen: '2026-10-20',
          perkiraan_panen_kg: 150,
        });
        expect(d.modal).toEqual({
          total_bahan: 430000,
          total_alat: 0,
          biaya_alat_per_siklus: 0,
          total_modal: 430000,
          lengkap: true,
          sudah_keluar: 217000,
        });
        const h = await K.kebun.ambilSiklus('siklus-arif-hidro');
        expect(h.modal).toMatchObject({ total_alat: 1500000, biaya_alat_per_siklus: 150000 });
        await harapGalat(K.kebun.ambilSiklus('siklus-dewi-padi'), 'TIDAK_DITEMUKAN', 404);
      });
      it('buat siklus: kapasitas dicek untuk siklus aktif (D-15), rencana tanpa pesanan tidak dihitung (D-34)', async () => {
        await harapGalat(siklusBaru(50, '2026-10-05'), 'LAHAN_TIDAK_CUKUP', 409);
        const rencana = await siklusBaru(50, null);
        expect(rencana.status).toBe('rencana');
        const aktif = await siklusBaru(20, '2026-10-05');
        expect(aktif).toMatchObject({ status: 'aktif', perkiraan_panen_kg: 30, hari_ke: 0 });
        expect((await K.kebun.daftarTugas(aktif.id)).length).toBe(42);
        // Lahan kini penuh: rencana 50 m² tidak bisa mulai ditanam.
        await harapGalat(
          K.kebun.ubahTanggalTanam(rencana.id, '2026-10-06'),
          'LAHAN_TIDAK_CUKUP',
          409,
        );
      });
      it('validasi buat siklus', async () => {
        await harapGalat(siklusBaru(0, null), 'LUAS_KOSONG', 422, 'luas_m2');
        await harapGalat(
          K.kebun.buatSiklus({
            resep_id: 'resep-sawi-bedengan',
            lahan_id: 'lahan-arif-kebun',
            luas_m2: 10,
            satuan_asli: 'm2',
            nilai_asli: 10,
            tanggal_tanam: null,
            dapat_subsidi: false,
            harga_jual: 5000,
            bagi_alat: false,
            jumlah_siklus_pembagian: 1,
            rencana_item: [
              {
                nama: 'X',
                grup: 'g',
                jumlah: 1,
                satuan: 'kg',
                harga_satuan: -5,
                alat_sekali_beli: false,
              },
            ],
          }),
          'HARGA_NEGATIF',
          422,
          'rencana_item',
        );
        await harapGalat(
          K.kebun.buatSiklus({
            resep_id: 'resep-sawi-hidroponik',
            lahan_id: 'lahan-arif-kebun',
            jumlah_lubang: 10,
            satuan_asli: 'lubang',
            nilai_asli: 10,
            tanggal_tanam: null,
            dapat_subsidi: false,
            harga_jual: 15000,
            bagi_alat: false,
            jumlah_siklus_pembagian: 1,
            rencana_item: [],
          }),
          'VALIDASI',
          422,
          'lahan_id',
        );
        await harapGalat(
          siklusBaru(10, null).then(() =>
            K.kebun.buatSiklus({
              resep_id: 'resep-sawi-bedengan',
              lahan_id: 'lahan-arif-kebun',
              luas_m2: 10,
              satuan_asli: 'm2',
              nilai_asli: 10,
              tanggal_tanam: null,
              dapat_subsidi: false,
              harga_jual: 0,
              bagi_alat: false,
              jumlah_siklus_pembagian: 1,
              rencana_item: [],
            }),
          ),
          'VALIDASI',
          422,
          'harga_jual',
        );
      });
      it('tugas hari ini: terlambat dan hari ini dari siklus aktif', async () => {
        const t = await K.kebun.tugasHariIni();
        // Petak Ratna yang belum ditanam (3 sampai 12) belum punya tugas hari ini.
        expect(t.map((x) => x.id).sort()).toEqual([
          'siklus-arif-bayam-3:panen@25',
          'siklus-arif-bayam-4:siram@18',
          'siklus-arif-hidro:ukur-ph-ppm@20',
          'siklus-arif-ratna-1:cek-daun@13',
          'siklus-arif-ratna-1:siram@13',
          'siklus-arif-ratna-2:siram@6',
          'siklus-arif-sawi:cek-daun@13',
          'siklus-arif-sawi:siangi@11',
          'siklus-arif-sawi:siram@13',
        ]);
      });
      it('selesaikan tugas dengan foto masuk jurnal; idempoten; tugas ukur lewat pengukuran', async () => {
        const k1 = kunci();
        const a = await K.kebun.selesaikanTugas('siklus-arif-sawi:siangi@11', {
          kunci_idempoten: k1,
          foto: 'data:image/jpeg;base64,AAAA',
        });
        expect(a).toMatchObject({ status: 'selesai', foto: 'data:image/jpeg;base64,AAAA' });
        expect(
          await K.kebun.selesaikanTugas('siklus-arif-sawi:siangi@11', { kunci_idempoten: k1 }),
        ).toEqual(a);
        expect((await K.kebun.jurnal('siklus-arif-sawi'))[0]).toMatchObject({
          tugas_id: 'siklus-arif-sawi:siangi@11',
          judul_tugas: 'Siangi rumput',
          hari_ke: 13,
        });
        await harapGalat(
          K.kebun.selesaikanTugas('siklus-arif-hidro:ukur-ph-ppm@20', { kunci_idempoten: kunci() }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
        await harapGalat(
          K.kebun.selesaikanTugas('siklus-dewi-padi:panen@110', { kunci_idempoten: kunci() }),
          'TIDAK_DITEMUKAN',
          404,
        );
      });
      it('tunda tugas: geser, tidak boleh digeser, perlu konfirmasi melewati panen (P0-15)', async () => {
        const r = await K.kebun.tundaTugas('siklus-arif-sawi:pupuk-2@14', { hari: 2 });
        expect(r.diterapkan).toBe(true);
        expect(r.tugas.find((t) => t.id === 'siklus-arif-sawi:pupuk-2@14')?.tanggal).toBe(
          '2026-10-08',
        );
        await harapGalat(
          K.kebun.tundaTugas('siklus-arif-sawi:panen@28', { hari: 1 }),
          'TIDAK_BOLEH_DIGESER',
          422,
        );
        await harapGalat(
          K.kebun.tundaTugas('siklus-arif-sawi:cek-hama@20', { hari: 4 }),
          'TUNDA_DI_LUAR_BATAS',
          422,
          'hari',
        );
        const tanpa = await K.kebun.tundaTugas('siklus-arif-sawi:cek-daun@28', { hari: 1 });
        expect(tanpa).toMatchObject({ diterapkan: false, perlu_konfirmasi: true });
        expect(tanpa.tugas.find((t) => t.id === 'siklus-arif-sawi:cek-daun@28')?.tanggal).toBe(
          '2026-10-20',
        );
        const dengan = await K.kebun.tundaTugas('siklus-arif-sawi:cek-daun@28', {
          hari: 1,
          konfirmasi: true,
        });
        expect(dengan.tugas.find((t) => t.id === 'siklus-arif-sawi:cek-daun@28')?.tanggal).toBe(
          '2026-10-21',
        );
      });
      it('pengukuran: PPM 0 terlalu rendah dan ukur ulang besok (D-34); di luar skala ditolak', async () => {
        const id = 'siklus-arif-hidro:ukur-ph-ppm@20';
        await harapGalat(
          K.kebun.catatPengukuran(id, {
            kunci_idempoten: kunci(),
            nilai: [
              { besaran: 'pH', nilai: 15 },
              { besaran: 'PPM', nilai: 1200 },
            ],
          }),
          'VALIDASI',
          422,
          'nilai.pH',
        );
        await harapGalat(
          K.kebun.catatPengukuran(id, {
            kunci_idempoten: kunci(),
            nilai: [{ besaran: 'pH', nilai: 6 }],
          }),
          'VALIDASI',
          422,
          'nilai.PPM',
        );
        const r = await K.kebun.catatPengukuran(id, {
          kunci_idempoten: kunci(),
          nilai: [
            { besaran: 'pH', nilai: 6 },
            { besaran: 'PPM', nilai: 0 },
          ],
        });
        expect(r.hasil.map((h) => [h.besaran, h.status])).toEqual([
          ['pH', 'normal'],
          ['PPM', 'terlalu-rendah'],
        ]);
        expect(r.tugas.status).toBe('selesai');
        expect(r.tugas_ukur_ulang).toMatchObject({
          tanggal: '2026-10-06',
          judul: 'Ukur ulang: Cek pH dan PPM',
          status: 'belum',
        });
        expect(await K.kebun.riwayatPengukuran('siklus-arif-hidro', 'PPM')).toHaveLength(7);
        await harapGalat(
          K.kebun
            .selesaikanTugas('siklus-arif-sawi:siram@13', { kunci_idempoten: kunci() })
            .then(() =>
              K.kebun.catatPengukuran('siklus-arif-sawi:siram@13', {
                kunci_idempoten: kunci(),
                nilai: [],
              }),
            ),
          'STATUS_TIDAK_SESUAI',
          409,
        );
      });
      it('pengeluaran dan jurnal', async () => {
        expect(await K.kebun.daftarPengeluaran('siklus-arif-sawi')).toHaveLength(4);
        const p = await K.kebun.catatPengeluaran('siklus-arif-sawi', {
          kunci_idempoten: kunci(),
          rencana_item_id: 'siklus-arif-sawi:npk',
          nama: 'NPK',
          nominal: 72000,
          tanggal: '2026-10-05',
        });
        expect(p.nominal).toBe(72000);
        expect((await K.kebun.ambilSiklus('siklus-arif-sawi')).modal.sudah_keluar).toBe(289000);
        await harapGalat(
          K.kebun.catatPengeluaran('siklus-arif-sawi', {
            kunci_idempoten: kunci(),
            nama: 'X',
            nominal: -1,
            tanggal: '2026-10-05',
          }),
          'VALIDASI',
          422,
          'nominal',
        );
        await harapGalat(
          K.kebun.tambahJurnal('siklus-arif-sawi', { tanggal: '2026-10-05' }),
          'VALIDASI',
          422,
          'catatan',
        );
        expect(
          (
            await K.kebun.tambahJurnal('siklus-arif-sawi', {
              tanggal: '2026-10-05',
              catatan: 'Hujan deras sore ini.',
            })
          ).hari_ke,
        ).toBe(13);
      });
      it('pengaturan pengingat (P0-38)', async () => {
        expect(await K.kebun.ambilPengingat('siklus-arif-sawi')).toMatchObject({
          jam_pagi: '06:00',
          pengingat_sore: true,
        });
        await harapGalat(
          K.kebun.ubahPengingat('siklus-arif-sawi', {
            jam_pagi: '08:00',
            pengingat_sore: true,
            tipe_aktif: { sekali: true, berulang: true, ukur: true },
          }),
          'VALIDASI',
          422,
          'jam_pagi',
        );
        expect(
          (
            await K.kebun.ubahPengingat('siklus-arif-sawi', {
              jam_pagi: '05:30',
              pengingat_sore: false,
              tipe_aktif: { sekali: true, berulang: false, ukur: true },
            })
          ).tipe_aktif.berulang,
        ).toBe(false);
      });
      it('ubah tanggal tanam: tugas selesai tidak berubah (P0-17); akhiri siklus (P0-18)', async () => {
        await K.kebun.ubahTanggalTanam('siklus-arif-sawi', '2026-09-24');
        const t = await K.kebun.daftarTugas('siklus-arif-sawi');
        expect(t.find((x) => x.id === 'siklus-arif-sawi:pupuk-1@7')?.tanggal).toBe('2026-09-29');
        expect(t.find((x) => x.id === 'siklus-arif-sawi:panen@28')?.tanggal).toBe('2026-10-22');
        const akhir = await K.kebun.akhiriSiklus('siklus-arif-sawi', { pendapatan_nyata: 700000 });
        expect(akhir).toMatchObject({ untung_sebenarnya: 483000, untung_rencana: 320000 });
        expect(akhir.siklus.status).toBe('selesai');
        await harapGalat(
          K.kebun.akhiriSiklus('siklus-arif-sawi', { pendapatan_nyata: 1 }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
      });
    });

    // ------------------------------------------------------------ belajar
    describe('belajar', () => {
      it('daftar modul dengan progres; tandai selesai', async () => {
        await masuk('petani-arif');
        const m = await K.belajar.daftarModul({ komoditas_id: 'sawi', metode_id: 'bedengan' });
        expect(m).toHaveLength(6);
        expect(m.filter((x) => x.selesai)).toHaveLength(3);
        expect((await K.belajar.tandaiSelesai('modul-sawi-bedengan-4')).selesai).toBe(true);
        expect((await K.belajar.ambilModul('modul-sawi-bedengan-2')).video_url).toBe(
          '/video/contoh/semai-sawi.webm',
        );
        await harapGalat(K.belajar.ambilModul('modul-x'), 'TIDAK_DITEMUKAN', 404);
      });
    });

    // ------------------------------------------------------------ pesanan (petani)
    describe('pesanan di sekitar dan ambil pesanan', () => {
      beforeEach(() => masuk('petani-arif'));
      it('hanya pesanan terbuka dalam radius, terdekat dulu, tanpa alamat (D-06)', async () => {
        const r = await K.pesanan.sekitar();
        expect(r.data.map((p) => p.id)).toEqual([
          'pesanan-ratna-sawi',
          'pesanan-koperasi-gabah',
          'pesanan-kafe-bayam',
        ]);
        expect(r.data[0]).toMatchObject({
          desa_antar: 'Cikahuripan',
          sisa_kg: 5,
          nama_pembeli: 'Katering Bu Ratna',
          uang_muka_diterima: true,
        });
        // Alamat hanya untuk petani yang sudah mengambil pesanan; titik yang dikirim hanya titik
        // tengah desa (D-06, D-39).
        expect(r.data[0]?.alokasi_saya).toMatchObject({ id: 'alokasi-ratna-arif' });
        expect(r.data[0]?.alamat_antar).toEqual(expect.any(String));
        for (const p of r.data.slice(1)) {
          expect(p).toMatchObject({ alokasi_saya: null, alamat_antar: null, patokan: null });
          expect(p.titik_desa_antar).toEqual({
            lintang: expect.any(Number),
            bujur: expect.any(Number),
          });
          expect(p.dibuat_pada).toMatch(/Z$/);
        }
        expect((await K.pesanan.sekitar({ radius_km: 25 })).data.map((p) => p.id)).toContain(
          'pesanan-lestari-kangkung',
        );
        expect((await K.pesanan.sekitar({ jenis: 'sekali_panen' })).data.map((p) => p.id)).toEqual([
          'pesanan-koperasi-gabah',
        ]);
        await harapGalat(K.pesanan.sekitar({ radius_km: 30 }), 'VALIDASI', 422, 'radius_km');
        await harapGalat(K.pesanan.ambil('pesanan-imas-sawi'), 'TIDAK_DITEMUKAN', 404);
        expect((await K.pesanan.ambil('pesanan-kafe-bayam')).jarak_km).toBeGreaterThan(5);
      });
      it('petani nonaktif tetap melihat daftar tetapi tidak bisa mengambil (D-13)', async () => {
        await masuk('petani-budi');
        expect((await K.pesanan.sekitar()).data.length).toBeGreaterThan(0);
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-kafe-bayam', {
            kunci_idempoten: kunci(),
            jumlah_kg: 1,
            lahan_id: 'lahan-budi-kebun',
          }),
          'AKUN_NONAKTIF',
          403,
        );
      });
      it('ambil melebihi sisa ditolak; lahan yang sama tidak bisa dipakai dua pesanan sebelum menanam (D-34)', async () => {
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-kafe-bayam', {
            kunci_idempoten: kunci(),
            jumlah_kg: 5,
            lahan_id: 'lahan-arif-kebun',
          }),
          'MELEBIHI_PESANAN',
          409,
          'jumlah_kg',
        );
        const k1 = kunci();
        const a = await K.pesanan.ambilPesanan('pesanan-kafe-bayam', {
          kunci_idempoten: k1,
          jumlah_kg: 4,
          lahan_id: 'lahan-arif-kebun',
        });
        expect(a.alokasi).toMatchObject({ status: 'menunggu_kesepakatan', jumlah_kg: 4 });
        expect(
          await K.pesanan.ambilPesanan('pesanan-kafe-bayam', {
            kunci_idempoten: k1,
            jumlah_kg: 4,
            lahan_id: 'lahan-arif-kebun',
          }),
        ).toEqual(a);
        // Tanam bertahap (D-40): satu petak per kiriman yang terkejar (kiriman 2 sampai 8), masing-masing
        // seluas satu panen (4 kg ÷ 1,2 = 3,34 m²) dengan tanggal tanamnya sendiri.
        expect(a.siklus_ids).toHaveLength(7);
        expect(a.alokasi.siklus_ids).toEqual(a.siklus_ids);
        const s = await K.kebun.ambilSiklus(a.siklus_ids[0]!);
        expect(s).toMatchObject({
          status: 'rencana',
          luas_m2: 3.34,
          petak_ke: 2,
          tanggal_tanam: '2026-10-08',
          harga_jual: 7000,
          alokasi_pesanan_id: a.alokasi.id,
        });
        expect((await K.kebun.ambilSiklus(a.siklus_ids[6]!)).tanggal_tanam).toBe('2026-11-19');
        // Kapasitas dari 4 petak yang tumbuh bersamaan (bayam 25 hari, kirim mingguan), bukan 7.
        expect(
          (await K.lahan.daftar()).find((l) => l.id === 'lahan-arif-kebun')?.kapasitas.sisa,
        ).toBe(31.62);
        const kecil = await K.lahan.buat({
          nama: 'Petak kecil',
          jenis_lahan: 'kebun',
          satuan_asli: 'm2',
          nilai_asli: 5,
          wilayah_id: '32.17.01.2003',
        });
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-lestari-kangkung', {
            kunci_idempoten: kunci(),
            jumlah_kg: 5,
            lahan_id: kecil.id,
          }),
          'LAHAN_TIDAK_CUKUP',
          409,
        );
        // Satu petani satu alokasi per pesanan (D-39).
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-ratna-sawi', {
            kunci_idempoten: kunci(),
            jumlah_kg: 1,
            lahan_id: 'lahan-arif-kebun',
          }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-koperasi-gabah', {
            kunci_idempoten: kunci(),
            jumlah_kg: 10,
            lahan_id: 'lahan-arif-hidro',
          }),
          'VALIDASI',
          422,
          'lahan_id',
        );
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-kafe-bayam', {
            kunci_idempoten: kunci(),
            jumlah_kg: 1,
            lahan_id: 'lahan-arif-kebun',
          }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-lestari-kangkung', {
            kunci_idempoten: kunci(),
            jumlah_kg: 1,
            lahan_id: 'lahan-dewi-sawah',
          }),
          'TIDAK_DITEMUKAN',
          404,
        );
      });
      it('jumlah bisa diubah sebelum setuju; petak dibuat ulang (D-40)', async () => {
        const a = await K.pesanan.ambilPesanan('pesanan-kafe-bayam', {
          kunci_idempoten: kunci(),
          jumlah_kg: 4,
          lahan_id: 'lahan-arif-kebun',
        });
        await harapGalat(
          K.pesanan.ubahAlokasi(a.alokasi.id, { jumlah_kg: 5 }),
          'MELEBIHI_PESANAN',
          409,
          'jumlah_kg',
        );
        const u = await K.pesanan.ubahAlokasi(a.alokasi.id, { jumlah_kg: 2 });
        expect(u.alokasi.jumlah_kg).toBe(2);
        expect(u.siklus_ids).toHaveLength(7);
        expect((await K.kebun.ambilSiklus(u.siklus_ids[0]!)).luas_m2).toBe(1.67);
        await harapGalat(K.kebun.ambilSiklus(a.siklus_ids[0]!), 'TIDAK_DITEMUKAN', 404);
        expect((await K.pesanan.ambil('pesanan-kafe-bayam')).sisa_kg).toBe(2);
        await K.pesanan.setujuiKesepakatan(a.alokasi.id);
        await harapGalat(
          K.pesanan.ubahAlokasi(a.alokasi.id, { jumlah_kg: 3 }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
      });
      it('pesanan yang jadwal kirimnya tidak terkejar umur panen ditolak (D-39)', async () => {
        const sawah = await K.lahan.buat({
          nama: 'Sawah baru',
          jenis_lahan: 'sawah',
          satuan_asli: 'm2',
          nilai_asli: 5000,
          wilayah_id: '32.17.01.2003',
        });
        // Gabah dikirim pertengahan Desember; padi 110 hari baru panen akhir Januari.
        await harapGalat(
          K.pesanan.ambilPesanan('pesanan-koperasi-gabah', {
            kunci_idempoten: kunci(),
            jumlah_kg: 100,
            lahan_id: sawah.id,
          }),
          'JADWAL_TERLALU_DEKAT',
          409,
        );
      });
      it('kesepakatan membuat jadwal kiriman; gagal panen mengembalikan uang muka bagian itu (D-03)', async () => {
        const a = await K.pesanan.ambilPesanan('pesanan-kafe-bayam', {
          kunci_idempoten: kunci(),
          jumlah_kg: 4,
          lahan_id: 'lahan-arif-kebun',
        });
        const setuju = await K.pesanan.setujuiKesepakatan(a.alokasi.id);
        expect(setuju.status).toBe('disepakati');
        await harapGalat(K.pesanan.setujuiKesepakatan(a.alokasi.id), 'STATUS_TIDAK_SESUAI', 409);
        const kiriman = (await K.kiriman.saya()).filter((k) => k.alokasi_id === a.alokasi.id);
        // Bayam 25 hari: kiriman 26 Oktober belum terkejar, bagian petani mulai kiriman ke-2 (D-39).
        expect(kiriman).toHaveLength(7);
        expect(kiriman[0]).toMatchObject({
          ke: 2,
          tanggal_jadwal: '2026-11-02',
          jumlah_kg: 4,
          status: 'terjadwal',
        });
        // Jadwal tanam masuk ke kebun: siklus aktif, ditanam umur panen sebelum kiriman pertama.
        expect(await K.kebun.ambilSiklus(a.siklus_ids[0]!)).toMatchObject({
          status: 'aktif',
          tanggal_tanam: '2026-10-08',
        });
        // Tiap petak punya jadwal perawatannya sendiri, mulai dari tanggal tanamnya.
        const tugas2 = await K.kebun.daftarTugas(a.siklus_ids[1]!);
        expect(tugas2.length).toBeGreaterThan(0);
        expect((await K.kebun.ambilSiklus(a.siklus_ids[1]!)).tanggal_tanam).toBe('2026-10-15');
        expect(tugas2.every((x) => x.tanggal >= '2026-10-15')).toBe(true);
        expect(tugas2.map((x) => x.tanggal).sort()[0]).toBe('2026-10-16');
        expect(setuju.siklus_ids).toHaveLength(7);
        expect((await K.pesanan.alokasiSaya()).some((x) => x.id === a.alokasi.id)).toBe(true);
        await harapGalat(
          K.pesanan.laporGagalPanen(a.alokasi.id, { pengiriman_id: kiriman[0]!.id, alasan: '' }),
          'VALIDASI',
          422,
          'alasan',
        );
        const g = await K.pesanan.laporGagalPanen(a.alokasi.id, {
          pengiriman_id: kiriman[0]!.id,
          alasan: 'Diserang ulat',
        });
        expect(g).toMatchObject({ tepat_waktu: true, dikembalikan: 5600, catatan_profil: false });
        expect((await K.kiriman.ambil(kiriman[0]!.id)).status).toBe('gagal');
      });
    });

    // ------------------------------------------------------------ kiriman
    describe('kiriman dan konfirmasi (D-01, D-02, D-14)', () => {
      it('foto kualitas wajib; dikirim menahan bagian pembeli 80%', async () => {
        await masuk('petani-arif');
        await harapGalat(K.kiriman.tandaiDikirim('kiriman-ratna-arif-1'), 'FOTO_WAJIB', 422);
        await K.kiriman.unggahFotoKualitas('kiriman-ratna-arif-1', 'data:image/jpeg;base64,AAAA');
        // Foto timbangan opsional (D-40): bisa diisi dan dihapus.
        expect(
          (await K.kiriman.unggahFotoTimbangan('kiriman-ratna-arif-1', 'data:image/jpeg;base64,BB'))
            .foto_timbangan,
        ).toBe('data:image/jpeg;base64,BB');
        expect(
          (await K.kiriman.unggahFotoTimbangan('kiriman-ratna-arif-1', null)).foto_timbangan,
        ).toBeNull();
        const x = await K.kiriman.tandaiDikirim('kiriman-ratna-arif-1');
        expect(x).toMatchObject({
          status: 'dikirim',
          dikirim_pada: '2026-10-05T01:00:00.000Z',
          batas_periksa_pada: '2026-10-05T07:00:00.000Z',
        });
        await masuk('pembeli-ratna');
        const bayar = await K.pembeli.pembayaran();
        expect(bayar.data.find((b) => b.pengiriman_id === x.id)).toMatchObject({
          jenis: 'kiriman',
          nominal: 40000,
          status: 'ditahan',
          mode_uji_coba: true,
        });
        expect(bayar.data[0]?.referensi).toMatch(/^TIRUAN-/);
      });
      it('akses kiriman: pembeli lain → 404; petani tidak bisa mengonfirmasi → 403', async () => {
        await masuk('pembeli-ratna');
        await harapGalat(K.kiriman.ambil('kiriman-imas-arif-3'), 'TIDAK_DITEMUKAN', 404);
        await masuk('petani-arif');
        await harapGalat(
          K.kiriman.konfirmasi('kiriman-imas-arif-3', {
            kunci_idempoten: kunci(),
            keputusan: 'terima_semua',
          }),
          'TIDAK_DIIZINKAN',
          403,
        );
      });
      it('terima semua: dana cair = nilai diterima, 20% dari saldo uang muka', async () => {
        await masuk('pembeli-imas');
        await harapGalat(
          K.kiriman.konfirmasi('kiriman-imas-arif-3', {
            kunci_idempoten: kunci(),
            keputusan: 'tolak_sebagian',
            jumlah_ditolak_kg: 1,
            alasan_penolakan: 'lainnya',
          }),
          'KETERANGAN_WAJIB',
          422,
          'keterangan_penolakan',
        );
        const k1 = kunci();
        const r = await K.kiriman.konfirmasi('kiriman-imas-arif-3', {
          kunci_idempoten: k1,
          keputusan: 'terima_semua',
        });
        expect(r.pengiriman).toMatchObject({
          status: 'diterima',
          nilai_diterima: 30000,
          dianggap_diterima: false,
        });
        expect(r.pembayaran.map((b) => [b.jenis, b.nominal])).toEqual([
          ['pencairan', 24000],
          ['pencairan', 6000],
        ]);
        expect(r.sengketa).toBeNull();
        expect(
          await K.kiriman.konfirmasi('kiriman-imas-arif-3', {
            kunci_idempoten: k1,
            keputusan: 'terima_semua',
          }),
        ).toEqual(r);
        await harapGalat(
          K.kiriman.konfirmasi('kiriman-imas-arif-3', {
            kunci_idempoten: kunci(),
            keputusan: 'terima_semua',
          }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
        expect(
          (await K.pembeli.pesananSaya()).find((p) => p.id === 'pesanan-imas-bayam')
            ?.saldo_uang_muka,
        ).toBe(7200);
      });
      it('tolak sebagian: sengketa dibuat, bagian ditolak tetap ditahan', async () => {
        await masuk('petani-arif');
        await K.kiriman.unggahFotoKualitas('kiriman-ratna-arif-1', 'data:image/jpeg;base64,AAAA');
        await K.kiriman.tandaiDikirim('kiriman-ratna-arif-1');
        await masuk('pembeli-ratna');
        const r = await K.kiriman.konfirmasi('kiriman-ratna-arif-1', {
          kunci_idempoten: kunci(),
          keputusan: 'tolak_sebagian',
          jumlah_ditolak_kg: 2,
          alasan_penolakan: 'jumlah_kurang',
        });
        expect(r.pengiriman).toMatchObject({
          status: 'ditolak_sebagian',
          jumlah_ditolak_kg: 2,
          nilai_diterima: 40000,
          alasan_penolakan: 'jumlah_kurang',
        });
        expect(r.pembayaran.map((b) => b.nominal)).toEqual([32000, 8000]);
        expect(r.sengketa).toMatchObject({ status: 'terbuka' });
        await harapGalat(
          K.kiriman.konfirmasi('kiriman-ratna-arif-1', {
            kunci_idempoten: kunci(),
            keputusan: 'tolak_sebagian',
            jumlah_ditolak_kg: 20,
            alasan_penolakan: 'jumlah_kurang',
          }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
      });
      it('lewat batas periksa 6 jam → dianggap diterima (D-01)', async () => {
        if (!L.majukanJam) return;
        await masuk('pembeli-imas');
        expect((await K.kiriman.ambil('kiriman-imas-arif-3')).status).toBe('dikirim');
        L.majukanJam(5 * JAM);
        const x = await K.kiriman.ambil('kiriman-imas-arif-3');
        expect(x).toMatchObject({
          status: 'diterima',
          dianggap_diterima: true,
          nilai_diterima: 30000,
        });
      });
      it('rating dua arah sekali per kiriman (P0-28)', async () => {
        await masuk('petani-arif');
        await harapGalat(
          K.kiriman.beriRating('kiriman-imas-arif-4', { nilai: 5 }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
        await harapGalat(
          K.kiriman.beriRating('kiriman-imas-arif-1', { nilai: 5 }),
          'SUDAH_DINILAI',
          409,
        );
        await masuk('pembeli-imas');
        await K.kiriman.konfirmasi('kiriman-imas-arif-3', {
          kunci_idempoten: kunci(),
          keputusan: 'terima_semua',
        });
        await harapGalat(
          K.kiriman.beriRating('kiriman-imas-arif-3', { nilai: 6 }),
          'VALIDASI',
          422,
          'nilai',
        );
        expect((await K.kiriman.ambil('kiriman-imas-arif-3')).rating_saya).toBeNull();
        expect(
          await K.kiriman.beriRating('kiriman-imas-arif-3', { nilai: 4, komentar: 'Baik' }),
        ).toMatchObject({ penerima_id: 'petani-arif', nilai: 4 });
        // Nilai yang sudah diberikan ikut terbaca, supaya halaman tidak menawarkan rating lagi.
        expect((await K.kiriman.ambil('kiriman-imas-arif-3')).rating_saya).toBe(4);
        expect(await K.kiriman.ringkasanRating('petani-arif')).toEqual({
          pengguna_id: 'petani-arif',
          rata_rata: 4.5,
          jumlah: 2,
        });
      });
    });

    // ------------------------------------------------------------ pembeli
    describe('pembeli', () => {
      it('dasbor: kebun pemenuh tanpa titik lahan (D-06)', async () => {
        await masuk('pembeli-ratna');
        const d = await K.pembeli.pesananSaya();
        expect(d).toHaveLength(1);
        expect(d[0]?.kebun).toEqual([
          expect.objectContaining({
            nama_petani: 'Arif Setiawan',
            desa: 'Lembang',
            jumlah_kg: 10,
            hari_ke: 13,
            hari_panen: 28,
          }),
        ]);
        expect(JSON.stringify(d[0]?.kebun)).not.toMatch(/lintang|bujur/);
        expect(d[0]?.kiriman_berikutnya?.tanggal_jadwal).toBe('2026-10-20');
      });
      it('pembeli belum terverifikasi tidak bisa memasang pesanan (P0-02)', async () => {
        await masuk('pembeli-baru');
        await harapGalat(
          K.pembeli.buatPesanan({
            jenis: 'sekali_panen',
            komoditas_id: 'padi',
            jumlah_total_kg: 100,
            perkiraan_bulan_panen: '2027-01',
            harga_per_kg: 6500,
            standar_kualitas: [],
            wilayah_id: '32.17.01.2003',
            alamat_antar: 'x',
          }),
          'BELUM_TERVERIFIKASI',
          403,
        );
      });
      it('buat, bayar uang muka (idempoten), batalkan; nominal dari pesanan-nilai.ts', async () => {
        await masuk('pembeli-ratna');
        const dasar = {
          komoditas_id: 'sawi',
          jumlah_per_kiriman_kg: 5,
          frekuensi_hari: 7,
          tanggal_mulai: '2026-10-20',
          harga_per_kg: 5000,
          standar_kualitas: ['Segar'],
          wilayah_id: '32.17.01.2002',
          alamat_antar: 'Jl. Contoh 2',
        };
        await harapGalat(
          K.pembeli.buatPesanan({
            jenis: 'rutin',
            ...dasar,
            komoditas_id: 'cabai',
            durasi_hari: 28,
          }),
          'VALIDASI',
          422,
          'komoditas_id',
        );
        await harapGalat(
          K.pembeli.buatPesanan({
            jenis: 'rutin',
            ...dasar,
            durasi_hari: 28,
            batas_jam_antar: '7',
          }),
          'VALIDASI',
          422,
          'batas_jam_antar',
        );
        await harapGalat(
          K.pembeli.buatPesanan({ jenis: 'rutin', ...dasar, durasi_hari: 120 }),
          'FREKUENSI_TIDAK_VALID',
          422,
          'durasi_hari',
        );
        const p = await K.pembeli.buatPesanan({
          jenis: 'rutin',
          ...dasar,
          durasi_hari: 28,
          batas_jam_antar: '07:00',
        });
        expect(p).toMatchObject({
          batas_jam_antar: '07:00',
          jumlah_kiriman: 4,
          nilai_pesanan: 100000,
          uang_muka: 20000,
          biaya_layanan: 5000,
          status: 'menunggu_pembayaran',
        });
        // Mode uji coba (D-41): gagal tidak membuat pesanan aktif; menunggu lalu berhasil.
        await harapGalat(
          K.pembeli.bayarUangMuka(p.id, { kunci_idempoten: kunci(), simulasi: 'gagal' }),
          'PEMBAYARAN_GAGAL',
          402,
        );
        const tunggu = await K.pembeli.bayarUangMuka(p.id, {
          kunci_idempoten: kunci(),
          simulasi: 'menunggu',
        });
        expect(tunggu.map((x) => [x.jenis, x.status])).toEqual([['uang_muka', 'menunggu']]);
        expect((await K.pembeli.pesananSaya()).find((x) => x.id === p.id)?.status).toBe(
          'menunggu_pembayaran',
        );
        const k1 = kunci();
        const b = await K.pembeli.bayarUangMuka(p.id, { kunci_idempoten: k1 });
        expect(b.map((x) => [x.jenis, x.nominal, x.status])).toEqual([
          ['uang_muka', 20000, 'ditahan'],
          ['biaya_layanan', 5000, 'cair'],
        ]);
        expect(await K.pembeli.bayarUangMuka(p.id, { kunci_idempoten: k1 })).toEqual(b);
        // Baris "menunggu" diperbarui menjadi ditahan; baris gagal tetap tercatat.
        const semuaBayar = (await K.pembeli.pembayaran()).data.filter((x) => x.pesanan_id === p.id);
        expect(semuaBayar.map((x) => [x.jenis, x.status]).sort()).toEqual(
          [
            ['biaya_layanan', 'cair'],
            ['uang_muka', 'ditahan'],
            ['uang_muka', 'gagal'],
          ].sort(),
        );
        await harapGalat(
          K.pembeli.bayarUangMuka(p.id, { kunci_idempoten: kunci() }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
        const batal = await K.pembeli.batalkan(p.id);
        expect(batal).toMatchObject({ kompensasi_petani: 0, dikembalikan_ke_pembeli: 20000 });
        expect(batal.pesanan.status).toBe('dibatalkan');
        expect((await K.pembeli.pembayaran({ per_halaman: 2 })).meta).toMatchObject({
          per_halaman: 2,
          halaman: 1,
        });
        await harapGalat(K.pembeli.batalkan('pesanan-imas-bayam'), 'TIDAK_DITEMUKAN', 404);
      });
      it('batal setelah petani menanam: uang muka menjadi kompensasi petani (P0-27)', async () => {
        await masuk('pembeli-ratna');
        expect(await K.pembeli.batalkan('pesanan-ratna-sawi')).toMatchObject({
          kompensasi_petani: 180000,
          dikembalikan_ke_pembeli: 0,
        });
      });
    });

    // ------------------------------------------------------------ admin
    describe('admin', () => {
      beforeEach(() => masuk('admin-tani'));
      it('verifikasi pembeli', async () => {
        expect((await K.admin.pembeliMenunggu()).map((p) => p.nama_usaha)).toEqual([
          'Kedai Sayur Pagi',
        ]);
        await harapGalat(
          K.admin.verifikasiPembeli('pembeli-baru', { keputusan: 'ditolak' }),
          'VALIDASI',
          422,
          'alasan',
        );
        expect(
          (await K.admin.verifikasiPembeli('pembeli-baru', { keputusan: 'terverifikasi' }))
            .status_verifikasi,
        ).toBe('terverifikasi');
        expect(await K.admin.pembeliMenunggu()).toEqual([]);
      });
      it('putus sengketa: cairkan ke petani melunasi bagian yang ditolak', async () => {
        const s = await K.admin.sengketa({ status: 'terbuka' });
        expect(s).toHaveLength(1);
        expect(s[0]).toMatchObject({
          nama_petani: 'Arif Setiawan',
          nama_pembeli: 'Warung Nasi Bu Imas',
        });
        const r = await K.admin.putuskanSengketa(s[0]!.id, {
          keputusan: 'cairkan_ke_petani',
          catatan: 'Foto menunjukkan daun masih segar',
        });
        expect(r).toMatchObject({ status: 'diputuskan', keputusan: 'cairkan_ke_petani' });
        expect(r.pengiriman.nilai_diterima).toBe(30000);
        await harapGalat(
          K.admin.putuskanSengketa(s[0]!.id, { keputusan: 'kembalikan_ke_pembeli' }),
          'STATUS_TIDAK_SESUAI',
          409,
        );
      });
      it('daftar petani untuk admin: cari, paginasi, tanpa nomor HP (D-46, D-47)', async () => {
        const h = await K.admin.daftarPetani();
        const d = h.data;
        expect(h.meta).toMatchObject({ halaman: 1, total: 5 });
        expect(d[0]).toEqual({
          id: 'petani-budi',
          nama: 'Budi Santoso',
          desa: expect.any(String),
          status_akun: 'dinonaktifkan_sementara',
          jumlah_catatan: 1,
          siklus_aktif: expect.any(Number),
        });
        expect(d.map((x) => x.id)).toContain('petani-arif');
        expect(JSON.stringify(d)).not.toContain('nomor_hp');
        // Cari nama atau desa, tidak peka huruf besar.
        expect((await K.admin.daftarPetani({ cari: 'budi' })).data.map((x) => x.id)).toEqual([
          'petani-budi',
        ]);
        const desa = d.find((x) => x.id === 'petani-arif')!.desa!;
        expect(
          (await K.admin.daftarPetani({ cari: desa.toUpperCase() })).data.map((x) => x.id),
        ).toContain('petani-arif');
        expect((await K.admin.daftarPetani({ cari: 'tidak-ada' })).data).toEqual([]);
        // Paginasi.
        const h2 = await K.admin.daftarPetani({ per_halaman: 2, halaman: 2 });
        expect(h2.data).toHaveLength(2);
        expect(h2.meta).toMatchObject({
          halaman: 2,
          per_halaman: 2,
          total: 5,
          halaman_terakhir: 3,
        });
        expect(h2.data[0]!.id).toBe(d[2]!.id);
        await masuk('petani-arif');
        await harapGalat(K.admin.daftarPetani(), 'TIDAK_DIIZINKAN', 403);
      });
      it('catatan dan status petani (D-03, D-13)', async () => {
        expect((await K.admin.petani('petani-budi')).catatan).toHaveLength(1);
        await harapGalat(
          K.admin.tulisCatatan('petani-budi', { jenis: 'lainnya', isi: '' }),
          'VALIDASI',
          422,
          'isi',
        );
        await K.admin.tulisCatatan('petani-budi', {
          jenis: 'lainnya',
          isi: 'Sudah dihubungi lewat telepon.',
        });
        expect(
          (await K.admin.ubahStatusPetani('petani-budi', { status_akun: 'aktif' })).pengguna
            .status_akun,
        ).toBe('aktif');
        await harapGalat(K.admin.petani('pembeli-ratna'), 'TIDAK_DITEMUKAN', 404);
      });
    });

    // ------------------------------------------------------------ mentor
    describe('mentor', () => {
      beforeEach(() => masuk('mentor-rahmat'));
      it('simpan resep menjadi versi baru, validasi; siklus lama tetap versi lama (P0-04)', async () => {
        const semua = await K.mentor.daftarResep();
        expect(semua).toHaveLength(5);
        const lama = semua.find((r) => r.id === 'resep-sawi-bedengan')!;
        const {
          id: _i,
          versi: _v,
          status: _s,
          validator: _va,
          tanggal_validasi: _t,
          contoh: _c,
          asal_angka_contoh: _a,
          ...isi
        } = lama;
        const baru = await K.mentor.simpanResep({
          ...isi,
          hasil_per_satuan: 1.6,
          resep_asal_id: lama.id,
        });
        expect(baru).toMatchObject({
          versi: 2,
          status: 'draf',
          contoh: false,
          hasil_per_satuan: 1.6,
        });
        await harapGalat(K.mentor.validasiResep('resep-sawi-bedengan'), 'STATUS_TIDAK_SESUAI', 409);
        expect(await K.mentor.validasiResep(baru.id)).toMatchObject({
          status: 'divalidasi',
          validator: 'Rahmat Hidayat',
          tanggal_validasi: '2026-10-05',
        });
        await harapGalat(
          K.mentor.simpanResep({ ...isi, tugas: [{ ...isi.tugas[0]!, hst_mulai: 40 }] }),
          'VALIDASI',
          422,
          'tugas',
        );
        await masuk('petani-arif');
        expect((await K.resep.daftar({ komoditas_id: 'sawi', metode_id: 'bedengan' }))[0]?.id).toBe(
          baru.id,
        );
        expect((await K.kebun.ambilSiklus('siklus-arif-sawi')).resep_versi).toBe(1);
      });
      it('simpan resep ditolak bila angka tidak masuk akal (validasi-resep.ts)', async () => {
        const lama = (await K.mentor.daftarResep()).find((r) => r.id === 'resep-sawi-hidroponik')!;
        const {
          id: _i,
          versi: _v,
          status: _s,
          validator: _va,
          tanggal_validasi: _t,
          contoh: _c,
          asal_angka_contoh: _a,
          ...isi
        } = lama;
        const iUkur = isi.tugas.findIndex((t) => t.tipe === 'ukur');
        const tugas = isi.tugas.map((t, i) =>
          i === iUkur
            ? {
                ...t,
                ukur: t.ukur!.map((b, k) =>
                  k === 0 ? { ...b, batas_bawah: 9, batas_atas: 6 } : b,
                ),
              }
            : t,
        );
        const g = await harapGalat(
          K.mentor.simpanResep({ ...isi, tugas, umur_panen_hari: 0, persen_panen_jelek: 150 }),
          'VALIDASI',
          422,
        );
        expect(Object.keys(g.rincian).sort()).toEqual([
          'persen_panen_jelek',
          'tugas',
          'umur_panen_hari',
        ]);
        expect((await K.mentor.daftarResep()).length).toBe(5);
      });
      it('ringkasan permintaan resep terbanyak', async () => {
        expect((await K.mentor.ringkasanPermintaan())[0]).toEqual({
          komoditas_id: 'cabai',
          metode_id: 'bedengan',
          kecamatan: 'Lembang',
          jumlah: 2,
        });
      });
    });

    // ------------------------------------------------------------ notifikasi dan berkas
    describe('notifikasi dan berkas', () => {
      beforeEach(() => masuk('petani-arif'));
      it('simpan dan hapus langganan', async () => {
        await harapGalat(
          K.notifikasi.simpanLangganan({ endpoint: '', keys: { p256dh: 'a', auth: 'b' } }),
          'VALIDASI',
          422,
          'endpoint',
        );
        await K.notifikasi.simpanLangganan({
          endpoint: 'https://push.contoh/1',
          keys: { p256dh: 'a', auth: 'b' },
        });
        await K.notifikasi.hapusLangganan('https://push.contoh/1');
      });
      it('unggah foto: jenis dan ukuran divalidasi', async () => {
        const b = await K.berkas.unggah({
          nama: 'a.jpg',
          jenis: 'image/jpeg',
          isi: 'data:image/jpeg;base64,' + 'A'.repeat(100),
        });
        expect(b).toMatchObject({ jenis: 'image/jpeg', ukuran_byte: 75 });
        expect(b.url.length).toBeGreaterThan(0);
        await harapGalat(
          K.berkas.unggah({
            nama: 'a.pdf',
            jenis: 'application/pdf',
            isi: 'data:application/pdf;base64,AAAA',
          }),
          'VALIDASI',
          422,
          'jenis',
        );
        await harapGalat(
          K.berkas.unggah({
            nama: 'b.jpg',
            jenis: 'image/jpeg',
            isi: 'data:image/jpeg;base64,' + 'A'.repeat(3 * 1024 * 1024),
          }),
          'VALIDASI',
          422,
          'isi',
        );
      });
    });
  });
}
